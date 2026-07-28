"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
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
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("Beranda");
  const [searchQuery, setSearchQuery] = useState("");
  const [lang, setLang] = useState("ID");
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const navMenus = [
    { name: "Beranda", path: "/home" },
    { name: "Produk", path: "#" },
    { name: "Promosi", path: "/promosi" },
    { name: "Lokasi", path: "/lokasi" },
    { name: "Ulasan", path: "/ulasan" },
    { name: "Riwayat Servis", path: "/riwayat" },
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

  const mainSlides = [
    {
      id: 1,
      title: "ECU Remap & Dyno Tuning",
      description:
        "Maksimalkan tenaga dan respons mesin dengan tuning presisi tinggi.",
      image:
        "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=1200&auto=format&fit=crop",
      align: "left",
    },
    {
      id: 2,
      title: "Performance Upgrade & Parts",
      description:
        "Suku cadang original dan berkualitas tinggi untuk performa maksimal.",
      image:
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1200&auto=format&fit=crop",
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
        "https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=1200&auto=format&fit=crop",
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
        "https://images.unsplash.com/photo-1502877336475-76753f602dc1?q=80&w=600&auto=format&fit=crop",
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
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProductDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="min-h-screen bg-black text-[#F4F1DE] flex flex-col font-sans relative">
      {/* Header Utama / Search Bar */}
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

            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <div className="w-9 h-9 rounded-full bg-neutral-700 text-white text-xs font-extrabold flex items-center justify-center">
                AD
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-Navbar dengan Dropdown Produk */}
      <nav
        ref={dropdownRef}
        className="bg-black border-b border-white/10 px-4 sm:px-8 py-5 sticky top-[73px] z-40 bg-black/95 backdrop-blur"
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

        {/* Dropdown Menu Produk */}
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

      {/* Konten Utama */}
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
      </main>
    </div>
  );
}
