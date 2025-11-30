import { supabase } from "../lib/supabase";
import { uploadImage, deleteImages } from "./storage";

// ambil semua produk
export async function getProduk() {
  const { data, error } = await supabase
    .from("produk")
    .select(`
      *,
      kategori(nama_kategori),
      varian(*),
      produk_ready_date(tanggal)
    `);

  if (error) throw error;
  return data;
}

// tambah produk
export async function addProduk(nama, deskripsi, id_kategori, files) {
  const allowedTypes = ["image/jpeg", "image/png"];
  
  // Upload gambar baru
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

// update produk - PERBAIKI FUNGSI INI
export async function updateProduk(id, nama, deskripsi, id_kategori, files, existingImages = []) {
  let urls = [];

  if (files && files.length > 0) {
    // 🔹 ADA GAMBAR BARU: Hapus gambar lama dan upload yang baru
    const allowedTypes = ["image/jpeg", "image/png"];
    
    // Hapus gambar lama dari storage jika ada
    if (existingImages.length > 0) {
      try {
        await deleteImages(existingImages);
        console.log('Gambar lama berhasil dihapus');
      } catch (error) {
        console.error('Gagal menghapus gambar lama:', error);
        // Lanjutkan proses meski gagal hapus gambar lama
      }
    }

    // Upload gambar baru
    urls = await Promise.all(
      files.map(async (file) => {
        if (!allowedTypes.includes(file.type)) {
          throw new Error("Hanya file JPG dan PNG yang diperbolehkan.");
        }
        return await uploadImage(file);
      })
    );
  } else {
    // 🔹 TIDAK ADA GAMBAR BARU: Gunakan gambar yang sudah ada
    urls = existingImages;
  }

  // Update produk di database
  const { data, error } = await supabase
    .from("produk")
    .update({
      nama_produk: nama,
      deskripsi,
      id_kategori,
      url_gambar: urls,
    })
    .eq("id_produk", id);

  if (error) throw error;
  return data;
}

// hapus produk - GUNAKAN API ROUTE YANG SUDAH DIPERBAIKI
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