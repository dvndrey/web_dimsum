// src/app/page.jsx
'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import NavbarTab from '@/components/User/NavbarTab';
import Footer from '@/components/User/Footer';
import { getProduk } from '../../services/productService';
import { getVarianByProduk } from '../../services/variantService';

export default function Home() {
  const [activeView, setActiveView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalVariants, setModalVariants] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({}); // { id_varian: jumlah }

  // 🔹 Kategori & filter
  const kategoriList = ['Semua', ...new Set(produk.map(p => p.kategori?.nama_kategori).filter(Boolean))];
  const filteredProduk = activeCategory === 'Semua'
    ? produk
    : produk.filter(p => p.kategori?.nama_kategori === activeCategory);

  // ✅ Fetch produk
  useEffect(() => {
    const fetchProduk = async () => {
      try {
        setLoading(true);
        const data = await getProduk();
        setProduk(data);
      } catch (err) {
        console.error('Gagal fetch produk:', err);
        setError('Gagal memuat menu. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduk();
  }, []);

  // ✅ Switch view
  const switchView = (view) => {
    setActiveView(view);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  // ✅ Buka modal & fetch varian
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
      console.error('Gagal memuat varian:', err);
      alert('Gagal memuat varian. Silakan coba lagi.');
    } finally {
      setModalLoading(false);
    }
  };

  // ✅ Tutup modal
  const closeVariantModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setSelectedVariants({});
    document.body.style.overflow = '';
  };

  // ✅ Update jumlah varian (+/-)
  const updateVariantQuantity = (id_varian, change) => {
    setSelectedVariants(prev => {
      const current = prev[id_varian] || 0;
      const newQty = Math.max(0, current + change);
      if (newQty === 0) {
        const newState = { ...prev };
        delete newState[id_varian];
        return newState;
      }
      return { ...prev, [id_varian]: newQty };
    });
  };

  // ✅ Hitung subtotal
  const calculateSubtotal = () => {
    return Object.entries(selectedVariants).reduce((total, [id_varian, qty]) => {
      const variant = modalVariants.find(v => v.id_varian == id_varian);
      return total + (variant?.harga_varian || 0) * qty;
    }, 0);
  };

  // ✅ Total item
  const totalItems = Object.values(selectedVariants).reduce((sum, q) => sum + q, 0);

  return (
    <div className="font-montserrat min-h-screen flex flex-col">
      <NavbarTab 
        activeView={activeView} 
        onSwitchView={switchView} 
      />

      <main className="flex-grow">
        {activeView === 'home' ? (
          <>
            {/* Hero Section */}
            <section className="relative w-full h-[750px] overflow-hidden">
              <Image
                src="/Images/BannerBackground.jpg"
                alt="Banner Background"
                fill
                className="absolute inset-0 object-cover brightness-65"
                style={{ filter: 'blur(3px)' }}
                priority
                sizes="100vw"
              />
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4 text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                  Nikmati Cita Rasa<br />
                  Dimsum Rumahan<br />
                  dengan Rasa Premium
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-2xl">
                  Kami percaya rasa terbaik lahir dari sentuhan tangan dan ketulusan hati.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => window.open('https://wa.me/6285169901919', '_blank')}
                    className="bg-[#A65C37] hover:bg-[#d36e3b] hover:scale-103 text-white font-medium py-3 px-6 rounded-full transition cursor-pointer"
                  >
                    Order Sekarang
                  </button>
                  <button
                    onClick={() => switchView('menu')}
                    className="bg-gray-200 text-gray-800 hover:bg-white hover:scale-103 font-medium py-3 px-6 rounded-full transition cursor-pointer"
                  >
                    Lihat Menu
                  </button>
                </div>
              </div>
            </section>

            {/* Kenapa Memilih Kami? */}
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
                    <div key={i} className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-xl hover:shadow-[#ffb691] transition">
                      <div className="w-16 h-16 mb-4 flex items-center justify-center">
                        <Image 
                          src={item.icon} 
                          alt={item.title} 
                          width={48} 
                          height={48} 
                          className="object-contain" 
                        />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Special Menu Preview */}
            <section className="py-10 bg-white px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl md:text-4xl font-medium text-center text-gray-800 mb-8">
                  Nikmati juga berbagai pilihan menu spesial kami!
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {produk.slice(0, 4).map(item => (
                    <div key={item.id_produk} className="bg-white rounded-xl overflow-hidden shadow-sm transition hover:shadow-md">
                      <div className="relative h-48 w-full">
                        <Image
                          src={Array.isArray(item.url_gambar) ? (item.url_gambar[0] || '/placeholder.jpg') : item.url_gambar}
                          alt={item.nama_produk}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-800">{item.nama_produk}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="py-12 px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="bg-yellow-50 p-8 rounded-xl border-2 border-orange-900">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                    Jelajahi Beragam Menu Kami
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Dimsum buatan tangan dengan rasa rumahan yang autentik,<br />
                    dibuat dengan sepenuh hati untuk Anda.
                  </p>
                  <button
                    onClick={() => switchView('menu')}
                    className="bg-[#A65C37] hover:bg-[#d36e3b] text-white font-medium py-2 px-6 rounded-full transition"
                  >
                    Lihat Semua Menu
                  </button>
                </div>
              </div>
            </section>

            {/* Outlet */}
            <section className="py-16 bg-white px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center">Outlet Kami</h2>
                <p className="text-gray-600 mb-8 text-center">Tersedia layanan COD & Delivery ke area sekitar.</p>
                <div className="relative border-2 rounded-xl border-[#A65C37] overflow-hidden shadow-md">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.1624248175176!2d110.82885447562668!3d-7.55726227462661!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a1717b4faa015%3A0x4cbe254bef4031fe!2sSay%20Endulque!5e0!3m2!1sen!2sid!4v1762233743686!5m2!1sen!2sid"
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Lokasi Outlet Kami"
                  ></iframe>
                </div>
              </div>
            </section>
          </>
        ) : (
          // 🍽️ MENU VIEW — 2 kolom
          <section className="py-12 px-4 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Menu Kami</h1>
                <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                  {loading ? 'Memuat menu...' : error ? 'Gagal memuat menu.' : 'Nikmati berbagai hidangan lezat, dibuat dengan bahan segar dan resep istimewa.'}
                </p>
              </div>

              {!loading && !error && (
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {kategoriList.map(category => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${
                        activeCategory === category
                          ? 'bg-[#A65C37] text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-4 text-gray-600">Memuat menu...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-12 text-red-500">
                  <p>{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-[#A65C37] text-white rounded-full"
                  >
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

                    return (
                      <div
                        key={item.id_produk}
                        className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition"
                      >
                        <div className="relative h-48 w-full">
                          <Image
                            src={gambar}
                            alt={item.nama_produk}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{item.nama_produk}</h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.deskripsi}</p>
                          <div className="flex justify-center mt-2">
                            <button
                              onClick={() => openVariantModal(item)}
                              className="bg-[#A65C37] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#d36e3b] transition cursor-pointer"
                            >
                              Lihat Varian
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
                  Tidak ada menu untuk kategori ini.
                </div>
              )}

              <div className="text-center mt-10">
                <button
                  onClick={() => switchView('home')}
                  className="text-[#A65C37] font-medium hover:text-[#d36e3b] flex items-center gap-2 cursor-pointer"
                >
                  ← Kembali ke Beranda
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* 🔹 MODAL VARIANT — POSISI TENGAH (mobile & desktop) */}
      {isModalOpen && selectedProduct && (
        <>
          {/* Overlay Blur */}
          <div 
            className="fixed inset-0 z-40 bg-opacity-30 opacity-0"
            style={{
              transition: 'opacity 0.3s ease, backdrop-filter 0.3s ease',
              opacity: isModalOpen ? 1 : 0,
              backdropFilter: isModalOpen ? 'blur(10px)' : 'blur(0px)',
              WebkitBackdropFilter: isModalOpen ? 'blur(10px)' : 'blur(0px)',
              willChange: 'opacity, backdrop-filter',
            }}
            onClick={closeVariantModal}
          />

          {/* Modal — SELALU DI TENGAH */}
          <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className={`bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out ${
                isModalOpen 
                  ? 'translate-y-0 opacity-100 scale-100' 
                  : 'translate-y-10 opacity-0 scale-95'
              }`}
              style={{ maxHeight: 'calc(100vh - 2rem)' }}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-.416 1.088-.416 1.514 0L12 4.5l.169.169m-1.316 6.842a1.5 1.5 0 112.688 0 1.5 1.5 0 01-2.688 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.769 4H5.231C3.995 4 3 5.005 3 6.24v11.52c0 1.235.995 2.24 2.231 2.24h14.538c1.236 0 2.231-1.005 2.231-2.24V6.24C22 5.005 21.005 4 19.769 4z" />
                  </svg>
                  Varian {selectedProduct.nama_produk}
                </h3>
                <button
                  onClick={closeVariantModal}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-600">
                  {modalLoading 
                    ? 'Memuat varian...' 
                    : `Pilih varian (${modalVariants.length})`}
                </h4>

                {modalLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                  </div>
                ) : modalVariants.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Belum ada varian tersedia.</p>
                ) : (
                  modalVariants.map((variant) => {
                    const qty = selectedVariants[variant.id_varian] || 0;
                    const isSelected = qty > 0;

                    return (
                      <div
                        key={variant.id_varian}
                        className={`p-3 rounded-lg border transition-colors ${
                          variant.stok_varian <= 0
                            ? 'bg-gray-100 border-gray-300 text-gray-500'
                            : isSelected
                              ? 'bg-[#ededed] border-[#d36e3b] shadow-sm'
                              : 'border-gray-200 hover:bg-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-gray-900">{variant.nama_varian}</h5>
                            <p className="text-xs text-gray-500 mt-1">
                              Stok: {variant.stok_varian}
                            </p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1">
                            <p className="font-bold text-[#A65C37]">
                              Rp {variant.harga_varian?.toLocaleString('id-ID')}
                            </p>
                            {variant.stok_varian > 0 && (
                              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-2 py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateVariantQuantity(variant.id_varian, -1);
                                  }}
                                  className="w-6 h-6 flex items-center justify-center text-gray-700 hover:bg-gray-200 rounded cursor-pointer"
                                >
                                  −
                                </button>
                                <span className="text-sm font-medium w-6 text-center">{qty}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (qty < variant.stok_varian) {
                                      updateVariantQuantity(variant.id_varian, 1);
                                    }
                                  }}
                                  className={`w-6 h-6 flex items-center justify-center text-gray-700 hover:bg-gray-200 cursor-pointer rounded ${
                                    qty >= variant.stok_varian ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Subtotal */}
                {Object.keys(selectedVariants).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-bold text-gray-900">
                        Rp {calculateSubtotal().toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Total Item:</span>
                      <span className="font-bold text-gray-900">
                        {totalItems} item
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 flex justify-center gap-3">
                <button
                  onClick={() => {
                    if (totalItems === 0) {
                      alert('⚠️ Belum ada varian yang dipilih.');
                      return;
                    }
                    const cartItems = Object.entries(selectedVariants).map(([id_varian, qty]) => {
                      const variant = modalVariants.find(v => v.id_varian == id_varian);
                      return {
                        id_varian,
                        nama_varian: variant?.nama_varian,
                        harga: variant?.harga_varian,
                        jumlah: qty,
                        subtotal: (variant?.harga_varian || 0) * qty
                      };
                    });
                    console.log('🛒 Keranjang:', cartItems);
                    alert(`✅ Berhasil! ${totalItems} item ditambahkan ke keranjang.\nTotal: Rp ${calculateSubtotal().toLocaleString('id-ID')}`);
                    closeVariantModal();
                  }}
                  className="px-5 py-2 bg-[#A65C37] text-white rounded-lg text-sm font-medium hover:bg-[#d36e3b] cursor-pointer transition"
                >
                  Tambah Ke Keranjang
                </button>
                <button
                  onClick={closeVariantModal}
                  className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}