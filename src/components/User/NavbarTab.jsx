// src/components/User/NavbarTab.jsx
'use client';

import Image from 'next/image';

const NavItem = ({ children, isActive = false, onClick }) => (
  <button
    onClick={onClick}
    className={`py-2 font-medium transition-colors text-base ${
      isActive
        ? 'bg-[#A65C37] text-white rounded-full hover:bg-[#d36e3b] px-8'
        : 'text-gray-500 hover:text-gray-950 px-7'
    } transition-all duration-200`}
  >
    {children}
  </button>
);

const MobileHeader = () => (
  <header className="bg-white sticky top-0 z-50 border-b border-gray-100 font-sans md:hidden block px-4 py-3">
    <div className="flex items-center justify-center space-x-2">
      <a href="/" className="flex items-center">
        <Image src="/logo_client.png" alt="Logo" width={40} height={40} className="rounded-full" priority />
      </a>
      <h1 className="text-xl font-medium text-gray-900">Say! Endulque</h1>
    </div>
  </header>
);

const DesktopNavbar = ({ activeView, onSwitchView }) => (
  <header className="bg-white sticky top-0 z-50 border-b border-gray-100 font-sans md:block hidden">
    <div className="container mx-auto px-6 py-5 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <a href="/" className="flex items-center">
          <Image src="/logo_client.png" alt="Logo" width={50} height={50} className="rounded-full" priority />
        </a>
        <h1 className="text-3xl font-medium text-gray-900">Say! Endulque</h1>
      </div>

      <nav className="flex space-x-4">
        <NavItem onClick={() => onSwitchView('home')} isActive={activeView === 'home'}>Home</NavItem>
        <NavItem onClick={() => onSwitchView('menu')} isActive={activeView === 'menu'}>Menu</NavItem>
        <NavItem onClick={() => onSwitchView('cart')} isActive={activeView === 'cart'}>Keranjang</NavItem>
      </nav>

      <a href="https://wa.me/6285169901919" target="_blank" rel="noopener noreferrer"
         className="border-2 border-gray-600 text-gray-800 font-medium py-2 px-6 rounded-full hover:bg-[#d36e3b] hover:border-white hover:text-white transition">
        Order Sekarang
      </a>
    </div>
  </header>
);

const MobileNav = ({ activeView, onSwitchView }) => {
  const items = [
    { label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10M9 21h6', action: 'home' },
    { label: 'Menu', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', action: 'menu' },
    { label: 'Cart', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', action: 'cart' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#A65C37] text-white shadow-lg z-50 md:hidden">
      <div className="flex h-16">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => onSwitchView(item.action)}
            className={`flex-1 flex flex-col items-center justify-center space-y-1 ${
              activeView === item.action ? 'bg-white text-[#A65C37]' : 'text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default function NavbarTab({ activeView = 'home', onSwitchView = () => {} }) {
  return (
    <>
      <DesktopNavbar activeView={activeView} onSwitchView={onSwitchView} />
      <MobileHeader />
      <MobileNav activeView={activeView} onSwitchView={onSwitchView} />
    </>
  );
}