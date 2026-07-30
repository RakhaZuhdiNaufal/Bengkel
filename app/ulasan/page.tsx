"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Star, MessageSquare, ThumbsUp, PenLine } from "lucide-react";
import { testimonials } from "@/data/dummy";

export default function UlasanPage() {
  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] font-sans selection:bg-[#E07A5F]/30 pb-24">
      {/* HEADER */}
      <header className="bg-[#121212]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/home"
            className="flex items-center gap-2 text-white/70 hover:text-white transition text-sm font-semibold"
          >
            ← Kembali ke Dashboard
          </Link>
          <span className="text-white font-bold text-sm">Ulasan Pelanggan</span>
        </div>
      </header>

      {/* HERO / RATING SUMMARY */}
      <section className="px-6 py-12 max-w-7xl mx-auto">
        <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#E07A5F]/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="text-center md:text-left z-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              Apa Kata <span className="text-[#E07A5F]">Mereka?</span>
            </h1>
            <p className="text-white/60 text-sm max-w-md">
              Lebih dari 2,000+ pelanggan mempercayakan kendaraan premiumnya kepada teknisi ahli di Auto Craft.
            </p>
          </div>

          <div className="bg-[#1A1A1A] border border-white/5 rounded-3xl p-8 text-center min-w-[250px] z-10">
            <h2 className="text-6xl font-black text-white mb-2">4.9<span className="text-2xl text-white/40">/5</span></h2>
            <div className="flex justify-center gap-1 text-[#E07A5F] mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-6 h-6 fill-current" />
              ))}
            </div>
            <p className="text-xs text-white/50 uppercase tracking-widest font-bold">Berdasarkan 2,142 Ulasan</p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6">
        
        {/* FILTERS & ACTION */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
            <button className="bg-[#E07A5F] text-white font-bold py-2 px-6 rounded-full text-sm flex-shrink-0">Semua Ulasan</button>
            <button className="bg-[#121212] border border-white/10 text-white/70 hover:text-white font-bold py-2 px-6 rounded-full text-sm transition flex-shrink-0">Dengan Foto</button>
            <button className="bg-[#121212] border border-white/10 text-white/70 hover:text-white font-bold py-2 px-6 rounded-full text-sm transition flex-shrink-0">Bintang 5</button>
          </div>
          <button className="w-full sm:w-auto bg-[#1A1A1A] hover:bg-white/10 border border-white/10 text-white font-bold py-3 px-6 rounded-xl transition text-sm flex items-center justify-center gap-2">
            <PenLine className="w-4 h-4" /> Tulis Ulasan Anda
          </button>
        </div>

        {/* REVIEWS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-[#121212] border border-white/10 rounded-3xl p-8 hover:border-[#E07A5F]/50 transition-colors flex flex-col"
            >
              <div className="flex items-center gap-4 mb-6">
                <img src={t.image} alt={t.name} className="w-14 h-14 rounded-full object-cover border-2 border-white/10" />
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">{t.name}</h3>
                  <p className="text-white/40 text-xs">{t.car}</p>
                </div>
              </div>
              
              <div className="flex gap-1 text-[#E07A5F] mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(t.rating) ? "fill-current" : "fill-transparent border-current"}`} />
                ))}
              </div>
              
              <div className="relative flex-1">
                <MessageSquare className="absolute -top-2 -left-2 w-8 h-8 text-white/5 -z-10" />
                <p className="text-white/70 text-sm leading-relaxed z-10 relative">"{t.comment}"</p>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                <span>12 Agustus 2026</span>
                <button className="flex items-center gap-1 hover:text-[#E07A5F] transition">
                  <ThumbsUp className="w-3 h-3" /> 12 Membantu
                </button>
              </div>
            </motion.div>
          ))}
          
          {/* Duplicate some for UI filling if needed, or just let it be */}
          {testimonials.map((t) => (
            <motion.div
              key={t.id + "-dup"}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-[#121212] border border-white/10 rounded-3xl p-8 hover:border-[#E07A5F]/50 transition-colors flex flex-col"
            >
              <div className="flex items-center gap-4 mb-6">
                <img src={t.image} alt={t.name} className="w-14 h-14 rounded-full object-cover border-2 border-white/10 grayscale" />
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">{t.name}</h3>
                  <p className="text-white/40 text-xs">{t.car}</p>
                </div>
              </div>
              <div className="flex gap-1 text-[#E07A5F] mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 fill-current`} />
                ))}
              </div>
              <div className="relative flex-1">
                <MessageSquare className="absolute -top-2 -left-2 w-8 h-8 text-white/5 -z-10" />
                <p className="text-white/70 text-sm leading-relaxed z-10 relative">"Sangat memuaskan. Mobil jadi lebih responsif dan enak diajak jalan jauh. Terima kasih Auto Craft!"</p>
              </div>
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                <span>05 Agustus 2026</span>
                <button className="flex items-center gap-1 hover:text-[#E07A5F] transition">
                  <ThumbsUp className="w-3 h-3" /> 5 Membantu
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
