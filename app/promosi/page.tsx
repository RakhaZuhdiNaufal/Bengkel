"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Ticket, Timer, ChevronRight, Gift } from "lucide-react";
import { promos } from "@/data/dummy";

export default function PromosiPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 30,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) days--;
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
          <span className="text-white font-bold text-sm flex items-center gap-2">
            <Ticket className="w-4 h-4 text-[#E07A5F]" /> Pusat Promosi
          </span>
        </div>
      </header>

      {/* FLASH SALE HERO */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-[#1A0A05] to-[#E07A5F]/20 border border-[#E07A5F]/30 rounded-[32px] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_0_50px_rgba(224,122,95,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1502877336475-76753f602dc1?q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none" />
          
          <div className="z-10 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-[#E07A5F] text-white text-xs font-bold px-3 py-1 rounded-full mb-4 animate-pulse">
              <Timer className="w-4 h-4" /> FLASH SALE
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              Diskon Spesial <br/> <span className="text-[#E07A5F]">Hingga 50%</span>
            </h1>
            <p className="text-white/80 text-sm max-w-md mx-auto md:mx-0">
              Jangan lewatkan penawaran terbatas untuk servis berkala, ganti oli, dan auto detailing. Segera klaim sebelum kehabisan!
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="z-10 flex gap-4">
            <div className="bg-black/50 backdrop-blur-md border border-[#E07A5F]/50 rounded-2xl p-4 w-20 text-center">
              <span className="text-3xl font-black text-white block mb-1">{String(timeLeft.days).padStart(2, '0')}</span>
              <span className="text-[10px] text-[#E07A5F] font-bold uppercase tracking-widest">Hari</span>
            </div>
            <div className="bg-black/50 backdrop-blur-md border border-[#E07A5F]/50 rounded-2xl p-4 w-20 text-center">
              <span className="text-3xl font-black text-white block mb-1">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[10px] text-[#E07A5F] font-bold uppercase tracking-widest">Jam</span>
            </div>
            <div className="bg-black/50 backdrop-blur-md border border-[#E07A5F]/50 rounded-2xl p-4 w-20 text-center">
              <span className="text-3xl font-black text-white block mb-1">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[10px] text-[#E07A5F] font-bold uppercase tracking-widest">Mnt</span>
            </div>
            <div className="bg-[#E07A5F]/20 backdrop-blur-md border border-[#E07A5F] rounded-2xl p-4 w-20 text-center shadow-[0_0_20px_rgba(224,122,95,0.3)]">
              <span className="text-3xl font-black text-white block mb-1">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[10px] text-[#E07A5F] font-bold uppercase tracking-widest">Dtk</span>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
          <Gift className="w-6 h-6 text-[#E07A5F]" /> Voucher Tersedia
        </h2>

        {/* PROMO CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {promos.map((promo) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#121212] border border-white/10 rounded-3xl overflow-hidden hover:border-[#E07A5F]/50 transition-all duration-300 group flex flex-col sm:flex-row"
            >
              {/* Image */}
              <div className="h-48 sm:h-auto sm:w-2/5 relative overflow-hidden bg-[#1A1A1A]">
                <img 
                  src={promo.bgImage} 
                  alt={promo.title} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute top-4 left-4 bg-[#E07A5F] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {promo.badge}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 sm:w-3/5 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-[#E07A5F] transition-colors">{promo.title}</h3>
                <p className="text-[#E07A5F] font-black text-2xl mb-2">{promo.discount}</p>
                <p className="text-white/60 text-sm mb-6 flex-1">{promo.desc}</p>
                
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-xs text-white/40">{promo.validUntil}</span>
                  <button className="text-[#E07A5F] hover:text-white font-bold text-sm flex items-center gap-1 transition">
                    Klaim Voucher <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
