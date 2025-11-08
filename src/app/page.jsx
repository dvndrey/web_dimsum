// src/app/page.jsx
'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import NavbarTab from '@/components/User/NavbarTab';
import Footer from '@/components/User/Footer';

export default function Home() {
  const [activeView, setActiveView] = useState('home'); // 'home' | 'menu'
  const [activeCategory, setActiveCategory] = useState('Semua');

  // 🔹 Data menu statis
  const menuItems = [
    { id: 1, category: 'Makanan', name: 'Gyoza', description: 'Kulit tipis berisi daging ayam juicy, dimasak renyah dan disajikan dengan saus khas kami.', image: '/Images/Gyoza2.png', price: 'Rp 25.000' },
    { id: 2, category: 'Makanan', name: 'Dimsum Mentai', description: 'Dimsum lembut berpadu saus mentai creamy dan gurih.', image: '/Images/DimsumMentai2.png', price: 'Rp 30.000' },
    { id: 3, category: 'Makanan', name: 'Spaghetti Brulee', description: 'Spaghetti creamy berpadu saus keju dan ayam chicking, dipanggang hingga keemasan.', image: '/Images/SphagettiBrulee2.png', price: 'Rp 40.000' },
    { id: 4, category: 'Makanan', name: 'Chicken Katsu Mentai Rice', description: 'Nasi hangat dengan chicken katsu renyah, disiram saus mentai creamy.', image: '/Images/ChickenKatsuMentaiRice2.png', price: 'Rp 42.000' },
    { id: 5, category: 'Minuman', name: 'Original Thai Tea', description: 'Teh susu khas Thailand dengan rasa manis dan creamy yang menyegarkan.', image: '/Images/ThaiTea.jpg', price: 'Rp 18.000' },
    { id: 6, category: 'Minuman', name: 'Green Thai Tea', description: 'Perpaduan unik antara teh hijau dan susu yang lembut.', image: '/Images/GreenThaiTea.jpg', price: 'Rp 18.000' },
  ];

  const categories = ['Semua', 'Makanan', 'Minuman'];
  const filteredMenu = activeCategory === 'Semua'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  // ✅ Switch view + scroll ke atas
  const switchView = (view) => {
    setActiveView(view);
    // Delay scroll sedikit agar transisi halus setelah render
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <div className="font-montserrat min-h-screen flex flex-col">
      {/* 🔁 Kirim activeView & setter ke NavbarTab agar highlight benar */}
      <NavbarTab 
        activeView={activeView} 
        onSwitchView={switchView} 
      />

      <main className="flex-grow">
        {activeView === 'home' ? (
          // 🏠 HOME VIEW
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
                    { icon: '/Icons/MoneyIcon.png', title: 'Bayar Saat Pesanan Tiba', desc: 'Pesan tanpa khawatir — nikmati dulu kelezatannya, lalu bayar setelah pesanan sampai di tangan Anda.' },
                    { icon: '/Icons/PercentIcon.png', title: 'Kepuasan Pelanggan Utama Kami', desc: 'Kami selalu berusaha memberikan rasa dan pelayanan terbaik.' },
                    { icon: '/Icons/FindIcon.png', title: 'Resep Asli Rumahan', desc: 'Menunjukkan kehangatan dan ketulusan dalam proses pembuatan.' },
                    { icon: '/Icons/QualityIcon.png', title: 'Kualitas Terjamin, Rasa Konsisten', desc: 'Kami menjaga setiap proses agar rasa dimsum kami selalu sama: lezat, lembut, dan terpercaya.' }
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
                  {menuItems.slice(0, 4).map(item => (
                    <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm transition hover:shadow-md">
                      <div className="relative h-48 w-full">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
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

            {/* Outlet Section */}
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
          // 🍽️ MENU VIEW
          <section className="py-12 px-4 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Menu Kami</h1>
                <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                  Nikmati berbagai hidangan lezat, dibuat dengan bahan segar dan resep istimewa.
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {categories.map(category => (
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

              {/* Menu Grid */}
              {filteredMenu.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredMenu.map(item => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition"
                    >
                      <div className="relative h-48 w-full">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#A65C37]">{item.price}</span>
                          <button
                            onClick={() => window.open('https://wa.me/6285169901919', '_blank')}
                            className="bg-[#A65C37] text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-[#d36e3b] transition"
                          >
                            Pesan
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Tidak ada menu untuk kategori ini.
                </div>
              )}

              {/* Back to Home */}
              <div className="text-center mt-10">
                <button
                  onClick={() => switchView('home')}
                  className="text-[#A65C37] font-medium hover:text-[#d36e3b] flex items-center gap-1 mx-auto"
                >
                  ← Kembali ke Beranda
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}