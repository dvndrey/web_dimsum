import { supabase } from "../lib/supabase";

/**
 * Simpan data pembeli, buat pesanan, dan simpan item pesanan
 * @param {Object} pembeliData - { nama_pembeli, alamat_pembeli, nomer_pembeli }
 * @param {Array} cartItems - [{ id_produk, id_varian, jumlah_item, harga_satuan }]
 */
export async function createOrder(pembeliData, cartItems) {
  const { nama_pembeli, alamat_pembeli, nomer_pembeli } = pembeliData;

  // 1. Cek atau buat pembeli (opsional: bisa pakai nomor HP sebagai unique key)
  const { data: existingPembeli, error: findError } = await supabase
    .from("pembeli")
    .select("id_pembeli")
    .eq("nomer_pembeli", nomer_pembeli)
    .single();

  let id_pembeli;
  if (existingPembeli) {
    id_pembeli = existingPembeli.id_pembeli;
  } else {
    // Buat pembeli baru
    const { data: newPembeli, error: insertPembeliError } = await supabase
      .from("pembeli")
      .insert([{ nama_pembeli, alamat_pembeli, nomer_pembeli }])
      .select("id_pembeli")
      .single();

    if (insertPembeliError) throw insertPembeliError;
    id_pembeli = newPembeli.id_pembeli;
  }

  // 2. Hitung total harga
  const total_harga = cartItems.reduce(
    (sum, item) => sum + item.harga_satuan * item.jumlah_item,
    0
  );

  // 3. Buat pesanan
  const { data: newPesanan, error: insertPesananError } = await supabase
    .from("pesanan")
    .insert([{ id_pembeli, total_harga, status_pesanan: "pending" }])
    .select("id_pesanan")
    .single();

  if (insertPesananError) throw insertPesananError;
  const id_pesanan = newPesanan.id_pesanan;

  // 4. Simpan item pesanan
  const pesananItems = cartItems.map((item) => ({
    id_pesanan,
    id_produk: item.id_produk,
    id_varian: item.id_varian,
    jumlah_item: item.jumlah_item,
    harga_satuan: item.harga_satuan,
  }));

  const { error: insertItemsError } = await supabase
    .from("pesanan_item")
    .insert(pesananItems);

  if (insertItemsError) throw insertItemsError;

  return { id_pesanan, id_pembeli };
}

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
        jumlah_item,
        harga_satuan,
        subtotal_item,
        produk!inner(nama_produk),
        varian!inner(nama_varian)
      )
    `)
    .order("dibuat_pada", { ascending: false });

  if (error) throw error;
  return data;
}

// Update status pesanan
export async function updateOrderStatus(id_pesanan, status) {
  const { error } = await supabase
    .from("pesanan")
    .update({ status_pesanan: status })
    .eq("id_pesanan", id_pesanan);

  if (error) throw error;
}

export async function getDashboardSummary() {
  const { data: orders, error } = await supabase
    .from("pesanan")
    .select(`
      id_pesanan,
      status_pesanan,
      total_harga,
      dibuat_pada,
      pembeli!inner(nama_pembeli, alamat_pembeli, nomer_pembeli),
      pesanan_item!inner(
        jumlah_item,
        harga_satuan,
        subtotal_item,
        produk!inner(nama_produk),
        varian!inner(nama_varian)
      )
    `)
    .order("dibuat_pada", { ascending: false });

  if (error) throw error;

  // Filter hanya status yang dihitung
  const validStatus = ["diproses", "dikirim", "selesai"];
  const filteredOrders = orders.filter(order => validStatus.includes(order.status_pesanan));

  // Hitung summary
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (Number(order.total_harga) || 0), 0);

  const recentOrders = orders.slice(0, 5); // tetap ambil 5 terbaru untuk list

  return { totalOrders, totalRevenue, recentOrders };
}
