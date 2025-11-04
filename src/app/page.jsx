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
     <div className="font-montserrat"> {/* <-- Semua teks pakai Montserrat */}
       <NavbarTab />
 
       {/* Hero Section */}
       <section className="relative w-full h-[750px] overflow-hidden">
         {/* Background Image with Blur */}
         <img
           src="/Images/BannerBackground.jpg"
           alt="Banner Background"
           className="absolute inset-0 w-full h-full object-cover filter blur-[3px] brightness-65"
         />
 
         {/* Overlay Content */}
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
             <button className="bg-blue-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-full transition">
               Order Sekarang
             </button>
             <button className="bg-white text-gray-800 hover:bg-gray-300 font-medium py-3 px-6 rounded-full transition">
               Lihat Menu
             </button>
           </div>
         </div>
       </section>
 
       {/* Kenapa Memilih Kami? Section */}
       <section className="py-16 bg-white px-4">
         <div className="max-w-6xl mx-auto">
           <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">Kenapa Memilih Kami?</h2>
 
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {/* Card 1 - Bayar Saat Pesanan Tiba */}
             <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-xl hover:shadow-orange-100 transition flex flex-col items-center text-center border border-gray-200">
               <div className="w-16 h-16 mb-4 flex items-center justify-center">
                 <img
                   src="/Icons/MoneyIcon.png"
                   alt="Bayar Saat Pesanan Tiba"
                   className="w-12 h-12 object-contain"
                 />
               </div>
               <h3 className="text-xl font-semibold mb-2">Bayar Saat Pesanan Tiba</h3>
               <p className="text-gray-600 text-sm">
                 Pesan tanpa khawatir — nikmati dulu kelezatannya, lalu bayar setelah pesanan sampai di tangan Anda. Praktis, aman, dan terpercaya.
               </p>
             </div>
 
             {/* Card 2 - Kepuasan Pelanggan Utama Kami */}
             <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-xl hover:shadow-orange-100 transition flex flex-col items-center text-center border border-gray-200">
               <div className="w-16 h-16 mb-4 flex items-center justify-center">
                 <img
                   src="/Icons/PercentIcon.png"
                   alt="Kepuasan Pelanggan Utama Kami"
                   className="w-12 h-12 object-contain"
                 />
               </div>
               <h3 className="text-xl font-semibold mb-2">Kepuasan Pelanggan Utama Kami</h3>
               <p className="text-gray-600 text-sm">
                 Kami selalu berusaha memberikan rasa dan pelayanan terbaik. Karena bagi kami, kebahagiaan Anda adalah kesuksesan kami.
               </p>
             </div>
 
             {/* Card 3 - Resep Asli Rumahan */}
             <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-xl hover:shadow-orange-100 transition flex flex-col items-center text-center border border-gray-200">
               <div className="w-16 h-16 mb-4 flex items-center justify-center">
                 <img
                   src="/Icons/FindIcon.png"
                   alt="Resep Asli Rumahan"
                   className="w-12 h-12 object-contain"
                 />
               </div>
               <h3 className="text-xl font-semibold mb-2">Resep Asli Rumahan</h3>
               <p className="text-gray-600 text-sm">
                 Menunjukkan kehangatan dan ketulusan dalam proses pembuatan, cocok banget untuk tema rumahan dan halal.
               </p>
             </div>
 
             {/* Card 4 - Kualitas Terjamin, Rasa Konsisten */}
             <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-xl hover:shadow-orange-100 transition flex flex-col items-center text-center border border-gray-200">
               <div className="w-16 h-16 mb-4 flex items-center justify-center">
                 <img
                   src="/Icons/QualityIcon.png"
                   alt="Kualitas Terjamin, Rasa Konsisten"
                   className="w-12 h-12 object-contain"
                 />
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
           <h2 className="text-4xl md:text-4xl font-medium text-center  text-gray-800 mb-8">Nikmati jugaberbagai pilihan menu spesial kami!</h2>
 
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 
             {/* Menu 1 - Dimsum Mentai */}
             <div className="group">
               <div className="rounded-lg overflow-hidden mb-3">
                 <img
                   src="/Images/DimsumMentai2.png"
                   alt="Dimsum Mentai"
                   className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                   loading="lazy"
                 />
               </div>
               <h3 className="text-lg font-medium text-gray-800">Dimsum Mentai</h3>
             </div>
 
             {/* Menu 2 - Gyoza */}
             <div className="group">
               <div className="rounded-lg overflow-hidden mb-3">
                 <img
                   src="/Images/Gyoza2.png"
                   alt="Gyoza"
                   className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                 />
               </div>
               <h3 className="text-lg font-medium text-gray-800">Gyoza</h3>
             </div>
 
             {/* Menu 3 - Spaghetti Brulee */}
             <div className="group">
               <div className="rounded-lg overflow-hidden mb-3">
                 <img
                   src="/Images/SphagettiBrulee2.png"
                   alt="Spaghetti Brulee"
                   className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                 />
               </div>
               <h3 className="text-lg font-medium text-gray-800">Spaghetti Brulee</h3>
             </div>
 
             {/* Menu 4 - Chicken Katsu Mental Rice */}
             <div className="group">
               <div className="rounded-lg overflow-hidden mb-3">
                 <img
                   src="/Images/ChickenKatsuMentaiRice2.png"
                   alt="Chicken Katsu Mental Rice"
                   className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                 />
               </div>
               <h3 className="text-lg font-medium text-gray-800">Chicken Katsu Mental Rice</h3>
             </div>
           </div>
         </div>
       </section>
 
       {/* Explore Menu Section */}
       <section className="py-16 px-4">
         <div className="max-w-4xl mx-auto text-center">
           <div className="bg-yellow-50 p-8 rounded-xl border-2 border-orange-900">
             <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">Jelajahi Beragam Menu Kami</h2>
             <p className="text-gray-600 mb-6">
               Dimsum buatan tangan dengan rasa rumahan yang autentik,<br />
               dibuat dengan sepenuh hati untuk Anda.
             </p>
             <button className="bg-yellow-700 hover:bg-yellow-800 text-white font-medium py-2 px-6 rounded-full transition">
               View Full Menu
             </button>
           </div>
         </div>
       </section>
 
       {/* Outlet Kami Section */}
       <section className="py-16 bg-white px-4">
         <div className="max-w-6xl mx-auto">
           <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Outlet Kami</h2>
           <p className="text-gray-600 mb-8">Tersedia layanan COD & Delivery ke area sekitar.</p>
 
           {/* Map Image + Link */}
           <div className="relative">
             <a
               href="https://maps.app.goo.gl/Nc3r3DhUe11powo16"
               target="_blank"
               rel="noopener noreferrer"
               className="block border-4 rounded-xl border-orange-900"
             >
               <img
                 src="/Images/Location.png" // Ganti dengan screenshot peta kamu
                 alt="Lokasi Outlet Kami"
                 className="w-full h-auto rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
                 loading="lazy"
               />
             </a>
             <p className="text-center mt-4 text-sm text-gray-500">
               (Klik peta di atas untuk lihat lokasi di Google Maps)
             </p>
           </div>
         </div>
       </section>
 
       <Footer />
       {/* Konten selanjutnya bisa ditambahkan di sini */}
     </div>
  );
}
