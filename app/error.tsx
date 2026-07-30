"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center z-10 bg-[#1A1A1A] border border-red-500/20 p-10 sm:p-16 rounded-[32px] max-w-lg w-full shadow-2xl"
      >
        <div className="w-24 h-24 bg-red-500/10 border border-red-500/30 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-500">
          <AlertTriangle className="w-12 h-12" />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Terjadi Kesalahan Sistem</h1>
        <p className="text-white/50 mb-10 text-sm">
          Mohon maaf, kami mengalami sedikit kendala teknis saat memproses permintaan Anda. Tim kami telah diberitahu mengenai masalah ini.
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold px-8 py-4 rounded-xl transition"
          >
            <RefreshCcw className="w-5 h-5" /> Coba Lagi
          </button>
          
          <Link 
            href="/home" 
            className="w-full inline-flex items-center justify-center gap-2 bg-[#121212] hover:bg-white/5 border border-white/10 text-white font-bold px-8 py-4 rounded-xl transition"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
