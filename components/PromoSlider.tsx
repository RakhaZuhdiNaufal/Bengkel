"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { promos } from "@/data/dummy";
import { ChevronLeft, ChevronRight, Timer } from "lucide-react";

export default function PromoSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % promos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % promos.length);
  const prev = () => setCurrent((prev) => (prev - 1 + promos.length) % promos.length);

  return (
    <section className="py-20 bg-[#121212] border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12 space-y-3">
          <p className="text-[#E07A5F] text-xs font-bold tracking-widest uppercase">
            Penawaran Spesial
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Promo Terbaru
          </h2>
        </div>

        <div className="relative w-full max-w-5xl mx-auto">
          <div className="overflow-hidden rounded-3xl relative h-[400px] shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <img
                  src={promos[current].bgImage}
                  alt={promos[current].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
                
                <div className="absolute inset-0 flex flex-col justify-center p-8 sm:p-16 max-w-2xl">
                  <span className="inline-block px-4 py-1.5 bg-[#E07A5F] text-black text-[10px] font-black tracking-widest uppercase rounded-full mb-6 w-max">
                    {promos[current].badge}
                  </span>
                  <h3 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
                    {promos[current].title}
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base mb-8 max-w-md">
                    {promos[current].desc}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <button className="bg-white hover:bg-gray-200 text-black font-extrabold text-sm px-8 py-3.5 rounded-xl transition-colors">
                      Klaim Promo
                    </button>
                    <div className="flex items-center gap-2 text-white/70 text-xs font-semibold bg-black/40 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
                      <Timer className="w-4 h-4 text-[#E07A5F]" />
                      {promos[current].validUntil}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button onClick={prev} className="absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#1A1A1A] border border-white/10 hover:border-[#E07A5F] rounded-full flex items-center justify-center text-white hover:text-[#E07A5F] transition-all z-10 shadow-xl">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={next} className="absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#1A1A1A] border border-white/10 hover:border-[#E07A5F] rounded-full flex items-center justify-center text-white hover:text-[#E07A5F] transition-all z-10 shadow-xl">
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="flex justify-center gap-2 mt-6">
            {promos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all ${
                  current === idx ? "w-8 bg-[#E07A5F]" : "w-2 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
