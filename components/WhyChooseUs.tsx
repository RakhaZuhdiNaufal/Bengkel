"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function WhyChooseUs() {
  const features = [
    {
      num: 1,
      title: "Teknisi Bersertifikat",
      desc: "Ditangani mekanik ahli yang telah lulus standar manufaktur internasional.",
      side: "right", // Teks kanan, gambar kiri
      image: "landing/Mekanik.png",
    },
    {
      num: 2,
      title: "Garansi Servis",
      desc: "Jaminan pengerjaan hingga 6 bulan untuk setiap layanan perbaikan.",
      side: "left", // Teks kiri, gambar kanan
      image: "landing/Garansi.png",
    },
    {
      num: 3,
      title: "Sparepart Original",
      desc: "Hanya menggunakan suku cadang asli dengan kualitas terjamin pabrikan.",
      side: "right",
      image: "landing/Product.png",
    },
    {
      num: 4,
      title: "Harga Transparan",
      desc: "Estimasi biaya dihitung detail di awal tanpa ada biaya tersembunyi.",
      side: "left",
      image: "landing/Harga.png",
    },
    {
      num: 5,
      title: "Booking Online",
      desc: "Tidak perlu antre. Jadwalkan servis dari smartphone Anda kapan saja.",
      side: "right",
      image: "landing/Boking.png",
    },
    {
      num: 6,
      title: "Customer Support",
      desc: "Bantuan layanan pelanggan yang responsif dan siap menjawab keluhan.",
      side: "left",
      image: "landing/Cust.png",
    },
  ];

  return (
    <section className="py-32 bg-[#121212] text-[#F4F1DE] relative overflow-hidden border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6">
        {/* HEADER SECTION */}
        <div className="text-center mb-28 space-y-3">
          <p className="text-[#E07A5F] text-xs sm:text-sm font-bold tracking-widest uppercase">
            Kenapa Auto Craft
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Keunggulan Standar Premium
          </h2>
        </div>

        {/* TIMELINE CONTAINER */}
        <div className="relative">
          {/* GARIS MELEKUK LANDAI & TUMPUL (DESKTOP) */}
          <div className="hidden md:block absolute left-1/2 top-7 bottom-7 -translate-x-1/2 w-32 z-0 pointer-events-none">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 1000"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M 50 0 
                   C 85 100, 15 100, 50 200 
                   C 85 300, 15 300, 50 400 
                   C 85 500, 15 500, 50 600 
                   C 85 700, 15 700, 50 800 
                   C 85 900, 15 900, 50 1000"
                stroke="#E07A5F"
                strokeOpacity="0.45"
                strokeWidth="2.5"
                strokeDasharray="8 8"
              />
            </svg>
          </div>

          {/* ITEM LIST */}
          <div className="space-y-32 md:space-y-48 relative z-10">
            {features.map((item, index) => {
              const isRight = item.side === "right";

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex flex-col md:flex-row items-center justify-between gap-10 md:gap-0"
                >
                  {/* SISI KIRI (DESKTOP) */}
                  <div className="w-full md:w-[42%] text-left md:text-right order-2 md:order-1">
                    {!isRight ? (
                      /* Teks Kiri */
                      <div className="space-y-3 pl-16 md:pl-0">
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-md md:ml-auto font-normal">
                          {item.desc}
                        </p>
                      </div>
                    ) : (
                      /* Card Gambar Kiri (Desktop) */
                      <div className="hidden md:block relative w-full h-64 rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group transition-all duration-500 hover:border-[#E07A5F]/50">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-80" />
                      </div>
                    )}
                  </div>

                  {/* LINGKARAN NOMOR (TENGAH) */}
                  <div className="absolute left-1 md:relative md:left-auto z-10 flex items-center justify-center order-1 md:order-2 shrink-0">
                    <div className="w-14 h-14 rounded-full border-2 border-[#E07A5F] bg-[#121212] text-[#E07A5F] font-extrabold text-xl flex items-center justify-center shadow-[0_0_25px_rgba(224,122,95,0.4)]">
                      {item.num}
                    </div>
                  </div>

                  {/* SISI KANAN (DESKTOP & MOBILE) */}
                  <div className="w-full md:w-[42%] text-left order-3">
                    {/* Tampilan Mobile */}
                    <div className="block md:hidden pl-16 space-y-4">
                      <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-70" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-normal">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* Tampilan Desktop */}
                    {isRight ? (
                      /* Teks Kanan */
                      <div className="hidden md:block space-y-3">
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-md font-normal">
                          {item.desc}
                        </p>
                      </div>
                    ) : (
                      /* Card Gambar Kanan (Desktop) */
                      <div className="hidden md:block relative w-full h-64 rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group transition-all duration-500 hover:border-[#E07A5F]/50">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-80" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
