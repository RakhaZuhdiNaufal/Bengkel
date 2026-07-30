"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E07A5F]/10 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 sm:p-12 z-10 shadow-2xl relative"
      >
        <Link href="/login" className="absolute top-8 left-8 text-white/50 hover:text-white transition flex items-center gap-2 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        <div className="text-center mb-10 mt-8">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-[#E07A5F] mx-auto flex items-center justify-center mb-6">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Lupa Password?</h1>
          <p className="text-white/50 text-sm">Masukkan email yang terdaftar, kami akan mengirimkan instruksi pemulihan.</p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input 
                  type="email" 
                  required
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#E07A5F] hover:bg-[#d0694e] text-white font-bold py-4 rounded-2xl transition shadow-[0_0_20px_rgba(224,122,95,0.2)] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? "Mengirim..." : <><Send className="w-5 h-5" /> Kirim Link Pemulihan</>}
            </button>
          </form>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center bg-[#1A1A1A] border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-[#E07A5F] font-bold mb-2">Email Terkirim!</h3>
            <p className="text-sm text-white/70 mb-6">Silakan periksa kotak masuk (atau folder spam) Anda untuk instruksi selanjutnya.</p>
            <button 
              onClick={() => setIsSent(false)}
              className="text-sm font-semibold text-white/50 hover:text-white transition"
            >
              Kirim ulang email
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
