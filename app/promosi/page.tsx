"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Tag,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Wrench,
  Sparkles,
} from "lucide-react";

export default function PromosiPage() {
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const categories = [
    "Semua",
    "Mesin & ECU",
    "Kaki-Kaki",
    "Detailing",
    "Servis Rutin",
  ];

  const promos = [
    {
      id: 1,
      category: "Mesin & ECU",
      badge: "PROMO BULAN INI",
      title: "PAKET SERVIS RUTIN + COATING",
      discount: "DISKON 30%",
      description:
        "Maksimalkan performa mesin dan lindungi bodi mobil Anda dengan paket perawatan komprehensif dari teknisi ahli.",
      validUntil: "31 Oktober 2026",
      image:
        "https://images.unsplash.com/photo-1502877336475-76753f602dc1?q=80&w=800&auto=format&fit=crop",
      icon: <Zap className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 2,
      category: "Kaki-Kaki",
      badge: "FLASH SALE WEEKEND",
      title: "UPGRADE BRAKE KIT & EXHAUST",
      discount: "CASHBACK RP 1.5JT",
      description:
        "Tingkatkan sistem pengereman dan gas buang kendaraan untuk pengalaman berkendara yang lebih responsif dan aman.",
      validUntil: "Minggu Ini",
      image:
        "https://images.unsplash.com/photo-1600793575654-910699b5e4d4?q=80&w=800&auto=format&fit=crop",
      icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 3,
      category: "Servis Rutin",
      badge: "SPECIAL BUNDLING",
      title: "GANTI OLI + TUNE UP MESIN",
      discount: "HEMAT HINGGA 25%",
      description:
        "Gunakan pelumas berkualitas tinggi dipadu dengan tune-up presisi agar mesin tetap bertenaga dan irit bahan bakar.",
      validUntil: "15 November 2026",
      image:
        "https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=800&auto=format&fit=crop",
      icon: <Wrench className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 4,
      category: "Detailing",
      badge: "MEMBER EXCLUSIVE",
      title: "CERAMIC COATING & SALON KABIN",
      discount: "DISKON 25% + FREE MIST",
      description:
        "Kembalikan kilau sempurna cat mobil dan pastikan interior bebas dari kuman serta bakteri berbahaya.",
      validUntil: "Akhir Bulan Ini",
      image:
        "https://images.unsplash.com/photo-1607860108855-64b2078675c1?q=80&w=800&auto=format&fit=crop",
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    },
  ];

  const filteredPromos =
    selectedCategory === "Semua"
      ? promos
      : promos.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] flex flex-col font-sans">
      {/* Header Sederhana / Navigasi Kembali */}
      <header className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/home"
            className="text-[#F4F1DE] font-black text-2xl tracking-tighter hover:text-neutral-400 transition"
          >
            AUTO CRAFT
          </Link>
          <Link
            href="/home"
            className="text-xs font-bold text-neutral-400 hover:text-white transition"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Konten Utama Halaman Promosi */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Banner Judul Halaman */}
        <div className="text-center space-y-3 py-6">
          <span className="text-xs font-extrabold uppercase tracking-widest text-black bg-amber-400 px-4 py-1.5 rounded-full">
            Penawaran Spesial
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            PROMO & DISKON <span className="text-amber-400">AUTO CRAFT</span>
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-2xl mx-auto">
            Nikmati berbagai penawaran menarik untuk perawatan, suku cadang, dan
            peningkatan performa kendaraan kesayangan Anda.
          </p>
        </div>

        {/* Filter Kategori */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                  : "bg-[#1A1A1A] text-white/70 hover:text-white border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Kartu Promosi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {filteredPromos.map((promo) => (
            <motion.div
              key={promo.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#141414] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-amber-400/50 transition"
            >
              <div className="relative h-60 sm:h-64 overflow-hidden">
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                  {promo.icon}
                  <span className="text-[11px] font-extrabold text-amber-400 tracking-wider">
                    {promo.badge}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 tracking-wide">
                      {promo.discount}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Berlaku s/d {promo.validUntil}</span>
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {promo.title}
                  </h3>
                  <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                    {promo.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-white/40 font-medium">
                    Syarat & Ketentuan Berlaku
                  </span>
                  <Link
                    href="/booking"
                    className="bg-amber-400 hover:bg-amber-500 text-black font-bold text-xs px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-md"
                  >
                    Klaim Promo <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
