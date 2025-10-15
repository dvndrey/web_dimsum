"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ProdukTab from "@/components/produk/ProdukTab";
import { Toaster } from "sonner";
import CategoryTab from "@/components/produk/CategoryTab";
import SettingsTab from "@/components/produk/SettingsTab";
import { Sun, Moon, Search, Bell, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminPage() {
  const { user, loading, logout: authLogout } = useAuth();
  const router = useRouter();
  const [activePage, setActivePage] = useState("Produk");
  const [darkMode, setDarkMode] = useState(false);

  // Redirect ke /login jika tidak ada user dan loading sudah selesai
  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Jika sedang memuat, tampilkan loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memverifikasi autentikasi...</p>
        </div>
      </div>
    );
  }

  // Jika tidak ada user, jangan render apa-apa → akan diarahkan ke /login oleh useEffect
  if (!user) {
    return null; // ✅ TIDAK ADA FLASH UI ADMIN — AMAN!
  }

  // Fungsi untuk mendapatkan judul halaman aktif
  const getPageTitle = () => {
    const titles = {
      "Produk": "Manajemen Produk",
      "Kategori": "Manajemen Kategori", 
      "Pesanan": "Manajemen Pesanan",
      "Settings": "Pengaturan Toko"
    };
    return titles[activePage] || "Dashboard";
  };

  return (
    <SidebarProvider>
      <div className={`flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors`}>
        <AppSidebar activePage={activePage} setActivePage={setActivePage} />
        <div className="flex flex-1 flex-col min-w-0">
          {/* Enhanced Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 lg:px-6">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">Say Endulque</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 hidden lg:block">{getPageTitle()}</p>
                  </div>
                </div>
              </div>


              {/* Header Actions */}
              <div className="flex items-center space-x-2 lg:space-x-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setDarkMode(!darkMode)}
                  aria-label="Toggle dark mode"
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-red-600" 
                      onClick={async () => {
                        await authLogout();
                        router.push("/login");
                      }}
                    >
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-4 lg:p-6">
              {/* Page Header */}
              <div className="mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {getPageTitle()}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {activePage === "Produk" && "Kelola semua produk dan varian Anda"}
                  {activePage === "Kategori" && "Atur kategori produk untuk organisasi yang lebih baik"}
                  {activePage === "Pesanan" && "Pantau dan kelola pesanan pelanggan"}
                  {activePage === "Settings" && "Konfigurasi pengaturan toko Anda"}
                </p>
              </div>

              {/* Content Area */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[600px]">
                {activePage === "Produk" && <ProdukTab />}
                {activePage === "Kategori" && <CategoryTab />}
                {activePage === "Pesanan" && (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🛒</div>
                      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Pesanan</h3>
                      <p className="text-gray-500 dark:text-gray-400">Fitur ini masih dalam pengembangan</p>
                    </div>
                  </div>
                )}
                {activePage === "Settings" && <SettingsTab />}
              </div>
            </div>
          </main>
        </div>

        {/* Enhanced Toaster */}
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: darkMode ? 'rgb(30 41 59)' : 'white',
              border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
              color: darkMode ? '#f3f4f6' : '#374151',
            },
          }}
        />
      </div>
    </SidebarProvider>
  );
}