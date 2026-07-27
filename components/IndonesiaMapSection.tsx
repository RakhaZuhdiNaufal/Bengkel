"use client";

import React from "react";

interface CityPin {
  id: string;
  name: string;
  x: number;
  y: number;
}

const cities: CityPin[] = [
  { id: "medan", name: "Medan", x: 130, y: 180 },
  { id: "jabodetabek", name: "Jabodetabek", x: 265, y: 345 },
  { id: "surabaya", name: "Surabaya", x: 410, y: 365 },
  { id: "bali", name: "Bali", x: 455, y: 395 },
  { id: "balikpapan", name: "Balikpapan", x: 460, y: 220 },
  { id: "makassar", name: "Makassar", x: 575, y: 310 },
  { id: "jayapura", name: "Jayapura", x: 915, y: 235 },
];

export default function IndonesiaMapSection() {
  return (
    <section className="relative w-full bg-[#121212] py-16 sm:py-24 text-white overflow-hidden border-t border-white/10">
      {/* Header Section */}
      <div className="text-center mb-12 sm:mb-16 px-4 z-10 relative max-w-3xl mx-auto">
        <p className="text-[#E07A5F] text-xs sm:text-sm font-bold tracking-widest uppercase mb-2">
          Jaringan Workshop
        </p>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Hadir di Berbagai Kota Besar
        </h2>
        <p className="text-gray-400 text-xs sm:text-base leading-relaxed font-normal">
          Temukan bengkel dan jaringan spesialis kami yang siap melayani
          kebutuhan kendaraan Anda di seluruh wilayah Indonesia.
        </p>
      </div>

      {/* Container Utama Peta */}
      <div className="relative w-full max-w-[1200px] aspect-[2.2/1] mx-auto px-4 flex items-center justify-center">
        {/* Layer 1: Peta Indonesia Background */}
        <div
          className="w-full h-full"
          style={{
            maskImage: "url('/p.svg')",
            WebkitMaskImage: "url('/p.svg')",
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
            backgroundImage: "radial-gradient(#E07A5F 2px, transparent 2px)",
            backgroundSize: "12px 12px",
            opacity: 0.85,
          }}
        />

        {/* Layer 2: Pin Lokasi Kota Fixed */}
        <svg
          viewBox="0 0 1000 500"
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
        >
          {cities.map((city) => (
            <g
              key={city.id}
              transform={`translate(${city.x}, ${city.y})`}
              className="pointer-events-auto cursor-pointer group"
            >
              {/* Badge Teks Nama Kota (Posisi x/y fixed, tidak bergeser saat hover) */}
              <foreignObject
                x="-60"
                y="-42"
                width="120"
                height="32"
                className="overflow-visible"
              >
                <div className="flex justify-center items-center w-full h-full">
                  <span className="bg-[#E07A5F] text-white text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-[0_4px_12px_rgba(224,122,95,0.5)] whitespace-nowrap transition-opacity duration-200 group-hover:opacity-90 block">
                    {city.name}
                  </span>
                </div>
              </foreignObject>

              {/* Icon Marker Pin */}
              <g transform="translate(-10, -10)">
                <circle
                  cx="10"
                  cy="10"
                  r="12"
                  className="fill-[#E07A5F]/20 blur-[2px] transition-colors duration-200 group-hover:fill-[#E07A5F]/50"
                />
                <path
                  d="M10 2C6.77 2 4.17 4.6 4.17 7.83C4.17 12.2 10 18.67 10 18.67C10 18.67 15.83 12.2 15.83 7.83C15.83 4.6 13.23 2 10 2ZM10 9.92C8.85 9.92 7.92 8.98 7.92 7.83C7.92 6.68 8.85 5.75 10 5.75C11.15 5.75 12.08 6.68 12.08 7.83C12.08 8.98 11.15 9.92 10 9.92Z"
                  fill="#E07A5F"
                />
              </g>
            </g>
          ))}
        </svg>
      </div>

      {/* Button Floating Chat Kanan Bawah */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="flex items-center gap-2 bg-white text-black text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-2xl hover:bg-gray-100 transition-all transform active:scale-95">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          Chat Kami
        </button>
      </div>
    </section>
  );
}
