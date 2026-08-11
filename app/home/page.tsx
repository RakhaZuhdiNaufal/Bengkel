"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import QuickBooking from "@/components/QuickBooking";
import PromoSlider from "@/components/PromoSlider";
import CostEstimator from "@/components/CostEstimator";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Disc,
  Droplet,
  Activity,
  ShieldAlert,
  BatteryCharging,
  Snowflake,
  MoreHorizontal,
  Search,
  X,
  CreditCard,
  ArrowRight,
  Wrench,
  Cpu,
  Zap,
  Layers,
  Star,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PendingDepositType {
  id: string;
  total?: number;
  metode?: string;
  status?: string;
  bookings?: Record<string, unknown>;
  [key: string]: unknown;
}

export default function HomePage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("Beranda");
  const [searchQuery, setSearchQuery] = useState("");
  const [lang, setLang] = useState("ID");
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [pendingDeposit, setPendingDeposit] =
    useState<PendingDepositType | null>(null);

  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navMenus = [
    { name: "Beranda", path: "/home" },
    { name: "Produk", path: "#" },
    { name: "Promosi", path: "/promosi" },
    { name: "Lokasi", path: "/lokasi" },
    { name: "Ulasan", path: "/ulasan" },
    { name: "Riwayat Servis", path: "/akun" },
    { name: "Tips Servis Mobil", path: "/tips" },
    { name: "Mengenal Auto Craft", path: "/about" },
  ];

  const productCategories = [
    { name: "Ban", icon: <Disc className="w-7 h-7 text-amber-400" /> },
    { name: "Oli", icon: <Droplet className="w-7 h-7 text-amber-400" /> },
    {
      name: "Shock (Peredam kejut)",
      icon: <Activity className="w-7 h-7 text-amber-400" />,
    },
    { name: "Rem", icon: <ShieldAlert className="w-7 h-7 text-amber-400" /> },
    {
      name: "Aki",
      icon: <BatteryCharging className="w-7 h-7 text-amber-400" />,
    },
    { name: "AC", icon: <Snowflake className="w-7 h-7 text-amber-400" /> },
    {
      name: "Produk Lainnya",
      icon: <MoreHorizontal className="w-7 h-7 text-amber-400" />,
    },
  ];

  const serviceCategoriesMap = [
    {
      id: "semua",
      name: "Semua Servis",
      icon: <Wrench className="w-4 h-4 text-amber-400" />,
      count: "24",
      items: [
        {
          title: "Ganti Oli Premium",
          rating: "4.9",
          reviews: "(128)",
          estimasi: "45 Menit",
          harga: "Rp950.000",
          image: "Home/Barang.png",
        },
        {
          title: "General Tune Up",
          rating: "4.8",
          reviews: "(94)",
          estimasi: "2 Jam",
          harga: "Rp1.500.000",
          image: "Home/Dyno.png",
        },
        {
          title: "Spooring & Balancing",
          rating: "4.7",
          reviews: "(210)",
          estimasi: "1 Jam",
          harga: "Rp600.000",
          image: "Home/Tuning.png",
        },
        {
          title: "Servis AC Total",
          rating: "4.9",
          reviews: "(85)",
          estimasi: "2.5 Jam",
          harga: "Rp1.200.000",
          image: "Home/Coating.png",
        },
        {
          title: "Premium Auto Detailing",
          rating: "5.0",
          reviews: "(320)",
          estimasi: "1 Hari",
          harga: "Rp3.500.000",
          image: "Home/Barang.png",
        },
        {
          title: "ECU Remap & Tuning",
          rating: "4.9",
          reviews: "(150)",
          estimasi: "3 Jam",
          harga: "Rp5.500.000",
          image: "Home/Dyno.png",
        },
      ],
    },
    {
      id: "engine",
      name: "Engine Tune Up",
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      count: "6",
      items: [
        {
          title: "General Tune Up",
          rating: "4.8",
          reviews: "(94)",
          estimasi: "2 Jam",
          harga: "Rp1.500.000",
          image: "Home/Dyno.png",
        },
        {
          title: "ECU Remap & Tuning",
          rating: "4.9",
          reviews: "(150)",
          estimasi: "3 Jam",
          harga: "Rp5.500.000",
          image: "Home/Dyno.png",
        },
      ],
    },
    {
      id: "ecu",
      name: "ECU & Dyno",
      icon: <Cpu className="w-4 h-4 text-amber-400" />,
      count: "4",
      items: [
        {
          title: "ECU Remap & Tuning",
          rating: "4.9",
          reviews: "(150)",
          estimasi: "3 Jam",
          harga: "Rp5.500.000",
          image: "Home/Dyno.png",
        },
      ],
    },
    {
      id: "kaki",
      name: "Kaki-Kaki",
      icon: <Activity className="w-4 h-4 text-amber-400" />,
      count: "5",
      items: [
        {
          title: "Spooring & Balancing",
          rating: "4.7",
          reviews: "(210)",
          estimasi: "1 Jam",
          harga: "Rp600.000",
          image: "Home/Tuning.png",
        },
      ],
    },
    {
      id: "oli-ac",
      name: "Ganti Oli & AC",
      icon: <Droplet className="w-4 h-4 text-amber-400" />,
      count: "5",
      items: [
        {
          title: "Ganti Oli Premium",
          rating: "4.9",
          reviews: "(128)",
          estimasi: "45 Menit",
          harga: "Rp950.000",
          image: "Home/Barang.png",
        },
        {
          title: "Servis AC Total",
          rating: "4.9",
          reviews: "(85)",
          estimasi: "2.5 Jam",
          harga: "Rp1.200.000",
          image: "Home/Coating.png",
        },
      ],
    },
    {
      id: "detailing",
      name: "Detailing & Coating",
      icon: <Layers className="w-4 h-4 text-amber-400" />,
      count: "4",
      items: [
        {
          title: "Premium Auto Detailing",
          rating: "5.0",
          reviews: "(320)",
          estimasi: "1 Hari",
          harga: "Rp3.500.000",
          image: "Home/Barang.png",
        },
      ],
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState("semua");

  const mainSlides = [
    {
      id: 1,
      title: "ECU Remap & Dyno Tuning",
      image: "Home/Dyno.png",
      align: "left",
    },
    {
      id: 2,
      title: "Performance Upgrade & Parts",
      image: "Home/Barang.png",
      align: "right",
    },
    {
      id: 3,
      title: "Professional Detailing & Coating",
      image: "Home/Coating.png",
      align: "left",
    },
    {
      id: 4,
      title: "Suspension & Handling Tuning",
      image: "Home/Tuning.png",
      align: "right",
    },
  ];

  const discountSlides = [
    {
      id: 1,
      title: "EXTRA UP TO 70% OFF",
      subtitle: "INDONESIA'S INDEPENDENCE CELEBRATION",
      badge: "8.8 SALE",
      image: "Home/Barang.png",
    },
    {
      id: 2,
      title: "SPECIAL FLASH SALE 50%",
      subtitle: "EXPRESS MAINTENANCE PACK",
      badge: "50% OFF",
      image: "Home/Dyno.png",
    },
  ];

  const [currentMain, setCurrentMain] = useState(0);
  const [currentDiscount, setCurrentDiscount] = useState(0);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProductDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    const checkPendingDeposit = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("payments")
          .select("*, bookings(*)")
          .eq("user_id", user.id)
          .eq("metode", "dp")
          .eq("status", "pending")
          .limit(1)
          .single();
        if (data) setPendingDeposit(data as PendingDepositType);
      }
    };
    checkPendingDeposit();

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [supabase]);

  useEffect(() => {
    const timerMain = setInterval(() => {
      setCurrentMain((prev) => (prev + 1) % mainSlides.length);
    }, 6000);
    return () => {
      clearInterval(timerMain);
    };
  }, [mainSlides.length]);

  useEffect(() => {
    const timerDiscount = setInterval(() => {
      setCurrentDiscount((prev) => (prev + 1) % discountSlides.length);
    }, 6000);
    return () => {
      clearInterval(timerDiscount);
    };
  }, [discountSlides.length]);

  const activeCategoryData =
    serviceCategoriesMap.find((cat) => cat.id === selectedCategory) ||
    serviceCategoriesMap[0];

  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] flex flex-col font-sans relative">
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
              <Search className="absolute left-3.5 text-white/40 w-4 h-4" />
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
                  className="absolute right-3 text-white/40 hover:text-white text-xs cursor-pointer"
                >
                  <X className="w-4 h-4" />
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

            <Link
              href="/akun"
              title="Ke Profile Saya"
              className="flex items-center gap-2 border-l border-white/10 pl-3 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-neutral-700 group-hover:bg-[#E07A5F] text-white text-xs font-extrabold flex items-center justify-center ring-2 ring-transparent group-hover:ring-[#E07A5F]/50 transition-all transform group-active:scale-95 shadow-md">
                {profile?.nama
                  ? profile.nama
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()
                  : "AD"}
              </div>
            </Link>
          </div>
        </div>
      </header>

      <nav
        ref={dropdownRef}
        className="bg-black px-4 sm:px-8 py-5 sticky top-[73px] z-40 bg-black/95 backdrop-blur"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 sm:gap-8 text-xs font-bold uppercase tracking-wider whitespace-nowrap relative overflow-x-auto scrollbar-none">
          {navMenus.map((menu) => {
            const hasDropdown =
              menu.name === "Produk" ||
              menu.name === "Tips Servis Mobil" ||
              menu.name === "Mengenal Auto Craft";

            return (
              <div key={menu.name} className="relative">
                {menu.name === "Promosi" ? (
                  <Link
                    href={menu.path}
                    className={`transition pb-1 flex items-center gap-1.5 cursor-pointer ${
                      activeTab === menu.name
                        ? "text-amber-400 border-b-2 border-amber-400"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {menu.name}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setActiveTab(menu.name);
                      if (menu.name === "Produk") {
                        setIsProductDropdownOpen(!isProductDropdownOpen);
                      } else {
                        setIsProductDropdownOpen(false);
                      }
                    }}
                    className={`transition pb-1 flex items-center gap-1.5 cursor-pointer ${
                      activeTab === menu.name
                        ? "text-amber-400 border-b-2 border-amber-400"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {menu.name}{" "}
                    {hasDropdown && (
                      <span
                        className={`text-[10px] transition-transform ${menu.name === "Produk" && isProductDropdownOpen ? "rotate-180" : ""}`}
                      >
                        ▼
                      </span>
                    )}
                  </button>
                )}
              </div>
            );
          })}

          <div className="flex items-center gap-1.5 text-xs font-black tracking-widest pl-4 border-l border-white/20">
            <button
              onClick={() => setLang("ID")}
              className={
                lang === "ID"
                  ? "text-amber-400 cursor-pointer"
                  : "text-white/40 hover:text-white cursor-pointer"
              }
            >
              ID
            </button>
            <span className="text-white/30">|</span>
            <button
              onClick={() => setLang("EN")}
              className={
                lang === "EN"
                  ? "text-amber-400 cursor-pointer"
                  : "text-white/40 hover:text-white cursor-pointer"
              }
            >
              EN
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isProductDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-full max-w-5xl bg-[#141414] border border-white/10 rounded-2xl shadow-2xl p-6 z-50 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 text-center"
            >
              {productCategories.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setIsProductDropdownOpen(false)}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#1C1C1C] hover:bg-neutral-800 border border-white/5 hover:border-amber-400/50 transition cursor-pointer group shadow"
                >
                  <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-bold text-white group-hover:text-amber-400 leading-tight">
                    {item.name}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Konten Utama Terpusat Full Lebar untuk Banner Atas & Diskon */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-10">
        {/* 1. Main Carousel Section (Full Lebar) */}
        <section className="relative overflow-hidden rounded-3xl min-h-[360px] sm:min-h-[440px] flex items-center shadow-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMain}
              initial={{ opacity: 0, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-start p-6 sm:p-12"
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
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                  {mainSlides[currentMain].title}
                </h1>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={() =>
              setCurrentMain(
                (prev) => (prev - 1 + mainSlides.length) % mainSlides.length,
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-neutral-700 transition cursor-pointer text-sm"
          >
            ❮
          </button>
          <button
            onClick={() =>
              setCurrentMain((prev) => (prev + 1) % mainSlides.length)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-neutral-700 transition cursor-pointer text-sm"
          >
            ❯
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {mainSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentMain(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentMain === idx ? "w-8 bg-amber-400" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </section>

        {/* 2. Diskon Slider (Full Lebar) */}
        <section className="relative overflow-hidden rounded-3xl bg-[#d5ded9] text-[#2c224e] shadow-xl h-[180px] sm:h-[210px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDiscount}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 grid grid-cols-1 md:grid-cols-12 items-center px-6 sm:px-12 gap-6 w-full"
            >
              <div className="relative z-10 md:col-span-7 flex flex-col justify-center space-y-1 pr-2">
                <span className="text-[9px] sm:text-[11px] font-black tracking-widest uppercase text-[#3b2874]">
                  {discountSlides[currentDiscount].subtitle}
                </span>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight text-[#3b2874] uppercase leading-tight">
                  {discountSlides[currentDiscount].title}
                </h2>
                <div className="pt-0.5 flex flex-wrap items-center gap-2">
                  <span className="text-lg sm:text-2xl font-black tracking-tighter text-[#3b2874]">
                    {discountSlides[currentDiscount].badge}
                  </span>
                  <span className="text-[10px] font-medium text-neutral-800 leading-tight">
                    S&K berlaku. Gratis servis & pengecekan berkala
                    se-Indonesia.
                  </span>
                </div>
              </div>

              <div className="relative z-10 md:col-span-5 w-full h-28 sm:h-36 rounded-2xl overflow-hidden shadow-lg border border-black/10">
                <img
                  src={discountSlides[currentDiscount].image}
                  alt="Discount Banner"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={() =>
              setCurrentDiscount(
                (prev) =>
                  (prev - 1 + discountSlides.length) % discountSlides.length,
              )
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition cursor-pointer text-xs shadow"
          >
            ❮
          </button>

          <button
            onClick={() =>
              setCurrentDiscount((prev) => (prev + 1) % discountSlides.length)
            }
            className="absolute right-12 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition cursor-pointer text-xs shadow"
          >
            ❯
          </button>

          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {discountSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentDiscount(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentDiscount === idx
                    ? "w-5 bg-[#3b2874]"
                    : "w-1.5 bg-[#3b2874]/40"
                }`}
              />
            ))}
          </div>

          <Link
            href="/promosi"
            className="absolute right-0 top-0 bottom-0 bg-black text-white px-3 flex items-center gap-1 font-bold tracking-widest text-[9px] uppercase hover:bg-neutral-800 transition z-20"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            SHOP NOW <ArrowRight className="w-2.5 h-2.5 rotate-90" />
          </Link>
        </section>

        {/* 3. LAYOUT KHUSUS: Kategori di Samping Katalog Servis (Tepat Sejajar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Kategori Layanan */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10">
                <span className="text-amber-400 text-sm font-bold">⚙️</span>
                <h3 className="text-white font-extrabold text-xs tracking-wide uppercase">
                  KATEGORI LAYANAN
                </h3>
              </div>

              <ul className="space-y-1">
                {serviceCategoriesMap.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <li key={cat.id}>
                      <button
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition group text-left cursor-pointer border ${
                          isSelected
                            ? "bg-amber-400/10 border-amber-400 text-amber-400"
                            : "bg-[#1A1A1A]/50 hover:bg-neutral-800 text-white/80 hover:text-white border-transparent hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                              isSelected
                                ? "bg-amber-400/20 text-amber-400"
                                : "bg-black/60 text-white"
                            }`}
                          >
                            {cat.icon}
                          </div>
                          <span className="text-[11px] font-bold tracking-tight">
                            {cat.name}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-amber-400 text-black font-extrabold"
                              : "bg-white/5 text-white/40 group-hover:text-white"
                          }`}
                        >
                          {cat.count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-amber-400 mb-1">
                    Butuh Konsultasi Khusus?
                  </p>
                  <p className="text-[9px] text-white/50 mb-2 leading-tight">
                    Diskusikan modifikasi atau masalah mesin Anda dengan teknisi
                    ahli kami.
                  </p>
                  <Link
                    href="/booking"
                    className="block w-full py-1.5 bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-[10px] rounded-lg transition shadow"
                  >
                    Hubungi Teknisi
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Katalog Servis / Layanan Populer Dinamis */}
          <div className="lg:col-span-9 space-y-6">
            <div className="flex items-end justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">
                  KATALOG SERVIS
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {activeCategoryData.name}
                </h2>
              </div>
              <Link
                href="/booking"
                className="text-xs font-bold text-amber-400 hover:text-white transition flex items-center gap-1"
              >
                Lihat Semua Layanan →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeCategoryData.items.map((service, index) => (
                <div
                  key={index}
                  className="bg-[#141414] border border-white/10 rounded-3xl overflow-hidden shadow-xl hover:border-amber-400/50 transition flex flex-col justify-between group"
                >
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-[#1A1A1A]">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/30" />

                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1 text-[11px] font-bold text-white shadow">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{service.rating}</span>
                      <span className="text-white/40 text-[9px]">
                        {service.reviews}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 text-[10px] font-medium text-white/90">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>Estimasi: {service.estimasi}</span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                    <div>
                      <h3 className="text-base font-black text-white group-hover:text-amber-400 transition tracking-tight">
                        {service.title}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="block text-[9px] font-bold text-white/40 uppercase tracking-wider">
                          Harga Mulai
                        </span>
                        <span className="text-sm sm:text-base font-black text-white">
                          {service.harga}
                        </span>
                      </div>

                      <Link
                        href="/booking"
                        className="bg-[#222222] hover:bg-amber-400 hover:text-black text-white text-xs font-bold px-4 py-2 rounded-xl border border-white/10 transition shadow"
                      >
                        Detail
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingDeposit ? (
            <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-3xl p-6 flex items-center gap-4 hover:border-yellow-500/50 transition shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="w-14 h-14 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/30 flex-shrink-0 z-10">
                <CreditCard className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="z-10">
                <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                  </span>
                  Tagihan Deposit Menunggu
                </h3>
                <p className="text-sm text-yellow-500/80">
                  Anda memiliki tagihan deposit sebesar{" "}
                  <span className="font-bold text-yellow-400">
                    Rp {(pendingDeposit.total ?? 0).toLocaleString("id-ID")}
                  </span>{" "}
                  yang harus dibayar.
                </p>
                <Link
                  href="/riwayat"
                  className="inline-block mt-3 text-xs font-bold text-yellow-400 hover:text-white transition uppercase tracking-wider"
                >
                  Bayar Sekarang →
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#1A1A1A] to-[#121212] border border-white/10 rounded-3xl p-6 flex items-center gap-4 hover:border-white/30 transition shadow-lg">
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 flex-shrink-0">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">
                  Jadwal Servis Terlewat!
                </h3>
                <p className="text-sm text-white/50">
                  Porsche 911 GT3 RS Anda sudah melewati batas waktu servis
                  rutin bulanan.
                </p>
                <Link
                  href="/booking"
                  className="inline-block mt-3 text-xs font-bold text-[#E07A5F] hover:text-white transition uppercase tracking-wider"
                >
                  Jadwalkan Sekarang →
                </Link>
              </div>
            </div>
          )}

          <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 flex flex-col justify-center text-center hover:border-white/30 transition shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E07A5F]/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-white font-bold mb-2">
              Ingin memantau kendaraan?
            </h3>
            <p className="text-sm text-white/50 mb-4">
              Tambahkan data kendaraan Anda untuk mendapatkan pengingat servis
              otomatis.
            </p>
            <Link
              href="/akun"
              className="text-xs font-bold bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl border border-white/10 transition mx-auto flex items-center gap-2"
            >
              <span className="text-[#E07A5F] text-lg">+</span> Tambah Garasi
            </Link>
          </div>
        </section>

        {/* 4. QuickBooking Section */}
        <QuickBooking />

        <PromoSlider />
        <CostEstimator />
        <CTA />
      </div>

      <Footer />
    </div>
  );
}
