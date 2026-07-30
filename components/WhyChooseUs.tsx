"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Award, Wrench, CircleDollarSign, CalendarCheck, HeadphonesIcon } from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "Teknisi Bersertifikat",
      desc: "Ditangani mekanik ahli yang telah lulus standar manufaktur internasional.",
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Garansi Servis",
      desc: "Jaminan pengerjaan hingga 6 bulan untuk setiap layanan perbaikan.",
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: "Sparepart Original",
      desc: "Hanya menggunakan suku cadang asli dengan kualitas terjamin pabrikan.",
    },
    {
      icon: <CircleDollarSign className="w-8 h-8" />,
      title: "Harga Transparan",
      desc: "Estimasi biaya dihitung detail di awal tanpa ada biaya tersembunyi.",
    },
    {
      icon: <CalendarCheck className="w-8 h-8" />,
      title: "Booking Online",
      desc: "Tidak perlu antre. Jadwalkan servis dari smartphone Anda kapan saja.",
    },
    {
      icon: <HeadphonesIcon className="w-8 h-8" />,
      title: "Customer Support",
      desc: "Bantuan layanan pelanggan yang responsif dan siap menjawab keluhan.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16 space-y-3">
        <p className="text-[#E07A5F] text-xs font-bold tracking-widest uppercase">
          Kenapa Auto Craft
        </p>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Keunggulan Standar Premium
        </h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {features.map((item, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="group p-8 rounded-3xl bg-[#121212] border border-white/5 hover:border-[#E07A5F]/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(224,122,95,0.1)] flex flex-col items-start"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] border border-white/10 text-[#E07A5F] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#E07A5F] group-hover:text-black transition-all duration-300">
              {item.icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#E07A5F] transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-white/60 leading-relaxed font-medium">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
