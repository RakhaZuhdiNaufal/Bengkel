import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#E07A5F]" />
      
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="black" strokeWidth="0.5" />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 relative z-10 text-center">
        <h2 className="text-4xl sm:text-6xl font-black text-black tracking-tight leading-[1.1] mb-6">
          Rawat Mobil Anda Bersama <br/> Auto Craft
        </h2>
        <p className="text-black/80 text-lg sm:text-xl font-medium max-w-2xl mx-auto mb-10">
          Bergabunglah dengan ribuan pemilik mobil premium yang telah mempercayakan perawatannya kepada kami.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/booking"
            className="w-full sm:w-auto bg-black text-white font-extrabold text-sm px-10 py-4 rounded-full transition-all hover:scale-105 shadow-2xl flex items-center justify-center gap-2"
          >
            Booking Sekarang
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href="/kontak"
            className="w-full sm:w-auto bg-transparent border-2 border-black text-black font-extrabold text-sm px-10 py-4 rounded-full transition-all hover:bg-black/5 flex items-center justify-center"
          >
            Hubungi Kami
          </Link>
        </div>
      </div>
    </section>
  );
}
