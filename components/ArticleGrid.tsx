"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Article {
  date: string;
  title: string;
  desc: string;
  image: string;
}

export default function ArticleGrid() {
  const [showAll, setShowAll] = useState(false);

  const articles: Article[] = [
    {
      date: "12 Agustus 2026",
      title: "Kapan Waktu yang Tepat Untuk Remap ECU?",
      desc: "Remap ECU tidak selalu harus untuk balapan. Mobil harian pun bisa merasakan manfaat efisiensi bahan bakar dan respon tarikan yang lebih halus...",
      image:
        "https://i.pinimg.com/736x/ae/62/34/ae6234302e5c7bc85492acdcf8e7cd57.jpg",
    },
    {
      date: "05 Agustus 2026",
      title: "Mitos dan Fakta Seputar Ceramic Coating",
      desc: "Banyak yang mengira ceramic coating membuat mobil anti baret 100%. Padahal fungsi utamanya adalah menolak air dan melindungi dari sinar UV...",
      image:
        "https://i.pinimg.com/1200x/ec/d7/39/ecd7399ddcb603d86f3d35c95fb4e2ce.jpg",
    },
    {
      date: "28 Juli 2026",
      title: "Tanda-Tanda Kompresor AC Mulai Lemah",
      desc: "Jangan tunggu sampai AC benar-benar panas. Jika mulai terdengar suara bising dari ruang mesin saat AC menyala, segera cek kompresor Anda...",
      image:
        "https://i.pinimg.com/736x/25/40/e8/2540e87b99d6392c2c432193ee1b6287.jpg",
    },
    {
      date: "20 Juli 2026",
      title: "Panduan Memilih Oli Sintetis vs Mineral",
      desc: "Apakah oli sintetis selalu lebih baik? Jawabannya tergantung usia dan spesifikasi mesin mobil Anda. Pelajari perbedaan mendasarnya di sini...",
      image:
        "https://i.pinimg.com/1200x/f2/5d/1e/f25d1edf40c40ba9dd19f90ab3b265bc.jpg",
    },
    {
      date: "15 Juli 2026",
      title: "Pentingnya Spooring Rutin Setiap 10.000 KM",
      desc: "Setir lari ke kiri atau ban makan sebelah adalah tanda mobil butuh spooring. Jangan abaikan karena bisa membahayakan keselamatan berkendara...",
      image:
        "https://i.pinimg.com/vwebp/736x/97/d7/97/97d79741c55df58de828af4ffad20fee.webp",
    },
    {
      date: "02 Juli 2026",
      title: "Cara Menjaga Interior Kulit Agar Tetap Mewah",
      desc: "Jok kulit rentan pecah-pecah jika sering terpapar panas matahari. Gunakan kondisioner khusus secara rutin untuk menjaga kelembapan materialnya...",
      image:
        "https://i.pinimg.com/vwebp/736x/63/78/7c/63787c7668494f20badd8b71d83cedd3.webp",
    },
  ];

  const displayedArticles = showAll ? articles : articles.slice(0, 3);

  return (
    <section className="py-16 sm:py-20 text-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-2"
          >
            <p className="text-[#E07A5F] text-xs sm:text-sm font-bold tracking-widest uppercase">
              BLOG & TIPS
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Wawasan Otomotif
            </h2>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-bold text-white/80 hover:text-[#E07A5F] transition-colors underline underline-offset-8 self-start sm:self-auto cursor-pointer"
          >
            {showAll ? "Tampilkan Lebih Sedikit" : "Lihat Semua Artikel"}
          </motion.button>
        </div>

        {/* Grid Artikel */}
        <motion.div
          layout
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {displayedArticles.map((article, idx) => (
              <motion.div
                key={article.title}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex flex-col justify-between group cursor-pointer bg-[#171717] sm:bg-transparent p-4 sm:p-0 rounded-[28px] border border-white/5 sm:border-0"
              >
                <div>
                  <div className="relative w-full h-[240px] sm:h-[260px] rounded-[22px] overflow-hidden mb-5 bg-[#1a1a1a]">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      unoptimized
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-semibold text-[#E07A5F]">
                      {article.date}
                    </p>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-[#E07A5F] transition-colors duration-300 leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-white/60 line-clamp-2 leading-relaxed font-normal">
                      {article.desc}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-[#E07A5F] transition-colors duration-300">
                    Baca Selengkapnya
                    <span className="transform group-hover:translate-x-1.5 transition-transform duration-300">
                      →
                    </span>
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
