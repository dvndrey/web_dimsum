"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ProdukTab from "@/components/produk/ProdukTab";
import { Toaster } from "sonner";
import CategoryTab from "@/components/produk/CategoryTab";
import DashboardTab from "@/components/produk/DashboardTab";
import SettingsTab from "@/components/produk/SettingsTab";
import PesananTab from "@/components/produk/PesananTab";
import { Sun, Moon, Search, Bell, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminPage() {
  const { user, loading, logout: authLogout } = useAuth();
  const router = useRouter();
  const [activePage, setActivePage] = useState("Dashboard");
  const [darkMode, setDarkMode] = useState(false);

  const handleViewAllOrders = () => {
    setActivePage("Pesanan");
  };

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
    return null;
  }

  // Fungsi untuk mendapatkan judul halaman aktif
  const getPageTitle = () => {
    const titles = {
      "Dashboard": "Dashboard Admin",
      "Produk": "Manajemen Produk",
      "Kategori": "Manajemen Kategori", 
      "Pesanan": "Manajemen Pesanan",
      "Settings": "Pengaturan Toko"
    };
    return titles[activePage] || "Dashboard";
  };

  return (
    <SidebarProvider>
      <div className={`flex h-screen w-screen overflow-hidden bg-gray-50 transition-colors`}>
        <AppSidebar activePage={activePage} setActivePage={setActivePage} />
        <div className="flex flex-1 flex-col min-w-0">
          {/* Enhanced Header */}
          <header className="bg-[#F5F2E9] border-b border-gray-300 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 lg:px-6">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="lg:hidden" />
              </div>
              
              {/* Header Actions */}
              <div className="flex items-center space-x-2 lg:space-x-4">
                <Link href="/">Home</Link>
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
          <main className="flex-1 overflow-y-auto bg-[#F5F2E9]">
            <div className="container mx-auto p-4 lg:p-6">
              {/* Page Header */}
              <div className="mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {getPageTitle()}
                </h2>
              </div>

              {/* Content Area */}
              <div className="rounded-xl min-h-[600px]">
                {activePage === "Dashboard" && (
                  <DashboardTab onViewAllOrders={handleViewAllOrders} />
                )}
                {activePage === "Produk" && <ProdukTab />}
                {activePage === "Kategori" && <CategoryTab />}
                {activePage === "Pesanan" && <PesananTab />}
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