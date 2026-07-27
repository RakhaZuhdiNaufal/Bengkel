"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#E07A5F]/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#121212] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 backdrop-blur-xl"
      >
        <div className="text-center mb-8 space-y-2">
          <Link
            href="/"
            className="inline-block text-[#F4F1DE] font-black text-2xl tracking-tighter hover:text-[#E07A5F] transition"
          >
            AUTO CRAFT
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Selamat Datang Kembali
          </h1>
          <p className="text-xs text-white/60">
            Masukkan kredensial Anda untuk mengakses akun.
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Email / Username
            </label>
            <input
              type="text"
              placeholder="nama@email.com"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition placeholder:text-white/30"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-white/80">
                Kata Sandi
              </label>
              <a
                href="#"
                className="text-[11px] text-[#E07A5F] hover:underline"
              >
                Lupa sandi?
              </a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition placeholder:text-white/30"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#E07A5F] hover:bg-[#d0694e] text-white font-bold text-sm py-3.5 rounded-xl transition shadow-lg shadow-[#E07A5F]/20 active:scale-[0.98] mt-2"
          >
            Masuk
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-white/60">
          Belum memiliki akun?{" "}
          <Link
            href="/register"
            className="text-[#E07A5F] font-semibold hover:underline"
          >
            Daftar Sekarang
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
