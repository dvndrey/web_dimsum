import { supabase } from "../lib/supabase";

/**
 * Tambah pembeli baru
 * payload: { nama, alamat, no_hp }
 */
export async function addPembeli({ nama, alamat, no_hp }) {
  const { data, error } = await supabase
    .from("pembeli")
    .insert([{ nama, alamat, no_hp }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Ambil pembeli by id
 */
export async function getPembeliById(id_pembeli) {
  const { data, error } = await supabase
    .from("pembeli")
    .select("*")
    .eq("id_pembeli", id_pembeli)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update data pembeli
 * payload: object fields to update
 */
export async function updatePembeli(id_pembeli, payload) {
  const { data, error } = await supabase
    .from("pembeli")
    .update(payload)
    .eq("id_pembeli", id_pembeli)
    .select()
    .single();
  if (error) throw error;
  return data;
}
