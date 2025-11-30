import { supabase } from "../lib/supabase";
import { uploadImage, deleteImages } from "./storage";

// ambil semua produk (hanya yang tidak di-soft delete)
export async function getProduk() {
  const { data, error } = await supabase
    .from("produk")
    .select(`
      *,
      kategori(nama_kategori),
      varian(*),
      produk_ready_date(tanggal)
    `)
    .is('deleted_at', null);

  if (error) throw error;
  return data;
}

// tambah produk
export async function addProduk(nama, deskripsi, id_kategori, files) {
  const allowedTypes = ["image/jpeg", "image/png"];
  
  const urls = await Promise.all(
    files.map(async (file) => {
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Hanya file JPG dan PNG yang diperbolehkan.");
      }
      return await uploadImage(file);
    })
  );

  const { data, error } = await supabase.from("produk").insert([{
    nama_produk: nama,
    deskripsi: deskripsi,
    url_gambar: urls,
    id_kategori: id_kategori,
    id_pemilik: 2025,
  }]);

  if (error) throw error;
  return data;
}

// update produk
export async function updateProduk(id, nama, deskripsi, id_kategori, files, existingImages = []) {
  let urls = [];

  if (files && files.length > 0) {
    const allowedTypes = ["image/jpeg", "image/png"];
    
    if (existingImages.length > 0) {
      try {
        await deleteImages(existingImages);
        console.log('Gambar lama berhasil dihapus');
      } catch (error) {
        console.error('Gagal menghapus gambar lama:', error);
      }
    }

    urls = await Promise.all(
      files.map(async (file) => {
        if (!allowedTypes.includes(file.type)) {
          throw new Error("Hanya file JPG dan PNG yang diperbolehkan.");
        }
        return await uploadImage(file);
      })
    );
  } else {
    urls = existingImages;
  }

  const { data, error } = await supabase
    .from("produk")
    .update({
      nama_produk: nama,
      deskripsi,
      id_kategori,
      url_gambar: urls,
    })
    .eq("id_produk", id)
    .is('deleted_at', null); // Hanya update yang tidak di-soft delete

  if (error) throw error;
  return data;
}

// hapus produk - menggunakan API route yang sudah diperbaiki
export async function deleteProduk(id) {
  const res = await fetch('/api/menu/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || 'Gagal hapus produk');
  }

  return result;
}

// Fungsi untuk restore produk yang di-soft delete (opsional)
export async function restoreProduk(id) {
  const { data, error } = await supabase
    .from('produk')
    .update({ 
      deleted_at: null,
      nama_produk: (await supabase
        .from('produk')
        .select('nama_produk')
        .eq('id_produk', id)
        .single()).data?.nama_produk?.replace(/^\[DIHAPUS\].* - Produk sebelumnya: /, '') || 'Restored Product'
    })
    .eq('id_produk', id);

  if (error) throw error;
  return data;
}