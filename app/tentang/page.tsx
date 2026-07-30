"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Info, Award, ShieldCheck, Users, Target, CheckCircle2 } from "lucide-react";

export default function TentangPage() {
  const milestones = [
    { year: "2015", title: "Berdiri di Jakarta", desc: "Berawal dari bengkel kecil yang melayani modifikasi mobil sport Jepang." },
    { year: "2018", title: "Sertifikasi Internasional", desc: "Mendapatkan sertifikasi ISO 9001 untuk standar manajemen mutu pelayanan otomotif." },
    { year: "2021", title: "Ekspansi Nasional", desc: "Membuka cabang di Surabaya, Bandung, dan Bali dengan lebih dari 500+ klien aktif." },
    { year: "2026", title: "Inovasi Digital", desc: "Meluncurkan platform booking & e-commerce terintegrasi untuk kenyamanan pelanggan." },
  ];

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
            <Info className="w-4 h-4 text-[#E07A5F]" /> Mengenal Auto Craft
          </span>
        </div>
      </header>

      {/* HERO */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 text-[#E07A5F] border border-white/10 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Dedikasi Untuk <br/> <span className="text-[#E07A5F]">Kesempurnaan Otomotif</span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Auto Craft adalah pusat layanan otomotif premium yang berfokus pada perawatan, perbaikan, dan modifikasi kendaraan roda empat dengan presisi tinggi dan suku cadang original.
          </p>
        </motion.div>
      </section>

      {/* VISION & MISSION */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-10 hover:border-[#E07A5F]/30 transition-colors">
            <Target className="w-10 h-10 text-[#E07A5F] mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Visi Kami</h2>
            <p className="text-white/70 leading-relaxed">
              Menjadi standar emas industri perbengkelan di Asia Tenggara dengan menggabungkan keahlian teknis tingkat tinggi, inovasi teknologi, dan pelayanan pelanggan bintang lima.
            </p>
          </div>
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-10 hover:border-[#E07A5F]/30 transition-colors">
            <Users className="w-10 h-10 text-[#E07A5F] mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Misi Kami</h2>
            <ul className="text-white/70 space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#E07A5F] flex-shrink-0 mt-0.5" />
                <span>Memberikan solusi perawatan mobil transparan tanpa biaya tersembunyi.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#E07A5F] flex-shrink-0 mt-0.5" />
                <span>Selalu menggunakan alat diagnostik terbaru sesuai standar pabrikan.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#E07A5F] flex-shrink-0 mt-0.5" />
                <span>Mengedukasi pemilik kendaraan tentang perawatan yang tepat.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* MILESTONES */}
      <section className="max-w-4xl mx-auto px-6 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Perjalanan Kami</h2>
          <p className="text-white/50 mt-2">Dari garasi kecil hingga bengkel berskala nasional.</p>
        </div>
        
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
          {milestones.map((m, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-black bg-[#1A1A1A] group-hover:bg-[#E07A5F] text-white/50 group-hover:text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl transition-colors z-10">
                <Award className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#121212] border border-white/10 p-6 rounded-2xl group-hover:border-[#E07A5F]/50 transition-colors">
                <div className="text-[#E07A5F] font-black text-xl mb-1">{m.year}</div>
                <h3 className="text-white font-bold text-lg mb-2">{m.title}</h3>
                <p className="text-white/60 text-sm">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
