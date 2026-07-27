"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import IndonesiaMapSection from "@/components/IndonesiaMapSection";

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Deteksi scroll halaman untuk floating navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fungsi untuk mengecek posisi scroll slider
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", checkScrollPosition);
      }
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, []);

  // Fungsi menggeser slider secara manual
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left:
          direction === "left"
            ? scrollLeft - scrollAmount
            : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const serviceCards = [
    {
      category: "Performa dan Engine",
      badgeBg: "bg-[#E07A5F]",
      badgeText: "Pe",
      title: "Optimasi mesin dengan alat-alat terbaik.",
      desc: "Lakukan remap & ecu tuning dengan teknologi terdepan industri.",
      image:
        "https://i.pinimg.com/736x/ae/62/34/ae6234302e5c7bc85492acdcf8e7cd57.jpg",
    },
    {
      category: "Modifikasi Kustom",
      badgeBg: "bg-[#E07A5F]",
      badgeText: "Mk",
      title: "Hasil karya memukau dengan presisi.",
      desc: "Buat exhaust system dan aero kustom dengan cepat & rapi.",
      image:
        "https://i.pinimg.com/736x/25/40/e8/2540e87b99d6392c2c432193ee1b6287.jpg",
    },
    {
      category: "Body & Painting",
      badgeBg: "bg-[#E07A5F]",
      badgeText: "Bp",
      title: "Pengecatan ulang oven standar pabrikan.",
      desc: "Proteksi bodi luar dengan ceramic coating ultra-glossy.",
      image:
        "https://i.pinimg.com/1200x/ec/d7/39/ecd7399ddcb603d86f3d35c95fb4e2ce.jpg",
    },
    {
      category: "Diagnostik Digital",
      badgeBg: "bg-[#E07A5F]",
      badgeText: "Dd",
      title: "Lakukan scan komprehensif seluruh sistem.",
      desc: "Cek kesehatan elektrikal dan modul komputer dengan cepat.",
      image:
        "https://i.pinimg.com/1200x/f2/5d/1e/f25d1edf40c40ba9dd19f90ab3b265bc.jpg",
    },
    {
      category: "Restorasi Klasik",
      badgeBg: "bg-[#E07A5F]",
      badgeText: "Rk",
      title: "Kembalikan detail orisinalitas otentik.",
      desc: "Pengembalian fungsi & tampilan klasik hingga 100% presisi.",
      image:
        "https://i.pinimg.com/vwebp/736x/97/d7/97/97d79741c55df58de828af4ffad20fee.webp",
    },
    {
      category: "Perawatan Berkala",
      badgeBg: "bg-[#E07A5F]",
      badgeText: "Pb",
      title: "Servis rutin dan pemeriksaan 50 titik.",
      desc: "Jaga performa kendaraan tetap aman untuk pemakaian harian.",
      image:
        "https://i.pinimg.com/vwebp/736x/63/78/7c/63787c7668494f20badd8b71d83cedd3.webp",
    },
  ];

  const features = [
    {
      num: 1,
      title: "Garansi Presisi & Kualitas Utama",
      desc: "Setiap pengerjaan melalui kontrol kualitas berlapis berstandar manufaktur untuk memastikan keandalan mutlak.",
      side: "right",
    },
    {
      num: 2,
      title: "Teknologi Diagnostik Terkini",
      desc: "Penggunaan scanner komputer dan alat pengujian canggih berstandar internasional untuk analisis akurat tanpa spekulasi.",
      side: "left",
    },
    {
      num: 3,
      title: "Teknisi Sertifikasi Spesialis",
      desc: "Ditangani langsung oleh tim ahli berpengalaman yang terus diperbarui dengan standar teknik otomotif modern.",
      side: "right",
    },
    {
      num: 4,
      title: "Optimasi Performa Aman Harian",
      desc: "Peningkatan tenaga dan efisiensi kendaraan dirancang seimbang tanpa mengorbankan kenyamanan pemakaian sehari-hari.",
      side: "left",
    },
    {
      num: 5,
      title: "Transparansi Estimasi & Pengerjaan",
      desc: "Laporan pengerjaan rinci beserta dokumentasi lengkap tanpa ada biaya tersembunyi selama proses perbaikan.",
      side: "right",
    },
    {
      num: 6,
      title: "Suku Cadang & Komponen Original",
      desc: "Jaminan ketersediaan sparepart asli dan suku cadang berperforma tinggi berkualitas OEM teruji.",
      side: "left",
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.96,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 24,
        mass: 0.8,
      },
    },
  };

  return (
    <div className="bg-black text-[#F4F1DE] font-sans selection:bg-[#E07A5F] selection:text-[#FFFFFF] min-h-screen">
      {/* NAVBAR FLOATING PILL */}
      <div className="fixed top-0 left-0 w-full z-50 pointer-events-none p-4">
        <header
          style={{
            backgroundColor: isScrolled
              ? "rgba(24, 24, 27, 0.65)"
              : "transparent",
          }}
          className={`pointer-events-auto max-w-full mx-auto px-6 transition-all duration-300 ease-in-out border-0 ${
            isScrolled
              ? "backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl py-3"
              : "py-3"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-[#F4F1DE] font-black text-2xl tracking-tighter group-hover:text-[#E07A5F] transition">
                  AUTO CRAFT
                </span>
              </Link>

              <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-white/90">
                {[
                  "Layanan",
                  "Spesialisasi",
                  "Galeri Pengerjaan",
                  "Tentang Kami",
                  "Kontak",
                ].map((item) => (
                  <button
                    key={item}
                    className="flex items-center gap-1 hover:text-[#E07A5F] transition-colors"
                  >
                    {item}
                    <span className="text-[10px] opacity-70">▾</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* TOMBOL MASUK DENGAN ROUTING KE /login */}
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="bg-[#E07A5F] hover:bg-[#d0694e] text-white text-sm font-bold px-7 py-2 rounded-full transition-all transform active:scale-95 shadow-lg shadow-[#E07A5F]/20 flex items-center justify-center"
              >
                Masuk
              </Link>
            </div>
          </div>
        </header>
      </div>

      {/* HERO SECTION */}
      <div className="fixed top-0 left-0 h-screen w-full z-0 overflow-hidden bg-black flex flex-col justify-center pb-12">
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none opacity-50 select-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover pointer-events-none"
          >
            <source src="/mc.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/90 pointer-events-none" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 w-full pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl space-y-6"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
              Semua layanan terbaik <br />
              <span className="text-[#E07A5F]">dalam satu tempat</span>
            </h1>

            <p className="text-white/80 text-base sm:text-lg max-w-xl leading-relaxed font-medium">
              Hasil perbaikan presisi, perawatan berkala, dan modifikasi kustom
              dengan teknologi terkini.
            </p>

            <div className="pt-2">
              <button className="bg-white hover:bg-gray-100 text-black font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-full transition-all shadow-2xl">
                Jelajahi Spesialisasi
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* SECTION SHEET FULLSCREEN */}
      <div className="relative z-20 mt-[100vh] min-h-screen w-full bg-[#121212] rounded-t-[40px] sm:rounded-t-[60px] border-t border-white/10 shadow-[0_-30px_80px_rgba(0,0,0,0.95)]">
        <div className="w-full flex justify-center pt-5 pb-2">
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        {/* SECTION CARDS SLIDER */}
        <section className="py-12 sm:py-16 text-white overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center justify-center mb-10 text-center"
            >
              <div className="space-y-2 max-w-2xl">
                <p className="text-[#E07A5F] text-xs sm:text-sm font-bold tracking-widest uppercase">
                  Kategori Utama
                </p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                  Semua yang Anda Perlukan Untuk Mobil Anda
                </h2>
              </div>
            </motion.div>

            <div className="relative group">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll Kiri"
                className={`absolute -left-2 sm:left-1 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-black flex items-center justify-center transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.8)] hover:bg-gray-200 hover:scale-105 active:scale-95 ${
                  canScrollLeft
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                <svg
                  className="w-6 h-6 pr-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>

              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Scroll Kanan"
                className={`absolute -right-2 sm:right-1 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-black flex items-center justify-center transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.8)] hover:bg-gray-200 hover:scale-105 active:scale-95 ${
                  canScrollRight
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                <svg
                  className="w-6 h-6 pl-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>

              <motion.div
                ref={scrollRef}
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, margin: "-100px" }}
                className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-8 pt-2 px-1 snap-x snap-mandatory items-stretch"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {serviceCards.map((card, idx) => (
                  <motion.div
                    key={idx}
                    variants={cardVariants}
                    className="snap-start shrink-0 h-[460px] w-[240px] sm:w-[260px] hover:w-[370px] sm:hover:w-[410px] bg-[#F2F2F2] hover:bg-[#000000] text-[#111111] hover:text-white rounded-[24px] p-3.5 flex flex-col justify-between transition-[width,background-color,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer group border border-white/10 shadow-xl transform-gpu will-change-transform"
                  >
                    <div className="flex items-center gap-2 mb-2 px-1 pt-1 shrink-0">
                      <span
                        className={`w-5 h-5 ${card.badgeBg} text-white font-extrabold text-[10px] rounded-[5px] flex items-center justify-center shrink-0 shadow-sm leading-none`}
                      >
                        {card.badgeText}
                      </span>
                      <span className="text-[12px] font-bold text-[#222222] group-hover:text-white transition-colors duration-300 truncate tracking-tight">
                        {card.category}
                      </span>
                    </div>

                    <div className="relative w-full h-[280px] rounded-[18px] overflow-hidden mb-3 bg-[#E0E0E0] shrink-0">
                      <Image
                        src={card.image}
                        alt={card.category}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        unoptimized
                      />
                    </div>

                    <div className="relative space-y-1 px-1 pb-1 grow flex flex-col justify-end">
                      <h3 className="font-extrabold text-[13px] text-[#111111] group-hover:text-white transition-colors duration-300 leading-snug tracking-tight line-clamp-1">
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-[#666666] group-hover:text-white/70 transition-colors duration-300 leading-relaxed line-clamp-2 font-normal">
                        {card.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* KEUNGGULAN KAMI */}
        <section className="py-24 border-t border-white/10 relative overflow-hidden bg-[#121212]">
          <div className="max-w-[1100px] mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-20 space-y-3"
            >
              <p className="text-[#E07A5F] text-xs sm:text-sm font-bold tracking-widest uppercase">
                Keunggulan Layanan
              </p>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Keunggulan Kami
              </h2>
            </motion.div>

            <div className="relative">
              <div className="hidden md:block absolute left-1/2 top-6 bottom-6 -translate-x-1/2 w-10 pointer-events-none z-0">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 40 1000"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 20,0 
                       C 32,100 32,100 20,200 
                       C 8,300 8,300 20,400 
                       C 32,500 32,500 20,600 
                       C 8,700 8,700 20,800 
                       C 32,900 32,900 20,1000"
                    fill="none"
                    stroke="#E07A5F"
                    strokeWidth="2.5"
                    strokeDasharray="6 6"
                    className="opacity-75"
                  />
                </svg>
              </div>

              <div className="md:hidden absolute left-5 -translate-x-1/2 top-5 bottom-5 w-10 pointer-events-none z-0">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 40 1000"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 20,0 
                       C 32,100 32,100 20,200 
                       C 8,300 8,300 20,400 
                       C 32,500 32,500 20,600 
                       C 8,700 8,700 20,800 
                       C 32,900 32,900 20,1000"
                    fill="none"
                    stroke="#E07A5F"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                    className="opacity-75"
                  />
                </svg>
              </div>

              <div className="space-y-12 md:space-y-20 relative z-10">
                {features.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-50px" }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="relative flex flex-col md:flex-row items-start md:items-center group"
                  >
                    <div className="w-full md:w-1/2 pl-14 md:pl-0 md:pr-12 md:text-right order-2 md:order-1">
                      {item.side === "left" && (
                        <div className="p-6 rounded-2xl bg-[#1A1A1A] border border-white/10 group-hover:border-[#E07A5F] transition-all duration-300 shadow-xl backdrop-blur-sm">
                          <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight group-hover:text-[#E07A5F] transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-normal">
                            {item.desc}
                          </p>
                        </div>
                      )}
                      {item.side === "right" && (
                        <div className="md:hidden p-6 rounded-2xl bg-[#1A1A1A] border border-white/10 group-hover:border-[#E07A5F] transition-all duration-300 shadow-xl backdrop-blur-sm">
                          <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight group-hover:text-[#E07A5F] transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-normal">
                            {item.desc}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="absolute left-0 md:relative md:left-auto flex items-center justify-center shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#121212] border-2 border-[#E07A5F] text-[#E07A5F] font-black text-sm sm:text-base shadow-[0_0_15px_rgba(224,122,95,0.45)] group-hover:bg-[#E07A5F] group-hover:text-white group-hover:scale-110 transition-all duration-300 z-10 my-auto order-1 md:order-2">
                      {item.num}
                    </div>

                    <div className="w-full md:w-1/2 pl-14 md:pl-12 order-3">
                      {item.side === "right" && (
                        <div className="hidden md:block p-6 rounded-2xl bg-[#1A1A1A] border border-white/10 group-hover:border-[#E07A5F] transition-all duration-300 shadow-xl backdrop-blur-sm">
                          <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight group-hover:text-[#E07A5F] transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-normal">
                            {item.desc}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MAP SECTION */}
        <IndonesiaMapSection />
      </div>
    </div>
  );
}
