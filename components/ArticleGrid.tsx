"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Article {
  date: string;
  title: string;
  desc: string;
  fullDesc?: string;
  image: string;
}

export default function ArticleGrid() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const articles: Article[] = [
    {
      date: "12 Agustus 2026",
      title: "Kapan Waktu yang Tepat Untuk Remap ECU?",
      desc: "Remap ECU tidak selalu harus untuk balapan. Mobil harian pun bisa merasakan manfaat...",
      fullDesc:
        "Remap ECU tidak selalu harus untuk balapan. Mobil harian pun bisa merasakan manfaat efisiensi bahan bakar dan respon tarikan yang lebih halus. Proses ini mengoptimalkan ulang parameter standar pabrikan seperti timing pengapian dan debit bahan bakar agar sesuai dengan kebutuhan berkendara saat ini tanpa merusak ketahanan mesin.",
      image:
        "https://i.pinimg.com/736x/ae/62/34/ae6234302e5c7bc85492acdcf8e7cd57.jpg",
    },
    {
      date: "05 Agustus 2026",
      title: "Mitos dan Fakta Seputar Ceramic Coating",
      desc: "Banyak yang mengira ceramic coating membuat mobil anti baret 100%. Padahal fungsi...",
      fullDesc:
        "Banyak yang mengira ceramic coating membuat mobil anti baret 100%. Padahal fungsi utamanya adalah menolak air (efek daun talas), melindungi cat dari oksidasi sinar UV, serta membuat bodi lebih mudah dibersihkan dari debu dan kotoran membandel.",
      image:
        "https://i.pinimg.com/1200x/ec/d7/39/ecd7399ddcb603d86f3d35c95fb4e2ce.jpg",
    },
    {
      date: "28 Juli 2026",
      title: "Tanda-Tanda Kompresor AC Mulai Lemah",
      desc: "Jangan tunggu sampai AC benar-benar panas. Jika mulai terdengar suara bising...",
      fullDesc:
        "Jangan tunggu sampai AC benar-benar panas. Jika mulai terdengar suara bising dari ruang mesin saat AC menyala, atau hawa dingin mulai terasa tidak konsisten saat macet, segera cek komponen kompresor Anda sebelum merembet ke komponen lain.",
      image:
        "https://i.pinimg.com/736x/25/40/e8/2540e87b99d6392c2c432193ee1b6287.jpg",
    },
    {
      date: "20 Juli 2026",
      title: "Panduan Memilih Oli Sintetis vs Mineral",
      desc: "Apakah oli sintetis selalu lebih baik? Jawabannya tergantung usia dan spesifikasi...",
      fullDesc:
        "Apakah oli sintetis selalu lebih baik? Jawabannya tergantung usia dan spesifikasi mesin mobil Anda. Oli sintetis menawarkan perlindungan superior di suhu ekstrem dan masa pakai lebih panjang, sementara oli mineral cocok untuk mobil tahun lama.",
      image:
        "https://i.pinimg.com/1200x/f2/5d/1e/f25d1edf40c40ba9dd19f90ab3b265bc.jpg",
    },
    {
      date: "15 Juli 2026",
      title: "Pentingnya Spooring Rutin Setiap 10.000 KM",
      desc: "Setir lari ke kiri atau ban makan sebelah adalah tanda mobil butuh spooring...",
      fullDesc:
        "Setir lari ke kiri atau ban makan sebelah adalah tanda mobil butuh spooring. Jangan abaikan karena selain membuat aus ban tidak merata, hal ini juga sangat memengaruhi kestabilan dan keselamatan berkendara di kecepatan tinggi.",
      image:
        "https://i.pinimg.com/vwebp/736x/97/d7/97/97d79741c55df58de828af4ffad20fee.webp",
    },
    {
      date: "02 Juli 2026",
      title: "Cara Menjaga Interior Kulit Agar Tetap Mewah",
      desc: "Jok kulit rentan pecah-pecah jika sering terpapar panas matahari. Gunakan kondisioner...",
      fullDesc:
        "Jok kulit rentan pecah-pecah jika sering terpapar panas matahari. Gunakan kondisioner khusus secara rutin untuk menjaga kelembapan materialnya agar tetap kenyal, tidak mudah kusam, dan terasa nyaman diduduki.",
      image:
        "https://i.pinimg.com/vwebp/736x/63/78/7c/63787c7668494f20badd8b71d83cedd3.webp",
    },
  ];

  const displayedArticles = showAll ? articles : articles.slice(0, 3);

  return (
    <section className="py-16 sm:py-20 text-white overflow-hidden bg-[#121212]">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <p className="text-[#E07A5F] text-xs sm:text-sm font-bold tracking-widest uppercase">
              BLOG & TIPS
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Wawasan Otomotif
            </h2>
          </div>

          <button
            onClick={() => {
              setShowAll(!showAll);
              setSelectedIdx(null);
            }}
            className="text-sm font-bold text-white/80 hover:text-[#E07A5F] transition-colors underline underline-offset-8 self-start sm:self-auto cursor-pointer"
          >
            {showAll ? "Tampilkan Lebih Sedikit" : "Lihat Semua Artikel"}
          </button>
        </div>

        {/* Grid Artikel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {displayedArticles.map((article, idx) => {
            const isSelected = selectedIdx === idx;

            return (
              <motion.div
                key={idx}
                layout="position"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                onClick={() => setSelectedIdx(isSelected ? null : idx)}
                className={`flex flex-col group cursor-pointer bg-[#1a1a1a] p-5 rounded-[32px] border transition-colors ${
                  isSelected
                    ? "md:col-span-2 lg:col-span-2 border-[#E07A5F]/50 shadow-2xl bg-[#1e1e1e]"
                    : "justify-between border-white/5 hover:border-white/10"
                }`}
              >
                {/* Gambar Card */}
                <div
                  className={`relative rounded-[24px] overflow-hidden bg-[#222] transition-all duration-300 w-full ${
                    isSelected
                      ? "h-[200px] sm:h-[220px] mb-4"
                      : "h-[240px] sm:h-[260px] mb-5"
                  }`}
                >
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    unoptimized
                  />
                </div>

                {/* Konten Teks */}
                <div className="flex flex-col justify-between flex-grow space-y-3 px-1">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#E07A5F]">
                      {article.date}
                    </p>
                    <h3
                      className={`font-extrabold text-white group-hover:text-[#E07A5F] transition-colors leading-snug ${
                        isSelected
                          ? "text-xl sm:text-2xl"
                          : "text-lg sm:text-xl line-clamp-2"
                      }`}
                    >
                      {article.title}
                    </h3>

                    <p className="text-sm text-white/60 leading-relaxed font-normal pt-1">
                      {isSelected ? article.fullDesc : article.desc}
                    </p>
                  </div>

                  <div className="pt-3">
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-[#E07A5F] transition-colors">
                      {isSelected ? "Tutup Detail" : "Baca Selengkapnya"}
                      <span className="transform group-hover:translate-x-1 transition-transform">
                        {isSelected ? "←" : "→"}
                      </span>
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
