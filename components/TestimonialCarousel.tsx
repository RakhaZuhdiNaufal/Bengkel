import { testimonials } from "@/data/dummy";
import { Star, Quote } from "lucide-react";

export default function TestimonialCarousel() {
  return (
    <section className="py-20 bg-[#121212] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-16 space-y-3">
          <p className="text-[#E07A5F] text-xs font-bold tracking-widest uppercase">
            Ulasan Pelanggan
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Dipercaya Oleh Ribuan Pemilik Mobil
          </h2>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {testimonials.map((t) => (
            <div 
              key={t.id} 
              className="snap-start shrink-0 w-[320px] sm:w-[400px] bg-[#1A1A1A] border border-white/5 rounded-3xl p-8 relative flex flex-col hover:border-[#E07A5F]/30 transition-colors"
            >
              <Quote className="absolute top-8 right-8 w-12 h-12 text-white/5 rotate-180" />
              
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(t.rating) ? "text-[#E07A5F] fill-[#E07A5F]" : "text-white/20"}`} 
                  />
                ))}
              </div>
              
              <p className="text-white/80 text-sm leading-relaxed mb-8 grow">
                "{t.comment}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                <div>
                  <h4 className="text-white font-bold text-sm">{t.name}</h4>
                  <p className="text-[#E07A5F] text-xs font-semibold">{t.car}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
