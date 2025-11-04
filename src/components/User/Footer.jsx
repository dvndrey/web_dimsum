// src/components/User/Footer.jsx

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-yellow-700 text-white py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">

        {/* Left Section - Brand (Pepet Kiri) */}
        <div>
          <h2 className="text-4xl font-bold mb-2">Say!</h2>
          <h3 className="text-4xl font-bold mb-4">Endulque</h3>
          <p className="text-sm opacity-80 max-w-xs">
            Nikmati dimsum lezat dengan cita rasa istimewa. Rasakan pengalaman kuliner terbaik bersama kami!
          </p>
        </div>

        {/* Right Section - Contact & Social Media (Pepet Kanan) */}
        <div className="text-right">
          <h3 className="text-lg font-semibold mb-4">Hubungi Kami</h3>
          
          <div className="space-y-3 text-sm mb-6">
            <div className="flex items-center justify-end gap-2">
              <img src="/Icons/TelephoneIcon.png" alt="Telepon" className="w-5 h-5" />
              <span>0838 6631 4265</span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <img src="/Icons/LocationIcon.png" alt="Lokasi" className="w-5 h-5" />
              <span>Gilingan, Kec. Banjarsari</span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <img src="/Icons/MailIcon.png" alt="Email" className="w-5 h-5" />
              <span>sayendulque@gmail.com</span>
            </div>
          </div>

          {/* Social Media Icons - Right Aligned */}
          <div className="flex justify-end gap-4 cursor-pointer">
            <a href="" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <img src="/Icons/TikTokIcon.png" alt="Tiktok" className="w-6 h-6 hover:opacity-80 transition" />
            </a>

            <a href="" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <img src="/Icons/InstagramIcon.png" alt="Instagram" className="w-6 h-6 hover:opacity-80 transition" />
            </a>

          </div>
        </div>

      </div>

      {/* Copyright - Centered */}
      <div className="mt-8 pt-8 border-t border-white text-center text-xs opacity-70">
        © 2020 Say! Endulque. All rights reserved.
      </div>
    </footer>
  );
}