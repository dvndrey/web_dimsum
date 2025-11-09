// src/app/page.jsx
'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import NavbarTab from '@/components/User/NavbarTab';
import Footer from '@/components/User/Footer';
import { getProduk } from '../../services/productService';
import { getVarianByProduk } from '../../services/variantService';

export default function Home() {
  // 🔹 State navigasi
  const [activeView, setActiveView] = useState('home'); // 'home' | 'menu' | 'cart'
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // 🔹 Data
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Modal produk
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalVariants, setModalVariants] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});

  // 🔹 Modal gambar
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // 🔹 Keranjang
  const [cartItems, setCartItems] = useState([]);

  // ✅ Load data produk & keranjang
  useEffect(() => {
    const fetchProduk = async () => {
      try {
        setLoading(true);
        const data = await getProduk();
        setProduk(data);
      } catch (err) {
        console.error('Gagal fetch produk:', err);
        setError('Gagal memuat menu.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduk();

    // Load cart dari localStorage
    const savedCart = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('cart') || '[]') 
      : [];
    setCartItems(savedCart);
  }, []);

  // ✅ Sinkronisasi keranjang ke localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // ✅ Switch view
  const switchView = (view) => {
    if (['home', 'menu', 'cart'].includes(view)) {
      setActiveView(view);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  };

  // ✅ Buka modal produk
  const openVariantModal = async (product) => {
    try {
      setModalLoading(true);
      setSelectedProduct(product);
      setSelectedVariants({});

      const variants = await getVarianByProduk(product.id_produk);
      setModalVariants(variants);

      setIsModalOpen(true);
      document.body.style.overflow = 'hidden';
    } catch (err) {
      alert('Gagal memuat varian.');
    } finally {
      setModalLoading(false);
    }
  };

  const closeVariantModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setSelectedVariants({});
    document.body.style.overflow = '';
  };

  // ✅ Update keranjang dari modal
  const addToCart = () => {
    if (Object.keys(selectedVariants).length === 0) {
      alert('⚠️ Belum ada varian yang dipilih.');
      return;
    }

    const newItems = Object.entries(selectedVariants).map(([id_varian, qty]) => {
      const variant = modalVariants.find(v => v.id_varian == id_varian);
      return {
        id: `${selectedProduct.id_produk}-${id_varian}`,
        id_produk: selectedProduct.id_produk,
        id_varian: id_varian,
        nama_produk: selectedProduct.nama_produk,
        nama_varian: variant?.nama_varian,
        url_gambar: Array.isArray(selectedProduct.url_gambar)
          ? selectedProduct.url_gambar[0]
          : selectedProduct.url_gambar || '/placeholder.jpg',
        harga: variant?.harga_varian || 0,
        jumlah: qty,
        subtotal: (variant?.harga_varian || 0) * qty,
      };
    });

    setCartItems(prev => [...prev, ...newItems]);
    alert(`✅ ${newItems.reduce((s, i) => s + i.jumlah, 0)} item ditambahkan ke keranjang.`);
    closeVariantModal();
  };

  // ✅ Hitung subtotal & total
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal; // ongkir = 0

  // ✅ Format rupiah
  const formatRupiah = (angka) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

  // ✅ Update jumlah item di keranjang
  const updateCartQuantity = (id, change) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              jumlah: Math.max(1, item.jumlah + change),
              subtotal: item.harga * Math.max(1, item.jumlah + change)
            }
          : item
      ).filter(item => item.jumlah > 0)
    );
  };

  const removeCartItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // ✅ Filter produk
  const kategoriList = ['Semua', ...new Set(produk.map(p => p.kategori?.nama_kategori).filter(Boolean))];
  const filteredProduk = produk.filter(p => {
    const matchCategory = activeCategory === 'Semua' || p.kategori?.nama_kategori === activeCategory;
    const matchSearch = !searchQuery.trim() || 
      p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.deskripsi && p.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // ✅ Subtotal di modal
  const calculateModalSubtotal = () =>
    Object.entries(selectedVariants).reduce((total, [id_varian, qty]) => {
      const variant = modalVariants.find(v => v.id_varian == id_varian);
      return total + (variant?.harga_varian || 0) * qty;
    }, 0);

  const totalModalItems = Object.values(selectedVariants).reduce((sum, q) => sum + q, 0);

  // ✅ Update jumlah varian di modal
  const updateVariantQuantity = (id_varian, change) => {
    setSelectedVariants(prev => {
      const current = prev[id_varian] || 0;
      const newQty = Math.max(0, current + change);
      const newState = { ...prev };
      if (newQty === 0) {
        delete newState[id_varian];
      } else {
        newState[id_varian] = newQty;
      }
      return newState;
    });
  };

  return (
    <div className="font-montserrat min-h-screen flex flex-col">
      <NavbarTab activeView={activeView} onSwitchView={switchView} />

      <main className="flex-grow pb-20">
        {activeView === 'home' && (
          <>
            <section className="relative w-full h-[750px] overflow-hidden">
              <Image
                src="/Images/BannerBackground.jpg"
                alt="Banner"
                fill
                className="absolute inset-0 object-cover brightness-65"
                style={{ filter: 'blur(3px)' }}
                priority
                sizes="100vw"
              />
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4 text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                  Nikmati Cita Rasa<br />Dimsum Rumahan<br />dengan Rasa Premium
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-2xl">
                  Kami percaya rasa terbaik lahir dari sentuhan tangan dan ketulusan hati.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => window.open('https://wa.me/6285169901919', '_blank')}
                    className="bg-[#A65C37] hover:bg-[#d36e3b] hover:scale-103 text-white font-medium py-3 px-6 rounded-full transition"
                  >
                    Order Sekarang
                  </button>
                  <button
                    onClick={() => switchView('menu')}
                    className="bg-gray-200 text-gray-800 hover:bg-white hover:scale-103 font-medium py-3 px-6 rounded-full transition"
                  >
                    Lihat Menu
                  </button>
                </div>
              </div>
            </section>

            <section className="py-16 bg-white px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-medium text-center mb-12">Kenapa Memilih Kami?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: '/Icons/MoneyIcon.png', title: 'Bayar Saat Pesanan Tiba', desc: 'Pesan tanpa khawatir — nikmati dulu kelezatannya, lalu bayar setelah pesanan sampai.' },
                    { icon: '/Icons/PercentIcon.png', title: 'Kepuasan Pelanggan Utama Kami', desc: 'Kami selalu berusaha memberikan rasa dan pelayanan terbaik.' },
                    { icon: '/Icons/FindIcon.png', title: 'Resep Asli Rumahan', desc: 'Menunjukkan kehangatan dan ketulusan dalam proses pembuatan.' },
                    { icon: '/Icons/QualityIcon.png', title: 'Kualitas Terjamin, Rasa Konsisten', desc: 'Kami menjaga setiap proses agar rasa dimsum kami selalu sama.' }
                  ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-xl">
                      <div className="w-16 h-16 mb-4 flex items-center justify-center">
                        <Image src={item.icon} alt={item.title} width={48} height={48} className="object-contain" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-16 bg-white px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center">Outlet Kami</h2>
                <p className="text-gray-600 mb-8 text-center">Tersedia layanan COD & Delivery ke area sekitar.</p>
                <div className="relative border-2 rounded-xl border-[#A65C37] overflow-hidden shadow-md">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.1624248175176!2d110.82885447562668!3d-7.55726227462661!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a1717b4faa015%3A0x4cbe254bef4031fe!2sSay%20Endulque!5e0!3m2!1sen!2sid!4v1762233743686!5m2!1sen!2sid"
                    width="100%" height="450" style={{ border: 0 }} allowFullScreen loading="lazy"
                    title="Lokasi Outlet"
                  ></iframe>
                </div>
              </div>
            </section>
          </>
        )}

        {activeView === 'menu' && (
          <section className="py-12 px-4 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Menu Kami</h1>
                <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                  {loading ? 'Memuat menu...' : error ? 'Gagal memuat menu.' : 'Nikmati berbagai hidangan lezat.'}
                </p>
              </div>

              {!loading && !error && (
                <div className="flex flex-col items-center gap-4 mb-8">
                  <div className="flex flex-wrap justify-center gap-3">
                    {kategoriList.map(category => (
                      <button
                        key={category}
                        onClick={() => {
                          setActiveCategory(category);
                          setSearchQuery('');
                        }}
                        className={`px-6 py-2.5 rounded-full font-medium ${
                          activeCategory === category
                            ? 'bg-[#A65C37] text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  <div className="w-full max-w-md">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={`Cari di kategori "${activeCategory}"...`}
                        className="w-full px-4 py-2.5 pl-10 pr-10 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#A65C37] outline-none"
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-r-transparent"></div>
                  <p className="mt-4 text-gray-600">Memuat menu...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-12 text-red-500">
                  <p>{error}</p>
                  <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-[#A65C37] text-white rounded-full">
                    Coba Lagi
                  </button>
                </div>
              )}

              {!loading && !error && filteredProduk.length > 0 && (
                <div className="grid grid-cols-2 gap-6">
                  {filteredProduk.map(item => {
                    const gambar = Array.isArray(item.url_gambar)
                      ? item.url_gambar[0]
                      : item.url_gambar || '/placeholder.jpg';
                    const isMatchSearch = searchQuery.trim() !== '' && 
                      item.nama_produk.toLowerCase().includes(searchQuery.toLowerCase());

                    return (
                      <div
                        key={item.id_produk}
                        className={`bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition ${
                          isMatchSearch ? 'ring-2 ring-[#A65C37] bg-[#A65C37]/5' : ''
                        }`}
                      >
                        <div className="relative h-48 w-full">
                          <Image src={gambar} alt={item.nama_produk} fill className="object-cover" />
                        </div>
                        <div className="p-4">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{item.nama_produk}</h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.deskripsi}</p>
                          <div className="flex justify-center mt-2">
                            <button
                              onClick={() => openVariantModal(item)}
                              className="bg-[#A65C37] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#d36e3b] transition"
                            >
                              Lihat Produk
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && !error && filteredProduk.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Tidak ada menu untuk kategori dan kata kunci ini.
                </div>
              )}

              <div className="text-center mt-10">
                <button onClick={() => switchView('home')} className="text-[#A65C37] font-medium hover:text-[#d36e3b] flex items-center gap-2">
                  ← Kembali ke Beranda
                </button>
              </div>
            </div>
          </section>
        )}

        {activeView === 'cart' && (
          <section className="py-8 px-4 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Keranjang Kamu</h1>
                <span className="text-sm text-gray-600">
                  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                </span>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <Image src="/Images/EmptyCart.png" alt="Kosong" width={120} height={120} className="mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-800 mb-2">Keranjangmu masih kosong</h3>
                  <p className="text-gray-600 mb-6">Yuk tambahkan menu favoritmu!</p>
                  <button
                    onClick={() => switchView('menu')}
                    className="bg-[#A65C37] hover:bg-[#d36e3b] text-white font-medium py-2 px-6 rounded-full transition"
                  >
                    Lihat Menu
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex items-start gap-4">
                        <div className="w-20 h-20 flex-shrink-0 relative">
                          <Image src={item.url_gambar} alt={item.nama_varian} fill className="object-cover rounded-md" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-semibold text-gray-900">{item.nama_produk}</h3>
                          <p className="text-sm text-gray-600">Varian {item.nama_varian}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-[#A65C37]">{formatRupiah(item.harga)}</span>
                            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-2 py-1">
                              <button onClick={() => updateCartQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-700 hover:bg-gray-200 rounded">
                                −
                              </button>
                              <span className="text-sm font-medium w-6 text-center">{item.jumlah}</span>
                              <button onClick={() => updateCartQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-gray-700 hover:bg-gray-200 rounded">
                                +
                              </button>
                            </div>
                            <button onClick={() => removeCartItem(item.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 🔹 Ringkasan Order — Desktop */}
                  <div className="lg:col-span-1">
                    <div className="hidden md:block bg-white p-6 rounded-lg shadow-sm">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Order</h2>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="font-bold">{formatRupiah(subtotal)}</span>
                        </div>
                        <hr className="border-gray-200" />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span>{formatRupiah(total)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          let message = "Halo, saya ingin memesan:\n\n";
                          cartItems.forEach(item => {
                            message += `• ${item.nama_produk} (${item.nama_varian}) x${item.jumlah} - ${formatRupiah(item.harga)}\n`;
                          });
                          message += `\nTotal: ${formatRupiah(total)}\n\nTerima kasih!`;

                          const encoded = encodeURIComponent(message);
                          window.open(`https://wa.me/6285169901919?text=${encoded}`, '_blank');
                        }}
                        className="w-full mt-6 bg-[#A65C37] hover:bg-[#d36e3b] text-white font-medium py-3 rounded-full transition"
                      >
                        Proceed to Checkout
                      </button>
                    </div>

                    {/* 🔹 Mobile: Sticky Bottom Summary */}
                    <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 bg-white p-4 rounded-t-lg shadow-lg border-t-4 border-[#A65C37]">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="w-5 h-5 text-[#A65C37] border-gray-300 rounded focus:ring-2 focus:ring-[#A65C37]" defaultChecked />
                          <span className="text-sm text-gray-800">Semua</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">Rp{subtotal.toLocaleString('id-ID')}</div>
                        </div>
                        <button
                          onClick={() => {
                            const summary = document.getElementById('mobile-price-summary');
                            summary.classList.toggle('hidden');
                          }}
                          className="ml-2 px-3 py-1 bg-[#A65C37] text-white text-xs font-medium rounded-full"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </div>

                    {/* 🔹 Mobile Expanded Detail — Hidden by default */}
                    <div id="mobile-price-summary" className="md:hidden mt-20 bg-white p-4 rounded-lg shadow-sm hidden max-h-60 overflow-y-auto">
                      <h3 className="text-sm font-medium text-gray-800 mb-3">Detail Harga</h3>
                      <div className="space-y-3 text-xs">
                        {cartItems.map(item => (
                          <div key={item.id} className="border-b border-gray-100 pb-2">
                            <div className="flex justify-between">
                              <span>{item.nama_produk} ({item.nama_varian}) x{item.jumlah}</span>
                              <span>Rp{item.subtotal.toLocaleString('id-ID')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>{formatRupiah(total)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          let message = "Halo, saya ingin memesan:\n\n";
                          cartItems.forEach(item => {
                            message += `• ${item.nama_produk} (${item.nama_varian}) x${item.jumlah} - ${formatRupiah(item.harga)}\n`;
                          });
                          message += `\nTotal: ${formatRupiah(total)}\n\nTerima kasih!`;

                          const encoded = encodeURIComponent(message);
                          window.open(`https://wa.me/6285169901919?text=${encoded}`, '_blank');
                        }}
                        className="w-full mt-4 bg-[#A65C37] hover:bg-[#d36e3b] text-white text-xs font-medium py-2.5 rounded-full"
                      >
                        Buat Pesanan
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* 🔹 MODAL PRODUK */}
      {isModalOpen && selectedProduct && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={closeVariantModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-.416 1.088-.416 1.514 0L12 4.5l.169.169m-1.316 6.842a1.5 1.5 0 112.688 0 1.5 1.5 0 01-2.688 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.769 4H5.231C3.995 4 3 5.005 3 6.24v11.52c0 1.235.995 2.24 2.231 2.24h14.538c1.236 0 2.231-1.005 2.231-2.24V6.24C22 5.005 21.005 4 19.769 4z" />
                  </svg>
                  Detail {selectedProduct.nama_produk}
                </h3>
                <button onClick={closeVariantModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">×</button>
              </div>

              <div className="flex flex-col md:flex-row max-h-[70vh] overflow-y-auto">
                <div className="flex-shrink-0 w-full md:w-1/2 p-4 bg-gray-50 flex flex-col items-center md:items-start">
                  <div className="relative w-full h-64 md:h-72 mb-4">
                    <Image
                      src={Array.isArray(selectedProduct.url_gambar) ? selectedProduct.url_gambar[0] || '/placeholder.jpg' : selectedProduct.url_gambar || '/placeholder.jpg'}
                      alt={selectedProduct.nama_produk}
                      fill
                      className="object-cover rounded-lg cursor-pointer"
                      onClick={() => setIsImageModalOpen(true)}
                    />
                    <button
                      onClick={() => setIsImageModalOpen(true)}
                      className="absolute bottom-2 right-2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                      aria-label="Lihat gambar penuh"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                  <h4 className="text-lg font-bold mb-2">{selectedProduct.nama_produk}</h4>
                  {selectedProduct.deskripsi && <p className="text-sm text-gray-700 text-center md:text-left mb-4">{selectedProduct.deskripsi}</p>}
                </div>

                <div className="flex-grow p-4 border-t md:border-l border-gray-200">
                  <h5 className="text-sm font-medium text-gray-600 mb-3">
                    {modalLoading ? 'Memuat varian...' : `Varian (${modalVariants.length})`}
                  </h5>

                  {modalLoading ? (
                    <div className="flex justify-center py-6"><div className="inline-block h-6 w-6 animate-spin border-2 border-r-transparent"></div></div>
                  ) : modalVariants.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Belum ada varian tersedia.</p>
                  ) : (
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                      {modalVariants.map(variant => {
                        const qty = selectedVariants[variant.id_varian] || 0;
                        return (
                          <div key={variant.id_varian} className={`p-3 rounded-lg border ${
                            variant.stok_varian <= 0 ? 'bg-gray-100 border-gray-300 text-gray-500' :
                            qty > 0 ? 'bg-[#ededed] border-[#d36e3b]' : 'border-gray-200 hover:bg-slate-200'
                          }`}>
                            <div className="flex justify-between">
                              <div>
                                <h5 className="font-medium">{variant.nama_varian}</h5>
                                <p className="text-xs text-gray-500 mt-1">Stok: {variant.stok_varian}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-[#A65C37]">
                                  Rp {variant.harga_varian?.toLocaleString('id-ID')}
                                </p>
                                {variant.stok_varian > 0 && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <button onClick={() => updateVariantQuantity(variant.id_varian, -1)} className="w-6 h-6 flex items-center justify-center bg-white border rounded">−</button>
                                    <span className="w-6 text-center">{qty}</span>
                                    <button 
                                      onClick={() => updateVariantQuantity(variant.id_varian, 1)} 
                                      disabled={qty >= variant.stok_varian}
                                      className={`w-6 h-6 flex items-center justify-center bg-white border rounded ${qty >= variant.stok_varian ? 'opacity-50' : ''}`}
                                    >
                                      +
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {totalModalItems > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span className="font-bold">{formatRupiah(calculateModalSubtotal())}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>Total Item:</span>
                        <span className="font-bold">{totalModalItems} item</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-center gap-3">
                <button onClick={addToCart} className="px-5 py-2 bg-[#A65C37] text-white rounded-lg text-sm font-medium hover:bg-[#d36e3b]">
                  Tambah Ke Keranjang
                </button>
                <button onClick={closeVariantModal} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300">
                  Tutup
                </button>
              </div>
            </div>
          </div>

          {/* 🔹 MODAL GAMBAR */}
          {isImageModalOpen && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90" onClick={() => setIsImageModalOpen(false)}>
              <div className="relative max-w-[95vw] max-h-[95vh] rounded-lg bg-white" onClick={e => e.stopPropagation()}>
                <button onClick={() => setIsImageModalOpen(false)} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/70 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex items-center justify-center p-2">
                  <Image
                    src={Array.isArray(selectedProduct?.url_gambar) ? selectedProduct.url_gambar[0] || '/placeholder.jpg' : selectedProduct?.url_gambar || '/placeholder.jpg'}
                    alt={selectedProduct?.nama_produk}
                    width={800} height={600}
                    className="max-h-[85vh] max-w-[90vw] object-contain rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <Footer />
    </div>
  );
}