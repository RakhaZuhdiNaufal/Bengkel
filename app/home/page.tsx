"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import QuickBooking from "@/components/QuickBooking";
import PopularServices from "@/components/PopularServices";
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
  CreditCard
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("Beranda");
  const [searchQuery, setSearchQuery] = useState("");
  const [lang, setLang] = useState("ID");
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [pendingDeposit, setPendingDeposit] = useState<any>(null);

  const supabase = createClient();

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
    
    // Fetch pending deposit
    const checkPendingDeposit = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("payments")
          .select("*, bookings(*)")
          .eq("user_id", user.id)
          .eq("metode", "dp")
          .eq("status", "pending")
          .limit(1)
          .single();
        if (data) setPendingDeposit(data);
      }
    };
    checkPendingDeposit();

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

            <Link
              href="/akun"
              title="Ke Profile Saya"
              className="flex items-center gap-2 border-l border-white/10 pl-3 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-neutral-700 group-hover:bg-[#E07A5F] text-white text-xs font-extrabold flex items-center justify-center ring-2 ring-transparent group-hover:ring-[#E07A5F]/50 transition-all transform group-active:scale-95 shadow-md">
                {profile?.nama
                  ? profile.nama
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()
                  : "AD"}
              </div>
            </Link>
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

        {/* Fitur Utama Dashboard */}
        <QuickBooking />

        {/* Banner Reminder & Empty State (Customer Dashboard) */}
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
                <p className="text-sm text-yellow-500/80">Anda memiliki tagihan deposit sebesar <span className="font-bold text-yellow-400">Rp {pendingDeposit.total?.toLocaleString("id-ID")}</span> yang harus dibayar.</p>
                <Link href="/riwayat" className="inline-block mt-3 text-xs font-bold text-yellow-400 hover:text-white transition uppercase tracking-wider">Bayar Sekarang →</Link>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#1A1A1A] to-[#121212] border border-white/10 rounded-3xl p-6 flex items-center gap-4 hover:border-white/30 transition shadow-lg">
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 flex-shrink-0">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">Jadwal Servis Terlewat!</h3>
                <p className="text-sm text-white/50">Porsche 911 GT3 RS Anda sudah melewati batas waktu servis rutin bulanan.</p>
                <Link href="/booking" className="inline-block mt-3 text-xs font-bold text-[#E07A5F] hover:text-white transition uppercase tracking-wider">Jadwalkan Sekarang →</Link>
              </div>
            </div>
          )}
          
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 flex flex-col justify-center text-center hover:border-white/30 transition shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E07A5F]/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-white font-bold mb-2">Ingin memantau kendaraan?</h3>
            <p className="text-sm text-white/50 mb-4">Tambahkan data kendaraan Anda untuk mendapatkan pengingat servis otomatis.</p>
            <Link href="/akun" className="text-xs font-bold bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl border border-white/10 transition mx-auto flex items-center gap-2">
              <span className="text-[#E07A5F] text-lg">+</span> Tambah Garasi
            </Link>
          </div>
        </section>

        <PopularServices />
        <PromoSlider />
        <CostEstimator />
        <CTA />

      </main>

      <Footer />
    </div>
  );
}
