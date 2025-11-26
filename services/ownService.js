import { supabase } from "../lib/supabase";

// ambil data pemilik by id
export async function getOwnerData(id = 2025) {
  const { data, error } = await supabase
    .from("pemilik")
    .select("*")
    .eq("id_pemilik", id)
    .single();
  if (error) throw error;
  return data;
}

// update data pemilik
export async function updateData(profile, id = 2025) {
  const { data, error } = await supabase
    .from("pemilik")
    .update({
      nama_pemilik: profile.nama_pemilik,
      email: profile.email,
      alamat: profile.alamat,
      no_hp: profile.no_hp,
      // 🔹 Tambahkan field baru
      hero_title: profile.hero_title || null,
      hero_subtitle: profile.hero_subtitle || null
    })
    .eq("id_pemilik", id)
    .single();
  if (error) throw error;
  return data;
}