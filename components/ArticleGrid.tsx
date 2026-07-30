"use client";

import { articles } from "@/data/dummy";
import { ArrowRight } from "lucide-react";

export default function ArticleGrid() {
  return (
    <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-6">
        <div className="space-y-3">
          <p className="text-[#E07A5F] text-xs font-bold tracking-widest uppercase">
            Blog & Tips
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Wawasan Otomotif
          </h2>
        </div>
        <button className="text-sm font-bold text-white hover:text-[#E07A5F] transition-colors underline underline-offset-4">
          Lihat Semua Artikel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <div key={article.id} className="group cursor-pointer flex flex-col h-full">
            <div className="relative w-full h-64 rounded-[24px] overflow-hidden bg-[#1A1A1A] mb-6">
              <img 
                src={article.thumbnail} 
                alt={article.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
                <span className="text-[10px] font-bold text-white tracking-widest uppercase">
                  {article.category}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col grow pr-4">
              <p className="text-[#E07A5F] text-xs font-bold mb-3">{article.date}</p>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#E07A5F] transition-colors leading-snug line-clamp-2">
                {article.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6 line-clamp-3">
                {article.preview}
              </p>
              
              <div className="mt-auto flex items-center gap-2 text-white font-bold text-sm group-hover:text-[#E07A5F] transition-colors">
                Baca Selengkapnya
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
