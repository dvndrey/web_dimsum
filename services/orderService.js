import { supabase } from "../lib/supabase";

/**
 * Simpan data pembeli, buat pesanan, dan simpan item pesanan + add-ons
 * @param {Object} pembeliData - { nama_pembeli, alamat_pembeli, nomer_pembeli }
 * @param {Array} cartItems - [{
 *    id_produk,
 *    id_varian,
 *    jumlah_item,
 *    harga_satuan,
 *    add_ons: [{ id_add_on, qty, harga_add_on }]
 * }]
 */

export async function createOrder(pembeliData, cartItems) {
  const { nama_pembeli, alamat_pembeli, nomer_pembeli } = pembeliData;

  // ============================================================
  // 1. Selalu buat pembeli baru (nomor HP boleh duplikat)
  // ============================================================
  const { data: newPembeli, error: insertPembeliError } = await supabase
    .from("pembeli")
    .insert([{ nama_pembeli, alamat_pembeli, nomer_pembeli }])
    .select("id_pembeli")
    .single();

  if (insertPembeliError) throw insertPembeliError;

  const id_pembeli = newPembeli.id_pembeli;

  // ============================================================
  // 2. Hitung total harga (produk + varian + add-ons)
  // ============================================================
  const total_harga = cartItems.reduce((sum, item) => {
    const base = item.harga_satuan * item.jumlah_item;

    const addons = item.add_ons
      ? item.add_ons.reduce((a, add) => a + add.harga_add_on * add.qty, 0)
      : 0;

    return sum + base + addons;
  }, 0);

  // ============================================================
  // 3. Buat pesanan
  // ============================================================
  const { data: newPesanan, error: insertPesananError } = await supabase
    .from("pesanan")
    .insert([{ id_pembeli, total_harga, status_pesanan: "pending" }])
    .select("id_pesanan")
    .single();

  if (insertPesananError) throw insertPesananError;

  const id_pesanan = newPesanan.id_pesanan;

  // ============================================================
  // 4. Simpan item pesanan
  // ============================================================

  const pesananItems = cartItems.map((item) => ({
    id_pesanan,
    id_produk: item.id_produk,
    id_varian: item.id_varian,
    jumlah_item: item.jumlah_item,
    harga_satuan: item.harga_satuan,
  }));

  const { data: insertedItems, error: insertItemsError } = await supabase
    .from("pesanan_item")
    .insert(pesananItems)
    .select("*"); // penting supaya dapat id_item

  if (insertItemsError) throw insertItemsError;

  // cocokkan id_item ke cartItems
  insertedItems.forEach((row, index) => {
    cartItems[index].id_item = row.id_item;
  });

  // ============================================================
  // 5. Simpan add-ons untuk setiap item (jika ada)
  // ============================================================
  for (const item of cartItems) {
    if (item.add_ons && item.add_ons.length > 0) {
      const addOnRows = item.add_ons.map((add) => ({
        id_item: item.id_item,
        id_add_on: add.id_add_on,
        qty: add.qty,
        harga_add_on: add.harga_add_on,
      }));

      const { error: addOnError } = await supabase
        .from("pesanan_item_add_on")
        .insert(addOnRows);

      if (addOnError) throw addOnError;
    }
  }

  return { id_pesanan, id_pembeli };
}

// ============================================================
// Ambil semua pesanan
// ============================================================
export async function getOrders() {
  const { data, error } = await supabase
    .from("pesanan")
    .select(`
      id_pesanan,
      status_pesanan,
      total_harga,
      dibuat_pada,
      pembeli!inner(nama_pembeli, alamat_pembeli, nomer_pembeli),
      pesanan_item!inner(
        id_item,
        jumlah_item,
        harga_satuan,
        subtotal_item,
        produk(nama_produk),
        varian(nama_varian),
        pesanan_item_add_on(
          qty,
          harga_add_on,
          subtotal_add_on,
          add_ons(nama_add_on)
        )
      )
    `)
    .order("dibuat_pada", { ascending: false });

  if (error) throw error;
  return data;
}

// ============================================================
// Update status pesanan
// ============================================================
export async function updateOrderStatus(id_pesanan, status) {
  const { error } = await supabase
    .from("pesanan")
    .update({ status_pesanan: status })
    .eq("id_pesanan", id_pesanan);

  if (error) throw error;
}

// ============================================================
// Summary berdasarkan status pesanan
// ============================================================
export async function getOrderSummary() {
  const { data: orders, error } = await supabase
    .from("pesanan")
    .select(`
      id_pesanan,
      status_pesanan,
      total_harga,
      dibuat_pada,
      pembeli(nama_pembeli, alamat_pembeli, nomer_pembeli),
      pesanan_item(
        jumlah_item,
        harga_satuan,
        subtotal_item,
        produk(nama_produk),
        varian(nama_varian)
      )
    `)
    .order("dibuat_pada", { ascending: false });

  if (error) throw error;

  const successStatus = ["diproses", "dikirim", "selesai"];
  const failedStatus = ["pending", "dibatalkan"];

  const filterSuccess = orders.filter((order) =>
    successStatus.includes(order.status_pesanan)
  );

  const filterFailed = orders.filter((order) =>
    failedStatus.includes(order.status_pesanan)
  );

  return {
    totalSuccess: filterSuccess.length,
    totalFailed: filterFailed.length,
  };
}

// ============================================================
// Dashboard summary (pendapatan + total order)
// ============================================================
export async function getDashboardSummary() {
  const { data: orders, error } = await supabase
    .from("pesanan")
    .select(`
      id_pesanan,
      status_pesanan,
      total_harga,
      dibuat_pada,
      pembeli(nama_pembeli, alamat_pembeli, nomer_pembeli),
      pesanan_item(
        jumlah_item,
        harga_satuan,
        subtotal_item,
        produk(nama_produk),
        varian(nama_varian)
      )
    `)
    .order("dibuat_pada", { ascending: false });

  if (error) throw error;

  const validStatus = [
    "diproses",
    "dikirim",
    "selesai",
    "pending",
    "dibatalkan",
  ];

  const validRevenue = ["diproses", "dikirim", "selesai"];

  const filteredOrders = orders.filter((order) =>
    validStatus.includes(order.status_pesanan)
  );

  const filteredRevenue = orders.filter((order) =>
    validRevenue.includes(order.status_pesanan)
  );

  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredRevenue.reduce(
    (sum, order) => sum + Number(order.total_harga || 0),
    0
  );

  const recentOrders = orders.slice(0, 5);

  return { totalOrders, totalRevenue, recentOrders };
}
