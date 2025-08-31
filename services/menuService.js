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
export async function inputMenu(nama, deskripsi, harga, stok, files) {
    const allowedTypes = ["image/jpeg", "image/png"];

    const urls = await Promise.all(
        files.map(async (file) => {
            if (!allowedTypes.includes(file.type)) {
                throw new Error("Hanya file JPG dan PNG yang diperbolehkan.");
            }
            return await uploadImage(file);
        })
    );

    const {data, error} = await supabase.from("menu").insert([{
        nama_menu: nama,
        deskripsi,
        harga,
        stok,
        url_gambar: urls
    }]);

    if (error) throw error;
    return data;
}

// klo ni ngeupdate, misal pas mau edit menu gitu
export async function updateMenu(id, nama, deskripsi, harga, stok, files) {
  let urls = [];

  if (files && files.length > 0) {
    const allowedTypes = ["image/jpeg", "image/png"];
    urls = await Promise.all(
      files.map(async (file) => {
        if (!allowedTypes.includes(file.type)) {
          throw new Error("Hanya file JPG dan PNG yang diperbolehkan.");
        }
        return await uploadImage(file);
      })
    );
  } else {
    const { data: menu, error: getError } = await supabase
      .from("menu")
      .select("url_gambar")
      .eq("id_menu", id)
      .single();
    if (getError) throw getError;
    urls = menu.url_gambar;
  }

  const { data, error } = await supabase.from("menu").update([{
    nama_menu: nama,
    deskripsi,
    harga,
    stok,
    url_gambar: urls,
  }]).eq("id_menu", id);

  if (error) throw error;
  return data;
}


// ni bwat apus
export async function hapusMenu(id) {
  const res = await fetch('/api/menu/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || 'Gagal hapus menu');
  }

  return result;
}