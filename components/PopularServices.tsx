import { motion } from "framer-motion";
import { services } from "@/data/dummy";
import { Star, Clock } from "lucide-react";

export default function PopularServices() {
  return (
    <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-6">
        <div className="space-y-3">
          <p className="text-[#E07A5F] text-xs font-bold tracking-widest uppercase">
            Katalog Servis
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Layanan Populer
          </h2>
        </div>
        <button className="text-sm font-bold text-white hover:text-[#E07A5F] transition-colors underline underline-offset-4">
          Lihat Semua Layanan
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {services.map((service, idx) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="group flex flex-col bg-[#121212] border border-white/10 rounded-[28px] overflow-hidden hover:border-[#E07A5F]/40 transition-colors"
          >
            <div className="relative h-56 w-full overflow-hidden bg-[#1A1A1A]">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-[#E07A5F] fill-[#E07A5F]" />
                <span className="text-xs font-bold text-white">{service.rating}</span>
                <span className="text-[10px] text-white/50">({service.reviews})</span>
              </div>
            </div>

            <div className="p-6 flex flex-col grow">
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#E07A5F] transition-colors line-clamp-1">
                {service.name}
              </h3>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg text-white/70 text-xs font-medium">
                  <Clock className="w-4 h-4 text-[#E07A5F]" />
                  Estimasi: {service.estimatedTime}
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-5">
                <div>
                  <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider mb-0.5">Harga Mulai</p>
                  <p className="text-lg font-extrabold text-white">
                    Rp{service.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <button className="bg-[#1A1A1A] hover:bg-[#E07A5F] text-white hover:text-black font-bold text-sm px-6 py-2.5 rounded-xl transition-all border border-white/10 hover:border-transparent">
                  Detail
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
