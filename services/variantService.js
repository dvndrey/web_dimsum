import { supabase } from "../lib/supabase";

export async function getVarianByProduk(id_produk) {
  const { data, error } = await supabase.from("varian").select("*").eq("id_produk", id_produk);
  if (error) throw error;
  return data;
}

export async function addVarian(id_produk, nama_varian, harga_varian, stok_varian) {
  const { data, error } = await supabase.from("varian").insert([{
    id_produk,
    nama_varian,
    harga_varian,
    stok_varian
  }]);
  if (error) throw error;
  return data;
}

export async function updateVarian(id_varian, nama_varian, harga_varian, stok_varian) {
  const { data, error } = await supabase
    .from("varian")
    .update({ nama_varian, harga_varian, stok_varian })
    .eq("id_varian", id_varian);
  if (error) throw error;
  return data;
}

export async function deleteVarian(id_varian) {
  const { data, error } = await supabase.from("varian").delete().eq("id_varian", id_varian);
  if (error) throw error;
  return data;
}
