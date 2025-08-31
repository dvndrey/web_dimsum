import { supabase } from "../lib/supabase";

export async function getOwnerData() {
    const { data, error } = supabase.from("pemilik").select;

    if (error) {
        throw error;
    }

    return data;
}

export async function updateData(nama, alamat, noHp, email) {
    const { data, error } = supabase.from("pemilik").update([{
        nama_pemilik: nama,
        alamat: alamat,
        no_hp: noHp,
        email: email
    }]).eq("id_pemilik", 2025)

    if (error) {
        throw error;
    }

    return data
}