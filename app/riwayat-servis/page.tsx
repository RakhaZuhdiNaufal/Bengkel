"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Car, Wrench, Download, Calendar, Clock, MapPin, Search } from "lucide-react";

export default function ServiceHistoryPage() {
  const [activeTab, setActiveTab] = useState("Menunggu");

  const myCars = [
    { brand: "Porsche", model: "911 GT3 RS", year: 2020, plate: "B 911 CRA", nextService: "12 Okt 2026" },
    { brand: "BMW", model: "M4 Competition", year: 2022, plate: "B 444 M", nextService: "5 Sep 2026" },
  ];

  const history = [
    {
      id: "INV-2026-0901",
      status: "Menunggu",
      car: "Porsche 911 GT3 RS",
      date: "01 September 2026",
      services: ["Pengecekan Kaki-Kaki", "Ganti Kampas Rem"],
      total: 3200000,
      branch: "Auto Craft Jakarta Selatan",
      technician: "-",
      progress: 0,
    },
    {
      id: "INV-2026-0812",
      status: "Proses",
      car: "Porsche 911 GT3 RS",
      date: "12 Agustus 2026",
      services: ["Custom Exhaust System", "General Tune Up"],
      total: 8500000,
      branch: "Auto Craft Jakarta Selatan",
      technician: "Budi (Master Mechanic)",
      progress: 65,
    },
    {
      id: "INV-2026-0510",
      status: "Selesai",
      car: "BMW M4 Competition",
      date: "10 Mei 2026",
      services: ["Ganti Oli Premium", "Spooring & Balancing"],
      total: 1550000,
      branch: "Auto Craft Jakarta Barat",
      technician: "Ahmad (Engine Specialist)",
      progress: 100,
    },
    {
      id: "INV-2025-1120",
      status: "Selesai",
      car: "Porsche 911 GT3 RS",
      date: "20 November 2025",
      services: ["Premium Auto Detailing"],
      total: 3500000,
      branch: "Auto Craft Serpong",
      technician: "Reza (Detailing Expert)",
      progress: 100,
    }
  ];

  const filteredHistory = history.filter(h => h.status === activeTab);

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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E07A5F] flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
            <span className="text-white text-sm font-bold hidden sm:block">Ahmad Dhani</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR: Profile & Garage */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-[#1A1A1A] border-4 border-[#E07A5F] mx-auto mb-4 flex items-center justify-center">
              <User className="w-10 h-10 text-white/50" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Ahmad Dhani</h2>
            <p className="text-[#E07A5F] text-xs font-black uppercase tracking-widest mb-4">Member Platinum</p>
            <div className="bg-[#1A1A1A] rounded-xl py-3 px-4 flex justify-between items-center text-sm">
              <span className="text-white/60">Poin Loyalitas</span>
              <span className="text-white font-bold">12,500 Pts</span>
            </div>
          </div>

          {/* My Garage */}
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-[#E07A5F]" /> Garasi Saya
            </h3>
            <div className="space-y-3">
              {myCars.map((car, idx) => (
                <div key={idx} className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 transition hover:border-white/20">
                  <p className="font-bold text-white text-sm">{car.brand} {car.model}</p>
                  <p className="text-white/50 text-xs mt-1">{car.year} • <span className="text-[#E07A5F] font-semibold">{car.plate}</span></p>
                  <div className="mt-3 pt-3 border-t border-dashed border-white/10 flex justify-between items-center">
                    <span className="text-[10px] text-white/40 uppercase">Servis Berikutnya</span>
                    <span className="text-xs text-white font-bold">{car.nextService}</span>
                  </div>
                </div>
              ))}
              <button className="w-full bg-[#1A1A1A] hover:bg-[#E07A5F] text-white/70 hover:text-white font-bold py-3 rounded-2xl border border-white/10 border-dashed hover:border-[#E07A5F] transition text-xs mt-2">
                + Tambah Kendaraan
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT: Service History */}
        <div className="lg:col-span-3">
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 sm:p-10 min-h-[600px]">
            <h1 className="text-3xl font-extrabold text-white mb-2">Riwayat Servis</h1>
            <p className="text-white/60 text-sm mb-8">Pantau status pengerjaan mobil Anda dan unduh invoice digital.</p>
            
            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 mb-8 overflow-x-auto pb-1 scrollbar-none">
              {["Menunggu", "Proses", "Selesai"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-2 font-bold text-sm transition border-b-2 whitespace-nowrap ${
                    activeTab === tab ? "border-[#E07A5F] text-[#E07A5F]" : "border-transparent text-white/50 hover:text-white"
                  }`}
                >
                  {tab === "Selesai" ? tab : `Sedang ${tab}`}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-6">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-20 text-white/40">
                  <Wrench className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Tidak ada riwayat servis untuk tab ini.</p>
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 justify-between hover:border-white/30 transition-colors"
                  >
                    {/* Left Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                          {item.id}
                        </span>
                        <span className="text-white/50 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {item.date}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{item.car}</h3>
                        <div className="text-sm text-[#E07A5F] font-semibold flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> {item.branch}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Layanan Dikerjakan:</span>
                        <ul className="text-sm text-white/80 list-disc list-inside">
                          {item.services.map((srv, i) => <li key={i}>{srv}</li>)}
                        </ul>
                      </div>
                      
                      <div className="text-xs text-white/50 flex items-center gap-2">
                        <User className="w-3 h-3" /> Teknisi: <span className="text-white font-medium">{item.technician}</span>
                      </div>
                    </div>

                    {/* Right Actions / Status */}
                    <div className="sm:w-64 flex flex-col justify-between sm:items-end border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
                      <div className="w-full text-left sm:text-right mb-6">
                        <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold block mb-1">Total Biaya</span>
                        <span className="text-2xl font-black text-white">Rp {item.total.toLocaleString("id-ID")}</span>
                      </div>
                      
                      <div className="w-full">
                        {item.status === "Menunggu" && (
                          <div className="space-y-2">
                            <button className="w-full bg-[#E07A5F] hover:bg-[#d0694e] text-white font-bold py-3 px-4 rounded-xl transition text-sm">
                              Reschedule
                            </button>
                            <button className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3 px-4 rounded-xl transition text-sm border border-red-500/20">
                              Batalkan
                            </button>
                          </div>
                        )}
                        
                        {item.status === "Proses" && (
                          <div className="w-full">
                            <div className="flex justify-between text-xs mb-2">
                              <span className="text-[#E07A5F] font-bold">Sedang Dikerjakan</span>
                              <span className="text-white/60">{item.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5">
                              <div className="h-full bg-[#E07A5F]" style={{ width: `${item.progress}%` }} />
                            </div>
                          </div>
                        )}

                        {item.status === "Selesai" && (
                          <div className="space-y-2">
                            <button className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-4 rounded-xl transition text-sm flex items-center justify-center gap-2 border border-white/10">
                              <Download className="w-4 h-4" /> Unduh Invoice
                            </button>
                            <button className="w-full bg-[#E07A5F]/10 hover:bg-[#E07A5F]/20 text-[#E07A5F] font-bold py-3 px-4 rounded-xl transition text-sm border border-[#E07A5F]/30">
                              Beri Ulasan
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
          </div>
        </div>

      </main>
    </div>
  );
}
