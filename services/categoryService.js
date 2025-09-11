import { supabase } from "../lib/supabase";

export async function getCategory() {
  const { data, error } = await supabase.from("kategori").select("*");
  if (error) throw error;
  return data;
}

export async function addCategory(nama_kategori) {
  const { data, error } = await supabase.from("kategori").insert([{ nama_kategori }]);
  if (error) throw error;
  return data;
}

export async function updateCategory(id, nama_kategori) {
  const { data, error } = await supabase
    .from("kategori")
    .update({ nama_kategori })
    .eq("id_kategori", id);
  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  const { data, error } = await supabase.from("kategori").delete().eq("id_kategori", id);
  if (error) throw error;
  return data;
}
