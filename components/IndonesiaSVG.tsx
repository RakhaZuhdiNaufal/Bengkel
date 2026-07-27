"use client";

import Image from "next/image";

export default function IndonesiaSVG() {
  return (
    <div className="relative w-full aspect-[2.2/1] max-w-5xl mx-auto flex items-center justify-center">
      <Image
        src="/p.svg" // Atau ganti /indonesia-silhouette.svg jika ingin file satunya
        alt="Peta Indonesia Dotted Map"
        fill
        priority
        className="object-contain pointer-events-none select-none filter invert sepia(100%) saturate(300%) hue-rotate(330deg) opacity-70"
      />
    </div>
  );
}
