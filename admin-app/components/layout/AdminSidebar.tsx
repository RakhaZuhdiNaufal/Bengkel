"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Wrench, 
  WalletCards,
  LogOut,
  Package
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Pengguna", href: "/users", icon: Users },
  { name: "Pesanan", href: "/bookings", icon: CalendarCheck },
  { name: "Servis", href: "/services", icon: Wrench },
  { name: "Kasir", href: "/payments", icon: WalletCards },
  { name: "Stok Barang", href: "/inventory", icon: Package },

  { name: "Laporan", href: "/reports", icon: LayoutDashboard },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-[#121212] border-r border-white/10 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="inline-block">
          <h1 className="text-2xl font-black tracking-tighter text-[#F4F1DE] hover:text-[#E07A5F] transition-colors">
            AUTO CRAFT
          </h1>
          <p className="text-[#E07A5F] text-xs font-bold tracking-widest uppercase mt-1">Admin Panel</p>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                isActive 
                  ? "text-white" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#E07A5F]/20 border border-[#E07A5F]/50 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              <span className="font-semibold text-sm relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-semibold text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
