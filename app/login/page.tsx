"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
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
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (profile?.role === "admin" || profile?.role === "kasir") {
        router.push("/admin");
      } else {
        const redirect =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("redirect")
            : null;
        router.push(redirect || "/akun");
      }
    } else {
      router.push("/akun");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] flex font-sans">
      {/* Sisi Kiri: Panel Dekoratif Lebih Kecil/Proporsional */}
      <div className="hidden lg:flex lg:w-[42%] bg-[#E07A5F] relative overflow-hidden items-center justify-center p-10">
        <div className="relative z-10 max-w-md space-y-5 text-black">
        </div>

        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Sisi Kanan: Form Login (Dominan Hitam & Lebih Luas) */}
      <div className="w-full lg:w-[58%] flex items-center justify-center p-6 sm:p-12 relative bg-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md space-y-6"
        >
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-block text-[#F4F1DE] font-black text-2xl tracking-tighter hover:text-[#E07A5F] transition"
            >
              AUTO CRAFT
            </Link>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Selamat Datang Kembali
            </h2>
            <p className="text-xs text-white/60">
              Masukkan kredensial Anda untuk mengakses akun.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121212] p-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">
              Akun staff (tanpa register)
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@autocraft.com");
                  setPassword("Admin123!");
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left transition hover:border-[#E07A5F]/50 hover:bg-[#E07A5F]/10"
              >
                <span className="block text-xs font-bold text-white">Admin</span>
                <span className="block text-[11px] text-white/45 truncate">
                  admin@autocraft.com
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("kasir@autocraft.com");
                  setPassword("Kasir123!");
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left transition hover:border-[#E07A5F]/50 hover:bg-[#E07A5F]/10"
              >
                <span className="block text-xs font-bold text-white">Kasir</span>
                <span className="block text-[11px] text-white/45 truncate">
                  kasir@autocraft.com
                </span>
              </button>
            </div>
            <p className="text-[10px] text-white/35 leading-relaxed">
              Password: <span className="text-white/60">Admin123!</span> /{" "}
              <span className="text-white/60">Kasir123!</span> — buat user di
              Supabase Auth (Auto Confirm), lalu jalankan{" "}
              <code className="text-white/50">supabase/seed_admin.sql</code>
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
                placeholder="nama@email.com"
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition placeholder:text-white/30 shadow-inner"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-white/80">
                  Kata Sandi
                </label>
                <Link
                  href="/lupa-password"
                  className="text-[11px] text-[#E07A5F] hover:underline font-medium"
                >
                  Lupa sandi?
                </Link>
              </div>
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
              className="w-full bg-[#E07A5F] hover:bg-[#d0694e] disabled:bg-[#E07A5F]/50 disabled:cursor-not-allowed text-white font-bold text-sm py-4 rounded-xl transition shadow-lg shadow-[#E07A5F]/20 active:scale-[0.98] mt-2 cursor-pointer flex justify-center items-center"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="text-center text-xs text-white/60 pt-2">
            Customer baru?{" "}
            <Link
              href="/register"
              className="text-[#E07A5F] font-semibold hover:underline"
            >
              Daftar di sini
            </Link>
            <span className="block mt-1 text-white/35">
              Admin/Kasir tidak perlu register — langsung login.
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
