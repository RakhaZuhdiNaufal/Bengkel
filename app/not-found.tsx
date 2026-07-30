"use client";

import Link from "next/link";
import { AlertOctagon, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E07A5F]/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center z-10"
      >
        <div className="text-[150px] sm:text-[200px] font-black leading-none text-white/5 relative inline-block">
          404
          <div className="absolute inset-0 flex items-center justify-center text-[#E07A5F]">
            <AlertOctagon className="w-24 h-24 sm:w-32 sm:h-32" />
          </div>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-8 mb-4">Halaman Tidak Ditemukan</h1>
        <p className="text-white/50 mb-10 max-w-md mx-auto">
          Ups! Sepertinya Anda tersesat. Halaman yang Anda cari mungkin telah dihapus, diubah namanya, atau tidak pernah ada.
        </p>

        <Link 
          href="/home" 
          className="inline-flex items-center gap-2 bg-[#E07A5F] hover:bg-[#d0694e] text-white font-bold px-8 py-4 rounded-2xl transition shadow-[0_0_20px_rgba(224,122,95,0.2)]"
        >
          <ArrowLeft className="w-5 h-5" /> Kembali ke Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
