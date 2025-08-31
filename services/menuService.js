import { supabase } from '../lib/supabase'
import { uploadImage } from './storage';

// ni function buat ambil data semua menu di database yaa
export async function getMenu() {
    const {data, error} = await supabase.from("menu").select("*");
    
    if (error) {
        throw error;
    }

    return data;
}

// kalo ni buat nambah produk/menu dimsum
export async function inputMenu(nama, deskripsi, harga, stok, file) {

    const url = await uploadImage(file);
    
    const {data, error} = await supabase.from("menu").insert([{
        nama_menu: nama,
        deskripsi: deskripsi,
        harga: harga,
        stok: stok,
        url_gambar: url
    }])
    
    if (error) {
        throw error;
    }

    // return data buat mengupdate UI/tampilan web langsung tanpa perlu refrash
    return data;
}

// klo ni ngeupdate, misal pas mau edit menu gitu
export async function updateMenu(id, nama, deskripsi, harga, stok, url) {
    const {data, error} = await supabase.from("menu").update([{
        nama_menu: nama,
        deskripsi: deskripsi,
        harga: harga,
        stok: stok,
        url_gambar: url
    }]).eq("id_menu", id)

    if (error) {
        throw error;
    }

    // return data buat mengupdate UI/tampilan web langsung tanpa perlu refrash
    return data;
}

// ni bwat apus
export async function hapusMenu(id) {
    const {data, error} = await supabase.from("menu").delete().eq("id_menu", id);

    if (error) {
        throw error;
    }

    // return data buat mengupdate UI/tampilan web langsung tanpa perlu refrash
    return data;
}