## 🔑 Auth Service (`authService.js`)
- `login(email, password)` → Login admin menggunakan email & password Supabase Auth.
- `logout()` → Logout admin dari session aktif.

## 🍜 Menu Service (`menuServices.js`)
- `getMenu()` → Ambil semua data menu.
- `inputMenu(nama, deskripsi, harga, stok, file)` → Tambah menu baru.
- `updateMenu(id, nama, deskripsi, harga, stok, url)` → Update menu berdasarkan `id_menu`.
- `hapusMenu(id)` → Hapus menu berdasarkan `id_menu`.

## 👤 Owner Service (`ownService.js`)
- `getOwnerData()` → Ambil data pemilik.
- `updateData(nama, alamat, noHp, email)` → Update data pemilik.

## 📝 Catatan
- Semua function mengembalikan `data` dari Supabase → bisa langsung dipakai update UI tanpa refresh.
- Error dilempar (`throw`) → gunakan `try..catch`.

## 🚀 Tech Stack
- [Supabase](https://supabase.com/) – Database, Auth, Storage
- Next.js,  JavaScript (ESM Module)