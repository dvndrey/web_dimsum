import { supabase } from "../lib/supabase";

// ambil add-ons milik produk tertentu
export async function getAddOnsByProduk(id_produk) {
  const { data, error } = await supabase
    .from("add_ons")
    .select("*")
    .eq("id_produk", id_produk);

  if (error) throw error;
  return data;
}

// tambah add-on ke produk
export async function addAddOn(id_produk, nama_add_on, harga_add_on) {
  const { data, error } = await supabase
    .from("add_ons")
    .insert([{ id_produk, nama_add_on, harga_add_on }])
    .select(); // 👈 Tambahkan .select() agar mengembalikan data yang dimasukkan

  if (error) throw error;
  return data; // Sekarang data adalah array dari record yang baru ditambahkan
}

// update add-on
export async function updateAddOn(id_add_on, nama_add_on, harga_add_on) {
  const { data, error } = await supabase
    .from("add_ons")
    .update({ nama_add_on, harga_add_on })
    .eq("id_add_on", id_add_on);

  if (error) throw error;
  return data;
}

// hapus add-on
export async function deleteAddOn(id_add_on) {
  const { error } = await supabase
    .from("add_ons")
    .delete()
    .eq("id_add_on", id_add_on);

  if (error) throw error;
}
