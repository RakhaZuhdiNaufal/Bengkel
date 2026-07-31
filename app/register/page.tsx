"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          nomor_hp: phone,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] flex font-sans">
      {/* Sisi Kiri: Panel Dekoratif Lebih Kecil/Proporsional */}
      <div className="hidden lg:flex lg:w-[42%] bg-[#E07A5F] relative overflow-hidden items-center justify-center p-10">
        <div className="relative z-10 max-w-md space-y-5 text-black">
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

          <form onSubmit={handleRegister} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-xs font-semibold">
                {errorMsg}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition placeholder:text-white/30 shadow-inner"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Nomor HP
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition placeholder:text-white/30 shadow-inner"
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
                placeholder="Minimal 8 karakter"
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition placeholder:text-white/30 shadow-inner"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E07A5F] hover:bg-[#d0694e] disabled:bg-[#E07A5F]/50 disabled:cursor-not-allowed text-white font-bold text-sm py-4 rounded-xl transition shadow-lg shadow-[#E07A5F]/20 active:scale-[0.98] mt-2 cursor-pointer flex justify-center items-center"
            >
              {loading ? "Memproses..." : "Daftar"}
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
