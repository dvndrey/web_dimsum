'use client";'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Package, List, MessageCircle, Settings, HelpCircle } from "lucide-react";
import Image from "next/image";

const items = [
  { title: "Dashboard", icon: Home },
  { title: "Produk", icon: Package },
  { title: "Kategori", icon: List },
  { title: "Pesanan", icon: MessageCircle },
  { title: "Settings", icon: Settings },
];

export function AppSidebar({ activePage, setActivePage }) {
  return (
    <Sidebar className="text-gray-800"
      style={
        {
          "--sidebar": "oklch(1 0 0 / 0)", 
          background: "linear-gradient(to bottom, #F5F2E9, #C69C6D)",
        }
      }
      >
      {/* Header Logo & Title */}
      <div className="flex items-center gap-2 p-4">
        <Image
          src="/logo_client.png"
          alt="Logo"
          width={50}
          height={50}
        />
        <span className="font-bold">Say! Endulque</span>
      </div>

      {/* Main Menu */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={activePage === item.title}
                    onClick={() => setActivePage(item.title)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activePage === item.title
                        ? "bg-white text-gray-900 shadow-sm"
                        : "hover:bg-[#D9C7A7]"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Help */}
      <div className="p-4 mt-auto">
        <a
          href="https://wa.me/6282136430233"
          target="_blank"
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <HelpCircle className="h-5 w-5" />
          Help
        </a>
      </div>
    </Sidebar>
  );
}