import Image from 'next/image';
import Link from 'next/link';

const NavItem = ({ href, children, isActive }) => {
  // Menyesuaikan padding untuk tampilan yang lebih rapat
  const baseClass = "px-7 py-2 font-medium transition-colors text-base";
  
  // Gaya sesuai gambar: Home adalah tombol abu-abu (gray-300), Menu adalah teks biasa
  const activeClass = "bg-gray-200 text-gray-900 rounded-full";
  // Menyesuaikan warna default agar lebih terang (sesuai mockup)
  const defaultClass = "text-gray-500 hover:text-gray-950";

  return (
    <Link 
      href={href} 
      className={`${baseClass} ${isActive ? activeClass : defaultClass}`}
    >
      {children}
    </Link>
  );
};


export default function Header() {
  // Anggap rute saat ini adalah '/home' 
  const currentPath = '/home'; 

  return (
    // Menghilangkan shadow dan menggunakan border tipis di bawah
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100 font-sans">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between"> 
        {/* Padding Vertikal Disesuaikan (py-5) agar lebih lapang seperti mockup */}

        {/* Logo & Brand Name (Kiri) */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          
          {/* REVISI: Mengganti Placeholder dengan Komponen Image */}
          <Link href="/home" className="flex items-center">
            <Image
              src="/logo_client.png" // Pastikan file ini ada di folder 'public/' Anda
              alt="Logo Say! Endulque"
              width={50} // Ukuran lebih besar (sesuai visual di mockup)
              height={50} // Ukuran lebih besar (sesuai visual di mockup)
              // Menambahkan class untuk tampilan melingkar dan border (sesuai mockup)
              className="rounded-full object-cover h-15 w-15" 
              priority
            />
          </Link>

          {/* Nama Brand */}
          <Link href="/home">
            {/* Ukuran Font Disesuaikan (text-3xl ke text-2xl) agar lebih kompak */}
            <h1 className="text-3xl font-medium text-gray-900 tracking-wider">
              Say! Endulque
            </h1>
          </Link>
        </div>

        {/* Navigasi (Tengah) */}
        {/* Mengurangi space-x dari 8 menjadi 4 agar lebih dekat seperti di mockup */}
        <nav className="hidden md:flex justify-start space-x-4">
          {/* Item Home (Active state, berwarna abu-abu) */}
          <NavItem href="/home" isActive={currentPath === '/home'}>
            Home
          </NavItem>
          
          {/* Item Menu (Normal state) */}
          <NavItem href="/menu" isActive={currentPath === '/menu'}>
            Menu
          </NavItem>
        </nav>

        {/* Aksi & Utilitas (Kanan) */}
        <div className="flex items-center space-x-6">
          
          {/* Tombol Order Sekarang - Didesain seperti Outlined Button */}
          <Link 
            href="/order" 
            // Menyesuaikan class border agar lebih gelap dan rounded-xl menjadi rounded-full (atau rounded-2xl)
            className="hidden md:block border-2 border-gray-600 text-gray-800 font-medium py-2 px-6 rounded-full transition-all duration-200 
            hover:bg-black hover:text-white"
          >
            Order Sekarang
          </Link>

          {/* Ikon Search */}
          {/* Mengganti hidden md:block menjadi selalu terlihat (sesuai mockup) */}
          <button className="p-1 text-gray-800 hover:text-gray-900 transition-color">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Tombol Cart */}
          <Link href="/cart" className="relative p-1 text-gray-800 hover:text-gray-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </Link>

          {/* Mobile Menu Button (disembunyikan di layar besar karena tidak ada di mockup) */}
          <button className="md:hidden p-1 text-gray-800 hover:text-gray-900 transition-colors">
            {/* Hamburger Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
