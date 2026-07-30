"use client";

import { useState } from "react";
import { vehicles, branches, services } from "@/data/dummy";
import { Calculator } from "lucide-react";

export default function CostEstimator() {
  const [vehicleId, setVehicleId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [branch, setBranch] = useState("");

  const selectedService = services.find(s => s.id === serviceId);
  const totalCost = selectedService ? selectedService.price : 0;

  return (
    <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#121212] border border-white/10 rounded-[40px] p-8 sm:p-16 flex flex-col lg:flex-row gap-12 items-center shadow-2xl relative overflow-hidden">
        
        {/* Dekorasi */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E07A5F]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex-1 space-y-6 relative z-10">
          <div className="w-14 h-14 bg-[#E07A5F]/10 rounded-2xl flex items-center justify-center text-[#E07A5F] border border-[#E07A5F]/20">
            <Calculator className="w-7 h-7" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Transparansi Harga Tanpa Biaya Tersembunyi
          </h2>
          <p className="text-white/60 text-sm sm:text-base max-w-md leading-relaxed">
            Hitung estimasi biaya servis kendaraan Anda secara instan. Kami menjamin transparansi harga sebelum perbaikan dilakukan.
          </p>
        </div>

        <div className="w-full lg:w-[480px] bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 relative z-10">
          <h3 className="text-lg font-bold text-white mb-6">Kalkulator Estimasi</h3>
          
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-2">Jenis Kendaraan</label>
              <select 
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition cursor-pointer"
              >
                <option value="">Pilih Kendaraan</option>
                {vehicles.map(v => (
                  <optgroup key={v.brand} label={v.brand}>
                    {v.models.map(m => (
                      <option key={m} value={`${v.brand} ${m}`}>{v.brand} {m}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-2">Jenis Servis</label>
              <select 
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition cursor-pointer"
              >
                <option value="">Pilih Layanan</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-2">Cabang</label>
              <select 
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition cursor-pointer"
              >
                <option value="">Pilih Cabang</option>
                {branches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-[#121212] rounded-2xl p-5 flex items-center justify-between border border-white/5 mb-6">
            <span className="text-sm font-bold text-white/70">Total Estimasi</span>
            <span className="text-2xl font-black text-[#E07A5F]">
              Rp{totalCost.toLocaleString('id-ID')}
            </span>
          </div>

          <button 
            disabled={!vehicleId || !serviceId || !branch}
            className="w-full bg-[#E07A5F] hover:bg-[#d9a41c] disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-black font-extrabold text-sm py-4 rounded-xl transition-all"
          >
            Booking Sekarang
          </button>
        </div>
      </div>
    </section>
  );
}
