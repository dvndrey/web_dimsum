'use client'

import Image from "next/image";
import { getProduk } from "../../services/productService.js";
import { useState, useEffect } from "react";
import NavbarTab from '@/components/User/NavbarTab';
import Footer from '@/components/User/Footer';

export default function Home() {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getProduk();
      setMenu(data);
    }
    fetchData();
  }, []);

  return (
    <div className="font-montserrat min-h-screen flex flex-col">
      <NavbarTab />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative w-full h-[750px] overflow-hidden">
          <img
            src="/Images/BannerBackground.jpg"
            alt="Banner Background"
            className="absolute inset-0 w-full h-full object-cover filter blur-[3px] brightness-65"
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
              <button className="bg-[#A65C37] hover:bg-[#d36e3b] hover:scale-103 text-white font-medium py-3 px-6 rounded-full transition cursor-pointer">
                Order Sekarang
              </button>
              <button className="bg-gray-200 text-gray-800 hover:bg-white hover:scale-103 font-medium py-3 px-6 rounded-full transition cursor-pointer">
                Lihat Menu
              </button>
            </div>
          </div>
        </section>

       {/* Kenapa Memilih Kami? Section */}
        <section className="py-16 bg-white px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-medium text-center mb-12">Kenapa Memilih Kami?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-xl hover:shadow-[#ffb691] transition">
                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                  <img src="/Icons/MoneyIcon.png" alt="Bayar Saat Pesanan Tiba" className="w-12 h-12 object-contain" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Bayar Saat Pesanan Tiba</h3>
                <p className="text-gray-600 text-sm">
                  Pesan tanpa khawatir — nikmati dulu kelezatannya, lalu bayar setelah pesanan sampai di tangan Anda. Praktis, aman, dan terpercaya.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-xl hover:shadow-[#ffb691] transition">
                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                  <img src="/Icons/PercentIcon.png" alt="Kepuasan Pelanggan Utama Kami" className="w-12 h-12 object-contain" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Kepuasan Pelanggan Utama Kami</h3>
                <p className="text-gray-600 text-sm">
                  Kami selalu berusaha memberikan rasa dan pelayanan terbaik. Karena bagi kami, kebahagiaan Anda adalah kesuksesan kami.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-xl hover:shadow-[#ffb691] transition">
                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                  <img src="/Icons/FindIcon.png" alt="Resep Asli Rumahan" className="w-12 h-12 object-contain" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Resep Asli Rumahan</h3>
                <p className="text-gray-600 text-sm">
                  Menunjukkan kehangatan dan ketulusan dalam proses pembuatan, cocok banget untuk tema rumahan dan halal.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-xl hover:shadow-[#ffb691] transition">
                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                  <img src="/Icons/QualityIcon.png" alt="Kualitas Terjamin, Rasa Konsisten" className="w-12 h-12 object-contain" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Kualitas Terjamin, Rasa Konsisten</h3>
                <p className="text-gray-600 text-sm">
                  Kami menjaga setiap proses agar rasa dimsum kami selalu sama: lezat, lembut, dan terpercaya.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Special Menu Section */}
        <section className="py-10 bg-white px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-4xl font-medium text-center text-gray-800 mb-8">Nikmati juga berbagai pilihan menu spesial kami!</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Menu 1 */}
              <div className="bg-white rounded-xl overflow-hidden shadow-sm transition">
                <div className="h-48 overflow-hidden">
                  <img src="/Images/DimsumMentai2.png" alt="Dimsum Mentai" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-800">Dimsum Mentai</h3>
                </div>
              </div>

              {/* Menu 2 */}
              <div className="bg-white rounded-xl overflow-hidden shadow-sm transition">
                <div className="h-48 overflow-hidden">
                  <img src="/Images/Gyoza2.png" alt="Gyoza" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-800">Gyoza</h3>
                </div>
              </div>

              {/* Menu 3 */}
              <div className="bg-white rounded-xl overflow-hidden shadow-sm transition">
                <div className="h-48 overflow-hidden">
                  <img src="/Images/SphagettiBrulee2.png" alt="Spaghetti Brulee" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-800">Spaghetti Brulee</h3>
                </div>
              </div>

              {/* Menu 4 */}
              <div className="bg-white rounded-xl overflow-hidden shadow-sm transition">
                <div className="h-48 overflow-hidden">
                  <img src="/Images/ChickenKatsuMentaiRice2.png" alt="Chicken Katsu Mental Rice" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-800">Chicken Katsu Mental Rice</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Menu Section */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-yellow-50 p-8 rounded-xl border-2 border-orange-900">
              <h2 className="text-2xl md:text-3xl font-b  old text-gray-800 mb-8">Jelajahi Beragam Menu Kami</h2>
              <p className="text-gray-600 mb-6">
                Dimsum buatan tangan dengan rasa rumahan yang autentik,<br />
                dibuat dengan sepenuh hati untuk Anda.
              </p>
              <button className="bg-[#A65C37] hover:bg-[#d36e3b] cursor-pointer text-white font-medium py-2 px-6 rounded-full transition">
                View Full Menu
              </button>
            </div>
          </div>
        </section>

        {/* Outlet Kami Section */}
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
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Outlet Kami"
                className="w-full"
              ></iframe>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}