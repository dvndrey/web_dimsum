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
    .update(profile)
    .eq("id_pemilik", id)
    .single();
  if (error) throw error;
  return data;
}
