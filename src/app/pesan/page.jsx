// app/pesan/page.js
"use client";
import { useState, useEffect } from "react";
import { getProduk } from "../../../services/productService";
import { createOrder } from "../../../services/orderService";

export default function TestPesanPage() {
  const [produkList, setProdukList] = useState([]);
  const [cart, setCart] = useState([]); // [{ id_produk, id_varian, nama_produk, nama_varian, harga_satuan, jumlah_item }]
  const [showPopup, setShowPopup] = useState(false);
  const [pembeliData, setPembeliData] = useState({
    nama_pembeli: "",
    alamat_pembeli: "",
    nomer_pembeli: "",
  });
  const [status, setStatus] = useState(""); // "success", "error", ""

  useEffect(() => {
    loadProduk();
  }, []);

  async function loadProduk() {
    try {
      const data = await getProduk();
      setProdukList(data);
    } catch (err) {
      console.error("Gagal load produk:", err);
    }
  }

  function addToCart(produk, varian) {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id_varian === varian.id_varian
      );
      if (existing) {
        return prev.map((item) =>
          item.id_varian === varian.id_varian
            ? { ...item, jumlah_item: item.jumlah_item + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id_produk: produk.id_produk,
          id_varian: varian.id_varian,
          nama_produk: produk.nama_produk,
          nama_varian: varian.nama_varian,
          harga_satuan: varian.harga_varian,
          jumlah_item: 1,
        },
      ];
    });
  }

  function updateQuantity(id_varian, delta) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id_varian === id_varian
            ? { ...item, jumlah_item: Math.max(1, item.jumlah_item + delta) }
            : item
        )
        .filter((item) => item.jumlah_item > 0)
    );
  }

  async function handleConfirmOrder() {
    if (cart.length === 0) {
      alert("Keranjang kosong!");
      return;
    }
    setShowPopup(true);
  }

  async function handleSubmitPembeli(e) {
    e.preventDefault();
    try {
      await createOrder(pembeliData, cart);
      setStatus("success");
      setCart([]);
      setShowPopup(false);
      setPembeliData({ nama_pembeli: "", alamat_pembeli: "", nomer_pembeli: "" });
      alert("Pesanan berhasil dibuat!");
    } catch (err) {
      console.error("Error:", err);
      setStatus("error");
      alert("Gagal membuat pesanan: " + err.message);
    }
  }

  const total = cart.reduce(
    (sum, item) => sum + item.harga_satuan * item.jumlah_item,
    0
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Pemesanan</h1>

      {/* Keranjang */}
      <div className="mb-6 border rounded p-4">
        <h2 className="text-lg font-semibold mb-2">Keranjang ({cart.length} item)</h2>
        {cart.length === 0 ? (
          <p>Keranjang kosong</p>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.id_varian} className="flex justify-between items-center">
                <span>
                  {item.nama_produk} - {item.nama_varian} (x{item.jumlah_item})
                </span>
                <div>
                  <button
                    onClick={() => updateQuantity(item.id_varian, -1)}
                    className="px-2"
                  >
                    -
                  </button>
                  <span className="mx-2">{item.jumlah_item}</span>
                  <button
                    onClick={() => updateQuantity(item.id_varian, 1)}
                    className="px-2"
                  >
                    +
                  </button>
                </div>
                <span>Rp{item.harga_satuan * item.jumlah_item}</span>
              </div>
            ))}
            <div className="mt-4 font-bold">Total: Rp{total}</div>
            <button
              onClick={handleConfirmOrder}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Konfirmasi Pesanan
            </button>
          </div>
        )}
      </div>

      {/* Daftar Produk */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produkList.map((produk) => (
          <div key={produk.id_produk} className="border rounded p-4">
            <h3 className="font-bold">{produk.nama_produk}</h3>
            <p className="text-sm text-gray-600">{produk.deskripsi}</p>
            <div className="mt-2 space-y-2">
              {produk.varian?.map((varian) => (
                <div
                  key={varian.id_varian}
                  className="flex justify-between items-center border-t pt-2"
                >
                  <div>
                    <div>{varian.nama_varian}</div>
                    <div className="text-sm text-green-600">
                      Rp{varian.harga_varian}
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(produk, varian)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Pilih
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Popup Form Pembeli */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Data Pembeli</h2>
            <form onSubmit={handleSubmitPembeli} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Nama</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={pembeliData.nama_pembeli}
                  onChange={(e) =>
                    setPembeliData({ ...pembeliData, nama_pembeli: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Alamat</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  value={pembeliData.alamat_pembeli}
                  onChange={(e) =>
                    setPembeliData({ ...pembeliData, alamat_pembeli: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Nomor HP</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={pembeliData.nomer_pembeli}
                  onChange={(e) =>
                    setPembeliData({ ...pembeliData, nomer_pembeli: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 border rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Kirim Pesanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}