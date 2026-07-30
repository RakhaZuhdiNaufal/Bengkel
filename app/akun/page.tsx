"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { User, Car, Award, ChevronRight, Save, Trash2, Plus, Edit2 } from "lucide-react";

export default function AkunPage() {
  const [activeTab, setActiveTab] = useState("Profil");
  
  // Simulasi data
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "081234567890",
  });

  const [garage, setGarage] = useState([
    { id: 1, brand: "Porsche", model: "911 GT3 RS", year: "2020", plate: "B 911 CRA" },
    { id: 2, brand: "BMW", model: "M4 Competition", year: "2022", plate: "B 444 M" },
  ]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profil berhasil diperbarui!");
  };

  const handleRemoveCar = (id: number) => {
    setGarage(garage.filter(car => car.id !== id));
  };

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
          <span className="text-white font-bold text-sm">Pengaturan Akun</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* SIDEBAR TABS */}
          <aside className="md:col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab("Profil")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition ${activeTab === "Profil" ? "bg-[#E07A5F] text-white shadow-lg shadow-[#E07A5F]/20" : "bg-[#121212] text-white/70 hover:text-white hover:bg-[#1A1A1A] border border-white/5"}`}
            >
              <div className="flex items-center gap-3"><User className="w-4 h-4" /> Edit Profil</div>
              {activeTab === "Profil" && <ChevronRight className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setActiveTab("Garasi")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition ${activeTab === "Garasi" ? "bg-[#E07A5F] text-white shadow-lg shadow-[#E07A5F]/20" : "bg-[#121212] text-white/70 hover:text-white hover:bg-[#1A1A1A] border border-white/5"}`}
            >
              <div className="flex items-center gap-3"><Car className="w-4 h-4" /> Kelola Garasi</div>
              {activeTab === "Garasi" && <ChevronRight className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setActiveTab("Poin")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition ${activeTab === "Poin" ? "bg-[#E07A5F] text-white shadow-lg shadow-[#E07A5F]/20" : "bg-[#121212] text-white/70 hover:text-white hover:bg-[#1A1A1A] border border-white/5"}`}
            >
              <div className="flex items-center gap-3"><Award className="w-4 h-4" /> Loyalitas & Poin</div>
              {activeTab === "Poin" && <ChevronRight className="w-4 h-4" />}
            </button>
          </aside>

          {/* CONTENT AREA */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === "Profil" && (
                <motion.div 
                  key="profil"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="bg-[#121212] border border-white/10 rounded-[32px] p-8 sm:p-10"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Informasi Pribadi</h2>
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-white/50 uppercase">Nama Lengkap</label>
                        <input 
                          type="text" 
                          value={profile.name}
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                          className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#E07A5F] outline-none transition"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-white/50 uppercase">Nomor HP</label>
                        <input 
                          type="tel" 
                          value={profile.phone}
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                          className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#E07A5F] outline-none transition"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/50 uppercase">Email (Tidak bisa diubah)</label>
                      <input 
                        type="email" 
                        value={profile.email}
                        disabled
                        className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-white/40 cursor-not-allowed"
                      />
                    </div>
                    
                    <div className="pt-4 border-t border-white/5 flex justify-end">
                      <button type="submit" className="bg-[#E07A5F] hover:bg-[#d0694e] text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition">
                        <Save className="w-4 h-4" /> Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === "Garasi" && (
                <motion.div 
                  key="garasi"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="bg-[#121212] border border-white/10 rounded-[32px] p-8 sm:p-10"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Garasi Saya</h2>
                    <button className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-lg transition flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Tambah Mobil
                    </button>
                  </div>

                  {garage.length === 0 ? (
                    <div className="text-center py-12 bg-[#1A1A1A] rounded-2xl border border-white/5">
                      <Car className="w-12 h-12 text-white/20 mx-auto mb-3" />
                      <p className="text-white/50">Belum ada mobil di garasi Anda.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {garage.map((car) => (
                        <div key={car.id} className="bg-[#1A1A1A] border border-white/5 hover:border-white/20 transition rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-white">{car.brand} {car.model}</h3>
                            <p className="text-white/50 text-sm mt-1">Tahun: {car.year} <span className="mx-2">•</span> Plat: <span className="text-[#E07A5F] font-semibold">{car.plate}</span></p>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2">
                              <Edit2 className="w-4 h-4" /> Edit
                            </button>
                            <button onClick={() => handleRemoveCar(car.id)} className="flex-1 sm:flex-none bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2">
                              <Trash2 className="w-4 h-4" /> Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "Poin" && (
                <motion.div 
                  key="poin"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="bg-[#121212] border border-white/10 rounded-[32px] p-8 sm:p-10"
                >
                  <h2 className="text-2xl font-bold text-white mb-2">Member Platinum</h2>
                  <p className="text-white/50 text-sm mb-8">Kumpulkan poin dari setiap transaksi servis dan belanja.</p>

                  <div className="bg-gradient-to-r from-[#1A1A1A] to-[#E07A5F]/10 border border-[#E07A5F]/30 rounded-2xl p-6 mb-8 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#E07A5F] uppercase tracking-wider mb-1">Total Poin Saat Ini</p>
                      <h3 className="text-4xl font-black text-white">12,500 <span className="text-lg font-medium text-white/50">pts</span></h3>
                    </div>
                    <div className="w-16 h-16 bg-[#E07A5F]/20 rounded-full flex items-center justify-center border border-[#E07A5F]/50">
                      <Award className="w-8 h-8 text-[#E07A5F]" />
                    </div>
                  </div>

                  <h3 className="font-bold text-white mb-4">Riwayat Poin Terakhir</h3>
                  <div className="space-y-3">
                    {[
                      { title: "Servis Rutin Porsche", date: "12 Agustus 2026", pts: "+1,200" },
                      { title: "Pembelian Oli Motul", date: "05 Agustus 2026", pts: "+150" },
                      { title: "Penukaran Voucher Diskon", date: "20 Juli 2026", pts: "-500" },
                    ].map((history, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-white">{history.title}</p>
                          <p className="text-xs text-white/40 mt-1">{history.date}</p>
                        </div>
                        <span className={`font-bold ${history.pts.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                          {history.pts}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  );
}
