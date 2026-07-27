"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] flex font-sans">
      {/* Sisi Kiri: Panel Dekoratif Lebih Kecil/Proporsional */}
      <div className="hidden lg:flex lg:w-[42%] bg-[#E07A5F] relative overflow-hidden items-center justify-center p-10">
        <div className="relative z-10 max-w-md space-y-5 text-black">
          <span className="bg-black/10 text-black px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest border border-black/10">
            AUTO CRAFT STUDIO
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-white drop-shadow-sm">
            Decide faster so you can do more
          </h1>
          <p className="text-xs sm:text-sm font-medium text-white/90 leading-relaxed">
            Bergabunglah sekarang untuk mendapatkan akses penuh ke layanan
            servis terbaik dan performa kendaraan maksimal.
          </p>
        </div>

        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Sisi Kanan: Form Register (Dominan Hitam & Lebih Luas) */}
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
              Buat Akun Baru
            </h2>
            <p className="text-xs text-white/60">
              Bergabunglah untuk mendapatkan layanan terbaik bagi kendaraan
              Anda.
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition placeholder:text-white/30 shadow-inner"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Alamat Email
              </label>
              <input
                type="email"
                placeholder="nama@email.com"
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
                placeholder="Minimal 8 karakter"
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition placeholder:text-white/30 shadow-inner"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#E07A5F] hover:bg-[#d0694e] text-white font-bold text-sm py-4 rounded-xl transition shadow-lg shadow-[#E07A5F]/20 active:scale-[0.98] mt-2 cursor-pointer"
            >
              Daftar
            </button>
          </form>

          <div className="text-center text-xs text-white/60 pt-2">
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="text-[#E07A5F] font-semibold hover:underline"
            >
              Masuk di sini
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
