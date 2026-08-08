"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Wrench, CalendarCheck, ClipboardList } from "lucide-react";
import Link from "next/link";

export default function MekanikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    checkRole();
  }, []);

  const checkRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/mekanik-login");
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile || profile.role !== "mekanik") {
      router.replace("/mekanik-login");
      return;
    }

    setUserEmail(session.user.email || "");
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/mekanik-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center text-gray-800">
        Memuat Portal Mekanik...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-gray-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-gradient-to-b from-[#E07A5F] to-[#c2654d] border-b border-[#a8523c] shadow-md px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3 text-white">
          <div className="w-9 h-9 rounded bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold tracking-wide text-lg leading-tight">OIC Export - Mekanik Portal</h1>
            <p className="text-[10px] text-white/90 uppercase tracking-widest leading-none">{userEmail}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-100 border border-red-500/30 rounded shadow text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </header>

      {/* Secondary Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm px-6 py-2 flex items-center gap-6 text-sm font-semibold sticky top-[61px] z-40">
        <Link 
          href="/mekanik/bookings" 
          className={`flex items-center gap-2 py-2 border-b-2 transition-colors ${pathname.includes('/mekanik/bookings') ? 'border-[#E07A5F] text-[#E07A5F]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          <CalendarCheck className="w-4 h-4" />
          Pesanan Masuk
        </Link>
        <Link 
          href="/mekanik/services" 
          className={`flex items-center gap-2 py-2 border-b-2 transition-colors ${pathname.includes('/mekanik/services') ? 'border-[#E07A5F] text-[#E07A5F]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
        >
          <ClipboardList className="w-4 h-4" />
          Sedang Diservis
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
