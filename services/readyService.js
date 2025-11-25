import { supabase } from "../lib/supabase";

// ambil semua tanggal ready suatu produk
export async function getReadyDates(id_produk) {
  const { data, error } = await supabase
    .from("produk_ready_date")
    .select("*")
    .eq("id_produk", id_produk)
    .order("tanggal", { ascending: true });

  if (error) throw error;
  return data;
}

// tambah tanggal ready
export async function addReadyDate(id_produk, tanggal) {
  const { data, error } = await supabase
    .from("produk_ready_date")
    .insert([{ id_produk, tanggal }])
    .select();

  if (error) throw error;
  return data;
}

// hapus tanggal ready
export async function deleteReadyDate(id_ready) {
  const { error } = await supabase
    .from("produk_ready_date")
    .delete()
    .eq("id_ready", id_ready);

  if (error) throw error;
}
