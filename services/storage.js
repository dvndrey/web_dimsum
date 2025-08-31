import { supabase } from "../lib/supabase";

// fungsi buat upload gambar ke penyimpanan database kita, disini ambil url nya doang buat disimpen ke tabel menu
export async function uploadImage(file) {
    const fileName = `${Date.now()}-${file.name}`;

    const {data, error} = await supabase.storage.from("gambar_menu").upload(fileName, file);

    if (error) {
        throw error;
    }

    const {data: { publicUrl }} = supabase.storage.from("gambar_menu").getPublicUrl(fileName);
    return publicUrl;
}