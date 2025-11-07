// src/components/User/Footer.jsx

import React, { useState, useEffect } from 'react';
import { getOwnerData } from '../../../services/ownService.js'; // Sesuaikan path ke ownService.js

export default function Footer() {
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const data = await getOwnerData();
        setOwner(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOwner();
  }, []);

  if (loading) {
    return (
      <footer className="bg-[#A65C37] text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 text-center">Loading...</div>
      </footer>
    );
  }

  if (error) {
    return (
      <footer className="bg-[#A65C37] text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 text-center text-red-300">
          Gagal memuat data pemilik: {error}
        </div>
      </footer>
    );
  }

  // Pastikan owner ada & fallback jika field kosong
  const alamat = owner?.alamat || 'Gilingan, Kec. Banjarsari';
  const telepon = owner?.no_hp || '+62 851-6990-1919';
  const email = owner?.email || 'sayendulque@gmail.com';

  return (
    <footer className="bg-[#A65C37] text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Flex Container */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-10">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start space-x-1">
              <h2 className="text-3xl md:text-4xl font-bold">Say!</h2>
              <h3 className="text-3xl md:text-4xl font-bold">Endulque</h3>
            </div>
            <p className="text-sm opacity-90 max-w-xs mt-3 text-center md:text-left mx-auto md:mx-0">
              Nikmati dimsum lezat dengan cita rasa istimewa. Rasakan pengalaman kuliner terbaik bersama kami!
            </p>
          </div>

          {/* Contact & Social */}
          <div className="flex flex-col items-center md:items-end w-full md:w-auto">
            <h3 className="text-lg font-semibold mb-4 text-center md:text-right w-full">Hubungi Kami</h3>

            <div className="space-y-3 text-sm w-full max-w-xs">
              <div className="flex items-center justify-center md:justify-end gap-2">
                <img src="/Icons/TelephoneIcon.png" alt="Telepon" className="w-5 h-5 flex-shrink-0" />
                <span>{telepon}</span>
              </div>

              <div className="flex items-center justify-center md:justify-end gap-2">
                <img src="/Icons/LocationIcon.png" alt="Lokasi" className="w-5 h-5 flex-shrink-0" />
                <span className="text-center md:text-right">{alamat}</span>
              </div>

              <div className="flex items-center justify-center md:justify-end gap-2">
                <img src="/Icons/MailIcon.png" alt="Email" className="w-5 h-5 flex-shrink-0" />
                <span className="text-center md:text-right break-words">{email}</span>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex justify-center md:justify-end gap-5 mt-5">
              <a
                href="https://www.tiktok.com/@say.endulque?"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="block hover:opacity-80 transition-transform hover:scale-110"
              >
                <img src="/Icons/TikTokIcon.png" alt="TikTok" className="w-6 h-6" />
              </a>
              <a
                href="https://www.instagram.com/say.endulque?igsh=MTZ3NXFyOW12dmNlbA%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="block hover:opacity-80 transition-transform hover:scale-110"
              >
                <img src="/Icons/InstagramIcon.png" alt="Instagram" className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-white/30 text-center text-xs opacity-80">
          © {new Date().getFullYear()} Say! Endulque. All rights reserved.
        </div>
      </div>
    </footer>
  );
}