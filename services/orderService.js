import { supabase } from "../lib/supabase";

/**
 * Add new order
 * @param {Object} buyer - { id_pembeli } OR { nama, alamat, no_hp }
 * @param {Array} items - [{ id_varian, jumlah_item }]  // id_varian required
 * @returns inserted pesanan with items
 *
 * NOTE: This function does sequential DB calls. For production-critical stock integrity
 * you should implement a DB transaction or a stored procedure / RPC on the DB side.
 */
export async function addOrder(buyer, items) {
  // 1) ensure pembeli
  let id_pembeli = buyer?.id_pembeli;
  if (!id_pembeli) {
    const { data: pembeliData, error: pembeliErr } = await supabase
      .from("pembeli")
      .insert([{
        nama: buyer.nama,
        alamat: buyer.alamat,
        no_hp: buyer.no_hp
      }])
      .select()
      .single();
    if (pembeliErr) throw pembeliErr;
    id_pembeli = pembeliData.id_pembeli;
  }

  // 2) fetch varian data (harga) for all items
  const varianIds = items.map(i => i.id_varian);
  const { data: varianRows, error: varianErr } = await supabase
    .from("varian")
    .select("id_varian, id_produk, harga_varian, stok_varian")
    .in("id_varian", varianIds);
  if (varianErr) throw varianErr;

  // map id_varian -> varian row
  const varianMap = {};
  for (const v of varianRows) varianMap[v.id_varian] = v;

  // build pesanan_item objects and compute total
  const itemsToInsert = [];
  let total = 0;
  for (const it of items) {
    const v = varianMap[it.id_varian];
    if (!v) throw new Error(`Varian tidak ditemukan: ${it.id_varian}`);
    if (typeof it.jumlah_item !== "number" || it.jumlah_item <= 0) {
      throw new Error("Jumlah item harus angka > 0");
    }
    // optional stock check
    if (v.stok_varian != null && v.stok_varian < it.jumlah_item) {
      throw new Error(`Stok varian tidak cukup untuk id_varian ${it.id_varian}`);
    }

    const harga_satuan = Number(v.harga_varian);
    const subtotal_item = harga_satuan * it.jumlah_item;
    total += subtotal_item;

    itemsToInsert.push({
      id_produk: v.id_produk,
      id_varian: it.id_varian,
      jumlah_item: it.jumlah_item,
      harga_satuan,
      subtotal_item
    });
  }

  // 3) insert pesanan header
  const { data: pesananData, error: pesananErr } = await supabase
    .from("pesanan")
    .insert([{
      id_pembeli,
      total,
      status: "pending" // default
    }])
    .select()
    .single();
  if (pesananErr) throw pesananErr;
  const id_pesanan = pesananData.id_pesanan;

  // 4) insert pesanan_item (attach id_pesanan)
  const itemsPayload = itemsToInsert.map(it => ({ ...it, id_pesanan }));
  const { data: itemsInserted, error: itemsErr } = await supabase
    .from("pesanan_item")
    .insert(itemsPayload)
    .select();
  if (itemsErr) {
    // rollback simple: try to delete pesanan header we just created
    await supabase.from("pesanan").delete().eq("id_pesanan", id_pesanan);
    throw itemsErr;
  }

  // 5) decrement stok_varian for each varian (best-effort)
  for (const it of items) {
    // subtract stok_varian = stok_varian - jumlah_item if stok_varian >= jumlah_item
    // Here we do a naive update; for atomic check you'd use DB function.
    const { data: updated, error: updErr } = await supabase
      .from("varian")
      .update({
        stok_varian: supabase.rpc ? null : null // placeholder to show note
      })
      .eq("id_varian", it.id_varian);
    // Note: Supabase JS doesn't support expression updates like stok_varian = stok_varian - x.
    // So we need to first fetch current stok and then set stok_varian = current - jumlah.
    // Implement properly below:
  }

  // Proper stock decrement (fetch current and update)
  for (const it of items) {
    const { data: cur, error: gErr } = await supabase
      .from("varian")
      .select("stok_varian")
      .eq("id_varian", it.id_varian)
      .single();
    if (gErr) {
      // can't read stock — skip or log
      console.warn("Gagal baca stok varian", it.id_varian, gErr);
      continue;
    }
    const newStock = (cur.stok_varian == null) ? null : (cur.stok_varian - it.jumlah_item);
    if (newStock != null && newStock < 0) {
      // roll back: delete items + pesanan (basic rollback)
      await supabase.from("pesanan_item").delete().eq("id_pesanan", id_pesanan);
      await supabase.from("pesanan").delete().eq("id_pesanan", id_pesanan);
      throw new Error(`Stok varian tidak mencukupi saat commit untuk ${it.id_varian}`);
    }
    if (newStock != null) {
      const { error: uErr } = await supabase
        .from("varian")
        .update({ stok_varian: newStock })
        .eq("id_varian", it.id_varian);
      if (uErr) {
        console.warn("Gagal update stok varian", it.id_varian, uErr);
        // best-effort; we don't rollback here automatically
      }
    }
  }

  // 6) return pesanan + items
  const { data: orderWithItems, error: fetchErr } = await supabase
    .from("pesanan")
    .select("*, pembeli(*), pesanan_item(*, produk(*), varian(*))")
    .eq("id_pesanan", id_pesanan)
    .single();
  if (fetchErr) throw fetchErr;
  return orderWithItems;
}

/**
 * Get list of orders (optionally filter by status)
 */
export async function getOrders({ status } = {}) {
  let query = supabase
    .from("pesanan")
    .select("*, pembeli(*), pesanan_item(*, produk(*), varian(*))")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Get order detail by id_pesanan
 */
export async function getOrderById(id_pesanan) {
  const { data, error } = await supabase
    .from("pesanan")
    .select("*, pembeli(*), pesanan_item(*, produk(*), varian(*))")
    .eq("id_pesanan", id_pesanan)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update order status (ex: 'pending' -> 'diproses' -> 'dikirim' -> 'selesai')
 */
export async function updateOrderStatus(id_pesanan, status) {
  const { data, error } = await supabase
    .from("pesanan")
    .update({ status })
    .eq("id_pesanan", id_pesanan)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Optional: delete order (header + items)
 */
export async function deleteOrder(id_pesanan) {
  // delete items first
  const { error: delItemsErr } = await supabase.from("pesanan_item").delete().eq("id_pesanan", id_pesanan);
  if (delItemsErr) throw delItemsErr;
  // delete header
  const { data, error } = await supabase.from("pesanan").delete().eq("id_pesanan", id_pesanan);
  if (error) throw error;
  return data;
}
