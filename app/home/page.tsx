"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("Beranda");
  const [searchQuery, setSearchQuery] = useState("");
  const [lang, setLang] = useState("ID");

  const navMenus = [
    "Beranda",
    "Produk",
    "Promosi",
    "Lokasi",
    "Ulasan",
    "Riwayat Servis",
    "Tips Servis Mobil",
    "Mengenal B-Quik",
  ];

  const mainSlides = [
    {
      id: 1,
      title: "ECU Remap & Dyno Tuning",
      description:
        "Maksimalkan tenaga dan respons mesin dengan tuning presisi tinggi.",
      image:
        "https://i.pinimg.com/736x/0f/4a/f2/0f4af2cc3a6a5829c58efdbb67d7e8b3.jpg",
      align: "left",
    },
    {
      id: 2,
      title: "Performance Upgrade & Parts",
      description:
        "Suku cadang original dan berkualitas tinggi untuk performa maksimal.",
      image:
        "https://i.pinimg.com/736x/f1/2e/f5/f12ef578724ad14c6fc03f7aabc18ddd.jpg",
      align: "right",
    },
    {
      id: 3,
      title: "Professional Detailing & Coating",
      description:
        "Lindungi cat kendaraan Anda agar tetap mengkilap dan tahan lama.",
      image:
        "https://images.unsplash.com/photo-1607860108855-64b2078675c1?q=80&w=1200&auto=format&fit=crop",
      align: "left",
    },
    {
      id: 4,
      title: "Suspension & Handling Tuning",
      description:
        "Kenyamanan dan kestabilan berkendara di setiap medan jalan.",
      image:
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1200&auto=format&fit=crop",
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
      image:
        "https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=600&auto=format&fit=crop",
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
    {
      id: 3,
      badge: "SPECIAL BUNDLING",
      title: "GANTI OLI + TUNE UP MESIN",
      discount: "HEMAT HINGGA 25%",
      buttonText: "KLAIM SEKARANG",
      bgGradient: "from-[#331E1E] via-[#221515] to-[#121212]",
      image:
        "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 4,
      badge: "MEMBER EXCLUSIVE",
      title: "FREE CHECK-UP 32 TITIK KENDARAAN",
      discount: "GRATIS",
      buttonText: "DAFTAR MEMBER",
      bgGradient: "from-[#1E2533] via-[#151922] to-[#121212]",
      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop",
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
      {/* 1. Header Utama */}
      <header className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link
              href="/home"
              className="text-[#F4F1DE] font-black text-2xl tracking-tighter hover:text-neutral-400 transition"
            >
              AUTO CRAFT
            </Link>
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
              className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold text-xs px-5 py-3 rounded-full transition shadow-md active:scale-95 whitespace-nowrap"
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

      {/* 2. Sub-Navbar (Padding atas bawah diperbesar/diberi jarak longgar) */}
      <nav className="bg-black border-b border-white/10 px-4 sm:px-8 py-5 overflow-x-auto scrollbar-none sticky top-[73px] z-40 bg-black/95 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-8 sm:gap-10 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
          {navMenus.map((menu) => {
            const hasDropdown =
              menu === "Produk" ||
              menu === "Tips Servis Mobil" ||
              menu === "Mengenal B-Quik";
            return (
              <button
                key={menu}
                onClick={() => setActiveTab(menu)}
                className={`transition pb-1 flex items-center gap-1.5 ${
                  activeTab === menu
                    ? "text-amber-400 border-b-2 border-amber-400"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {menu} {hasDropdown && <span className="text-[10px]">▼</span>}
              </button>
            );
          })}

          {/* Tombol Bahasa ID | EN */}
          <div className="flex items-center gap-1.5 text-xs font-black tracking-widest pl-6 border-l border-white/20">
            <button
              onClick={() => setLang("ID")}
              className={
                lang === "ID"
                  ? "text-amber-400"
                  : "text-white/40 hover:text-white"
              }
            >
              ID
            </button>
            <span className="text-white/30">|</span>
            <button
              onClick={() => setLang("EN")}
              className={
                lang === "EN"
                  ? "text-amber-400"
                  : "text-white/40 hover:text-white"
              }
            >
              EN
            </button>
          </div>
        </div>
      </nav>

      {/* 3. Konten Utama (Diberi jarak vertikal py-6 agar lebih lapang) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-10">
        {/* Banner Slider Utama */}
        <section className="relative overflow-hidden rounded-3xl min-h-[520px] sm:min-h-[620px] flex items-center shadow-xl">
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
              <div className="absolute inset-0 bg-black/40" />

              <div
                className={`relative z-10 max-w-2xl w-full flex flex-col justify-start h-full space-y-2 pt-2 ${
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
            className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-neutral-700 transition cursor-pointer"
          >
            ❮
          </button>
          <button
            onClick={() =>
              setCurrentMain((prev) => (prev + 1) % mainSlides.length)
            }
            className="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-neutral-700 transition cursor-pointer"
          >
            ❯
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {mainSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentMain(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentMain === idx
                    ? "w-10 bg-amber-400"
                    : "w-2.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Banner Promo Slider */}
        <section className="relative overflow-hidden rounded-3xl min-h-[280px] sm:min-h-[320px] flex items-center shadow-xl">
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
                <span className="text-xs font-extrabold uppercase tracking-wider text-black bg-amber-400 px-3 py-1 rounded-full border border-white/10">
                  {promoSlides[currentPromo].badge}
                </span>
                <h2 className="text-xl sm:text-3xl font-black text-[#F4F1DE] tracking-tight">
                  {promoSlides[currentPromo].title}{" "}
                  <span className="text-amber-400 block sm:inline mt-1 sm:mt-0">
                    {promoSlides[currentPromo].discount}
                  </span>
                </h2>
                <div className="pt-2">
                  <Link
                    href="/booking"
                    className="bg-amber-400 hover:bg-amber-500 text-black font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition inline-block shadow-md"
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
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 border border-white/20 text-white text-xs flex items-center justify-center hover:bg-neutral-700 transition cursor-pointer"
          >
            ❮
          </button>
          <button
            onClick={() =>
              setCurrentPromo((prev) => (prev + 1) % promoSlides.length)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 border border-white/20 text-white text-xs flex items-center justify-center hover:bg-neutral-700 transition cursor-pointer"
          >
            ❯
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {promoSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPromo(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentPromo === idx ? "w-8 bg-amber-400" : "w-2 bg-white/30"
                }`}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
