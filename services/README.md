# 🍱 Food Ordering App – User Side

> **Bagian User (Customer) – Sistem Pemesanan Produk & Checkout**

Dokumentasi ini menjelaskan semua service dan alur yang digunakan di sisi **User (pembeli)** dari aplikasi pemesanan makanan/minuman berbasis **Supabase + Next.js**.

---

## ⚙️ Struktur Service

| File | Fungsi Utama |
|------|---------------|
| `authService.js` | Autentikasi admin (login/logout) |
| `productService.js` | Mengelola produk (baca/tambah/edit/hapus) |
| `categoryService.js` | CRUD kategori produk |
| `variantService.js` | CRUD varian per produk |
| `orderService.js` | Proses checkout dan pengambilan data pesanan |
| `ownService.js` | Data profil pemilik / restoran |

---

## 🧩 Auth Service (`authService.js`)

Digunakan hanya untuk **login admin ke dashboard** (user tidak login).

```js
- login(email, password)    → Login admin (pakai Supabase Auth)
- logout()                  → Logout dari session aktif
```

---

## 🍛 Product Service (`productService.js`)

Untuk **menampilkan, menambah, mengedit, dan menghapus** produk di database.

```js
- getProduk()                      → Ambil semua produk + kategori + varian.
- addProduk(nama, deskripsi, id_kategori, files)
                                   → Tambah produk baru (upload gambar ke Supabase Storage).
- updateProduk(id, nama, deskripsi, id_kategori, files)
                                   → Update produk, bisa ubah gambar atau tidak.
- deleteProduk(id)                 → Hapus produk lewat API route.
```

**Catatan:**
- Gambar otomatis di-upload via `uploadImage()` ke Supabase Storage.
- File yang diperbolehkan: `JPG`, `PNG`.

---

## 🏷️ Category Service (`categoryService.js`)

CRUD untuk kategori menu.

```js
- getCategory()               → Ambil semua kategori.
- addCategory(nama_kategori)  → Tambah kategori baru.
- updateCategory(id, nama_kategori)
                              → Update nama kategori.
- deleteCategory(id)          → Hapus kategori berdasarkan ID.
```

---

## 🧩 Variant Service (`variantService.js`)

CRUD varian dari produk (misal: ukuran, rasa, topping, dll).

```js
- getVarianByProduk(id_produk)             → Ambil semua varian untuk produk tertentu.
- addVarian(id_produk, nama, harga, stok)  → Tambah varian baru.
- updateVarian(id_varian, nama, harga, stok)
                                           → Update varian.
- deleteVarian(id_varian)                  → Hapus varian.
```

---

## 🧍‍♂️ Owner Service (`ownService.js`)

Mengelola profil pemilik (admin restoran).

```js
- getOwnerData(id = 2025)     → Ambil data profil pemilik dari tabel `pemilik`.
- updateData(profile, id = 2025)
                              → Update profil (nama, alamat, no HP, email, dll).
```

---

## 🛒 Order Service (`orderService.js`)

Menangani seluruh proses checkout dan data pesanan pembeli.

### 🧾 Fungsi
```js
- createOrder(pembeliData, cartItems)
    → Simpan data pembeli, buat pesanan baru, dan simpan item pesanan.

- getOrders()
    → Ambil semua pesanan (termasuk pembeli, produk, varian, dan status).

- updateOrderStatus(id_pesanan, status)
    → Update status pesanan (pending, selesai, batal, dll).

- getDashboardSummary()
    → Dapatkan ringkasan total pesanan & pemasukan untuk dashboard admin.
```

---

## 🧭 Alur Checkout (Frontend User)

1. **Pilih Produk**  
   Pengguna melihat daftar produk → pilih 1 produk.

2. **Pilih Varian**  
   Sistem ambil data varian lewat `getVarianByProduk(id_produk)` → user pilih varian yang diinginkan.

3. **Tambah ke Keranjang / Beli Langsung**  
   Data varian dan jumlah disimpan sementara di state/cart.

4. **Konfirmasi Pesanan**  
   User diarahkan ke halaman konfirmasi untuk memastikan semua item benar.

5. **Isi Form Pembeli**  
   User isi:  
   - `nama_pembeli`  
   - `nomer_pembeli` (WA aktif)  
   - `alamat_pembeli`

6. **Submit Order (`createOrder()`)**  
   - Cek apakah nomor WA sudah ada di tabel `pembeli`.  
   - Kalau belum ada → buat pembeli baru.  
   - Hitung `total_harga` dari semua item.  
   - Insert ke tabel `pesanan` dan `pesanan_item`.

7. **Redirect ke WhatsApp**  
   Setelah berhasil simpan pesanan, sistem otomatis buka WhatsApp dengan **template pesan konfirmasi** berisi:
   - Nama pembeli  
   - Daftar pesanan  
   - Total harga  
   - Alamat pengantaran

---

## 📦 Tabel yang Terlibat

| Tabel | Deskripsi |
|-------|------------|
| `produk` | Data produk utama |
| `kategori` | Jenis kategori produk |
| `varian` | Variasi produk (ukuran, rasa, dll) |
| `pembeli` | Data customer (nama, alamat, no WA) |
| `pesanan` | Data utama pesanan |
| `pesanan_item` | Detail item tiap pesanan |
| `pemilik` | Data profil pemilik usaha |

---

## 💾 Tech Stack

- **Next.js** – Frontend Framework  
- **Supabase** – Database, Auth, Storage  
- **JavaScript (ESM Modules)**  
- **WhatsApp Web** – untuk redirect otomatis setelah checkout  

---

## 📚 Catatan Tambahan

- Semua fungsi `async` dan akan `throw error` → wajib dibungkus `try...catch`.
- Supabase otomatis handle `select`, `insert`, dan `update`.
- Setiap response `return data` bisa langsung dipakai update UI tanpa reload halaman.
