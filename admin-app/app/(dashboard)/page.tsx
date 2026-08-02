"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
        setProfile(data);
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase]);

  if (loading) return <div className="text-white/60">Memuat dashboard...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-white/60 mt-1">Selamat datang kembali, {profile?.nama || "Admin"}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[#1A1A1A] border border-white/10 p-6 rounded-2xl hover:border-[#E07A5F]/50 transition-colors cursor-pointer group">
          <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-[#E07A5F] transition-colors">Pesanan Menunggu</h3>
          <div className="text-4xl font-black text-white/90">0</div>
          <p className="text-white/40 text-sm mt-2">Menunggu konfirmasi mekanik</p>
        </div>
        
        <div className="bg-[#1A1A1A] border border-white/10 p-6 rounded-2xl hover:border-[#E07A5F]/50 transition-colors cursor-pointer group">
          <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-[#E07A5F] transition-colors">Servis Berjalan</h3>
          <div className="text-4xl font-black text-white/90">0</div>
          <p className="text-white/40 text-sm mt-2">Sedang dikerjakan hari ini</p>
        </div>

        <div className="bg-[#1A1A1A] border border-white/10 p-6 rounded-2xl hover:border-[#E07A5F]/50 transition-colors cursor-pointer group">
          <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-[#E07A5F] transition-colors">Total Pelanggan</h3>
          <div className="text-4xl font-black text-white/90">0</div>
          <p className="text-white/40 text-sm mt-2">Pelanggan aktif terdaftar</p>
        </div>
      </div>
    </motion.div>
  );
}
