"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Calendar, ChevronRight, Bookmark, Share2 } from "lucide-react";
import { articles } from "@/data/dummy";

export default function TipsServisPage() {
  const [bookmarked, setBookmarked] = useState<number[]>([]);

  const toggleBookmark = (id: number) => {
    setBookmarked(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] font-sans selection:bg-[#E07A5F]/30 pb-24">
      {/* HEADER */}
      <header className="bg-[#121212]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/home"
            className="flex items-center gap-2 text-white/70 hover:text-white transition text-sm font-semibold"
          >
            ← Kembali ke Dashboard
          </Link>
          <span className="text-white font-bold text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#E07A5F]" /> Tips Servis
          </span>
        </div>
      </header>

      {/* HERO */}
      <section className="px-6 py-16 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
          Jurnal <span className="text-[#E07A5F]">Otomotif</span>
        </h1>
        <p className="text-white/60 text-sm sm:text-base max-w-2xl mx-auto">
          Tingkatkan performa dan keawetan kendaraan Anda dengan tips dan panduan teknis langsung dari ahli mekanik Auto Craft.
        </p>
      </section>

      <main className="max-w-7xl mx-auto px-6">
        
        {/* FEATURED ARTICLE */}
        {articles.length > 0 && (
          <div className="mb-12 relative rounded-[32px] overflow-hidden group cursor-pointer">
            <div className="h-[400px] w-full relative">
              <img 
                src={articles[0].thumbnail} 
                alt={articles[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>
            <div className="absolute bottom-8 left-8 right-8 md:w-2/3">
              <span className="bg-[#E07A5F] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                Artikel Utama • {articles[0].category}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 group-hover:text-[#E07A5F] transition-colors">{articles[0].title}</h2>
              <p className="text-white/80 text-sm sm:text-base mb-4 line-clamp-2">{articles[0].preview}</p>
              <div className="flex items-center gap-4 text-xs text-white/50">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {articles[0].date}</span>
                <span className="flex items-center gap-1 hover:text-white transition" onClick={(e) => { e.stopPropagation(); toggleBookmark(articles[0].id); }}>
                  <Bookmark className={`w-4 h-4 ${bookmarked.includes(articles[0].id) ? "fill-[#E07A5F] text-[#E07A5F]" : ""}`} /> Simpan
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ARTICLES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(1).map((article) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#121212] border border-white/10 rounded-3xl overflow-hidden hover:border-[#E07A5F]/50 transition-all duration-300 group flex flex-col"
            >
              <div className="h-48 relative overflow-hidden bg-[#1A1A1A]">
                <img 
                  src={article.thumbnail} 
                  alt={article.title} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10">
                  {article.category}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-[#E07A5F] mb-3 font-semibold">
                  <Calendar className="w-3 h-3" /> {article.date}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-[#E07A5F] transition-colors flex-1">
                  {article.title}
                </h3>
                <p className="text-white/50 text-sm mb-6 line-clamp-3">
                  {article.preview}
                </p>
                
                <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                  <button className="text-white font-bold text-sm flex items-center gap-1 group-hover:text-[#E07A5F] transition">
                    Baca Selengkapnya <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-3 text-white/40">
                    <button className="hover:text-white transition">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => toggleBookmark(article.id)}
                      className="hover:text-[#E07A5F] transition"
                    >
                      <Bookmark className={`w-4 h-4 ${bookmarked.includes(article.id) ? "fill-[#E07A5F] text-[#E07A5F]" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
