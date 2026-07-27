"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const mainSlides = [
    {
      id: 1,
      title: "ECU Remap & Dyno Tuning",
      description:
        "Maksimalkan tenaga dan respons mesin dengan tuning presisi.",
      image:
        "https://i.pinimg.com/736x/0f/4a/f2/0f4af2cc3a6a5829c58efdbb67d7e8b3.jpg",
      align: "left",
    },
    {
      id: 2,
      title: "Performance Tuning",
      description: "Tuning profesional untuk performa yang lebih optimal.",
      image:
        "https://i.pinimg.com/736x/f1/2e/f5/f12ef578724ad14c6fc03f7aabc18ddd.jpg",
      align: "right",
    },
  ];

  const promoSlides = [
    {
      id: 1,
      badge: "PROMO BULAN INI",
      title: "PAKET SERVIS RUTIN + COATING",
      discount: "DISKON 30%",
      buttonText: "AMBIL PROMO",
      bgGradient: "from-[#2A2A2A] via-[#1E1E1E] to-[#121212]",
      image: "p.png",
    },
    {
      id: 2,
      badge: "FLASH SALE WEEKEND",
      title: "UPGRADE BRAKE KIT & EXHAUST",
      discount: "CASHBACK RP 1.5JT",
      buttonText: "BOOKING SEKARANG",
      bgGradient: "from-[#2A2A2A] via-[#1E1E1E] to-[#121212]",
      image:
        "https://images.unsplash.com/photo-1600793575654-910699b5e4d4?q=80&w=600&auto=format&fit=crop",
    },
  ];

  const [currentMain, setCurrentMain] = useState(0);
  const [currentPromo, setCurrentPromo] = useState(0);

  useEffect(() => {
    const timerMain = setInterval(() => {
      setCurrentMain((prev) => (prev + 1) % mainSlides.length);
    }, 6000);
    const timerPromo = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promoSlides.length);
    }, 5000);
    return () => {
      clearInterval(timerMain);
      clearInterval(timerPromo);
    };
  }, [mainSlides.length, promoSlides.length]);

  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link
              href="/home"
              className="text-[#F4F1DE] font-black text-2xl tracking-tighter hover:text-neutral-400 transition"
            >
              AUTO CRAFT
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => setActiveTab("overview")}
                className={`transition ${
                  activeTab === "overview"
                    ? "text-neutral-400"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Beranda
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`transition ${
                  activeTab === "services"
                    ? "text-neutral-400"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Layanan
              </button>
              <button
                onClick={() => setActiveTab("vehicles")}
                className={`transition ${
                  activeTab === "vehicles"
                    ? "text-neutral-400"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Garasi Saya
              </button>
            </nav>
          </div>

          <div className="flex-1 max-w-md mx-2 order-3 sm:order-2 w-full sm:w-auto">
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-white/40 text-sm">
                🔍
              </span>
              <input
                type="text"
                placeholder="Cari layanan, suku cadang, atau perawatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-full pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-neutral-500 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-white/40 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 order-2 sm:order-3">
            <Link
              href="/booking"
              className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold text-xs px-5 py-3 rounded-full transition shadow-md shadow-neutral-700/20 active:scale-95 whitespace-nowrap"
            >
              Booking Sekarang
            </Link>

            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <div className="w-9 h-9 rounded-full bg-neutral-700 text-white text-xs font-extrabold flex items-center justify-center">
                AD
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-8">
        <section className="relative overflow-hidden rounded-3xl min-h-[520px] sm:min-h-[620px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMain}
              initial={{ opacity: 0, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-start p-8 sm:p-16"
            >
              <img
                src={mainSlides[currentMain].image}
                alt="Main Banner"
                className="absolute inset-0 w-full h-full object-cover object-center scale-105"
              />

              <div
                className={`relative z-10 max-w-2xl w-full flex flex-col justify-start h-full space-y-1 pt-2 ${
                  mainSlides[currentMain].align === "right"
                    ? "ml-auto text-right"
                    : "mr-auto text-left"
                }`}
              >
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                  {mainSlides[currentMain].title}
                </h1>
                <p className="text-white/90 text-sm sm:text-base leading-snug drop-shadow">
                  {mainSlides[currentMain].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={() =>
              setCurrentMain(
                (prev) => (prev - 1 + mainSlides.length) % mainSlides.length,
              )
            }
            className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-neutral-700 transition"
          >
            ❮
          </button>
          <button
            onClick={() =>
              setCurrentMain((prev) => (prev + 1) % mainSlides.length)
            }
            className="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-neutral-700 transition"
          >
            ❯
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {mainSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentMain(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentMain === idx
                    ? "w-10 bg-neutral-500"
                    : "w-2.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl min-h-[280px] sm:min-h-[320px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPromo}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className={`absolute inset-0 bg-gradient-to-r ${promoSlides[currentPromo].bgGradient} p-8 sm:p-12 flex items-center justify-between`}
            >
              <div className="space-y-3 z-10 max-w-lg">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#E5E5E5] bg-[#333333] px-3 py-1 rounded-full border border-white/10">
                  {promoSlides[currentPromo].badge}
                </span>
                <h2 className="text-xl sm:text-3xl font-black text-[#F4F1DE] tracking-tight">
                  {promoSlides[currentPromo].title}{" "}
                  <span className="text-[#D4D4D4] block sm:inline mt-1 sm:mt-0">
                    {promoSlides[currentPromo].discount}
                  </span>
                </h2>
                <div className="pt-2">
                  <Link
                    href="/booking"
                    className="bg-[#E5E5E5] hover:bg-[#CCCCCC] text-black font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition inline-block shadow-md"
                  >
                    {promoSlides[currentPromo].buttonText} →
                  </Link>
                </div>
              </div>

              <div className="hidden sm:block w-72 h-52 relative rounded-2xl overflow-hidden shrink-0 shadow-2xl">
                <img
                  src={promoSlides[currentPromo].image}
                  alt="Promo Preview"
                  className="w-full h-full object-cover scale-105"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={() =>
              setCurrentPromo(
                (prev) => (prev - 1 + promoSlides.length) % promoSlides.length,
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 border border-white/20 text-white text-xs flex items-center justify-center hover:bg-neutral-700 transition"
          >
            ❮
          </button>
          <button
            onClick={() =>
              setCurrentPromo((prev) => (prev + 1) % promoSlides.length)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 border border-white/20 text-white text-xs flex items-center justify-center hover:bg-neutral-700 transition"
          >
            ❯
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {promoSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPromo(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentPromo === idx ? "w-8 bg-[#E5E5E5]" : "w-2 bg-white/30"
                }`}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
