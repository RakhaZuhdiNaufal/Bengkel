"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { branches } from "@/data/dummy";

export default function LokasiPage() {
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
          <span className="text-white font-bold text-sm">Lokasi Jaringan Bengkel</span>
        </div>
      </header>

      {/* HERO */}
      <section className="px-6 py-16 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
          Temukan Cabang <span className="text-[#E07A5F]">Terdekat</span>
        </h1>
        <p className="text-white/60 text-sm sm:text-base max-w-2xl mx-auto">
          Jaringan Auto Craft tersebar di berbagai kota besar di Indonesia. Kami siap melayani perbaikan dan modifikasi kendaraan kesayangan Anda dengan standar yang sama di setiap cabangnya.
        </p>
      </section>

      <main className="max-w-7xl mx-auto px-6">
        
        {/* BIG MAP PLACEHOLDER */}
        <div className="w-full h-[400px] sm:h-[500px] bg-[#1A1A1A] rounded-[32px] border border-white/10 mb-12 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          
          <div className="absolute bottom-8 left-8 right-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
            <div>
              <div className="bg-[#E07A5F] text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                Pusat
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-2 shadow-black drop-shadow-lg">Auto Craft Jakarta Selatan</h2>
              <p className="text-white/90 text-sm shadow-black drop-shadow-md">Jl. Arteri Pondok Indah No. 99, Kebayoran Lama, Jakarta Selatan</p>
            </div>
            <button className="bg-white hover:bg-gray-200 text-black font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 flex-shrink-0">
              <Navigation className="w-4 h-4" /> Buka di Google Maps
            </button>
          </div>
        </div>

        {/* LIST OF BRANCHES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((b, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#121212] border border-white/10 rounded-3xl p-6 hover:border-[#E07A5F]/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#E07A5F] mb-6 group-hover:bg-[#E07A5F] group-hover:text-white transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{b}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 text-sm text-white/60">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/40" />
                  <span>Jl. Contoh Alamat Cabang No. {idx + 1}, Kota Besar, 12345</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <Clock className="w-4 h-4 flex-shrink-0 text-white/40" />
                  <span>Buka Setiap Hari (09:00 - 17:00)</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <Phone className="w-4 h-4 flex-shrink-0 text-white/40" />
                  <span>+62 811 2233 44{idx}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-white/5 hover:bg-[#E07A5F] text-white font-bold py-2.5 rounded-xl border border-white/10 hover:border-[#E07A5F] transition text-xs flex items-center justify-center gap-2">
                  <Navigation className="w-3 h-3" /> Rute
                </button>
                <button className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 rounded-xl border border-white/10 transition text-xs flex items-center justify-center gap-2">
                  <Phone className="w-3 h-3" /> Hubungi
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </main>
    </div>
  );
}
