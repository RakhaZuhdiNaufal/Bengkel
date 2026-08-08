"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function KasirLogin() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Kredensial tidak valid.");
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      // Check role
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (profile?.role === "kasir") {
        window.location.href = "/kasir/dashboard";
      } else {
        await supabase.auth.signOut();
        setErrorMsg("Akses ditolak. Anda bukan kasir.");
      }
    } else {
      setErrorMsg("Gagal memuat profil akun.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] flex font-sans">
      {/* Sisi Kiri: Panel Dekoratif Lebih Kecil/Proporsional */}
      <div className="hidden lg:flex lg:w-[42%] bg-[#121212] border-r border-white/5 relative overflow-hidden items-center justify-center p-10">
        <div className="relative z-10 max-w-md space-y-5 text-center">
          <div className="w-20 h-20 bg-[#E07A5F] rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(224,122,95,0.3)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17V7"/></svg>
          </div>
          <h1 className="text-3xl font-black text-white">Kasir Portal</h1>
          <p className="text-white/50 text-sm">Sistem Pembayaran Terpadu Auto Craft.</p>
        </div>
      </div>

      {/* Sisi Kanan: Form Login */}
      <div className="w-full lg:w-[58%] flex items-center justify-center p-6 sm:p-12 relative bg-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md space-y-6"
        >
          <div className="space-y-2">
            <div className="inline-block text-[#F4F1DE] font-black text-2xl tracking-tighter">
              AUTO CRAFT
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Akses Kasir
            </h2>
            <p className="text-xs text-white/60">
              Silakan masukkan kredensial kasir Anda untuk memulai shift.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-xs font-semibold">
                {errorMsg}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Alamat Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kasir@autocraft.com"
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition placeholder:text-white/30 shadow-inner"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Kata Sandi
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition placeholder:text-white/30 shadow-inner"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E07A5F] hover:bg-[#d0694e] text-black font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(224,122,95,0.2)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Memverifikasi..." : "Mulai Sesi Kasir"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
