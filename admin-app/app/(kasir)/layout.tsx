"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Receipt } from "lucide-react";

export default function KasirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    checkRole();
  }, []);

  const checkRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/kasir-login");
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile || profile.role !== "kasir") {
      router.replace("/kasir-login");
      return;
    }

    setUserEmail(session.user.email || "");
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/kasir-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center text-gray-800">
        Memuat Portal Kasir...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-gray-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-gradient-to-b from-[#4A6B8A] to-[#39546D] border-b border-[#2C4155] shadow-md px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3 text-white">
          <div className="w-9 h-9 rounded bg-white/10 border border-white/20 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold tracking-wide text-lg leading-tight">OIC Export - Cashier Portal</h1>
            <p className="text-[10px] text-white/70 uppercase tracking-widest leading-none">{userEmail}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-100 border border-red-500/30 rounded text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
