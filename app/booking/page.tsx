"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// Type definition untuk Form State
interface BookingFormData {
  vehicle: string;
  serviceCategory: string;
  services: string[];
  date: string;
  time: string;
  notes: string;
}

export default function BookingPage() {
  const [formData, setFormData] = useState<BookingFormData>({
    vehicle: "Porsche 911 GT3 RS (B 911 CRA)",
    serviceCategory: "Performa & Engine",
    services: [],
    date: "",
    time: "",
    notes: "",
  });

  const availableServices = [
    { id: "remap", name: "ECU Remap & Tuning", price: "Rp 3.500.000" },
    { id: "exhaust", name: "Custom Exhaust System", price: "Rp 7.000.000" },
    { id: "coating", name: "Ceramic Coating 9H", price: "Rp 4.500.000" },
    {
      id: "service",
      name: "Servis Rutin & Check 50 Titik",
      price: "Rp 1.200.000",
    },
    {
      id: "brake",
      name: "Upgrade Big Brake Kit (BBK)",
      price: "Rp 12.000.000",
    },
  ];

  const handleServiceToggle = (serviceName: string) => {
    setFormData((prev) => {
      const exists = prev.services.includes(serviceName);
      if (exists) {
        return {
          ...prev,
          services: prev.services.filter((s) => s !== serviceName),
        };
      } else {
        return { ...prev, services: [...prev.services, serviceName] };
      }
    });
  };

  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] flex flex-col font-sans">
      {/* HEADER */}
      <header className="bg-[#121212]/90 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/home"
            className="flex items-center gap-2 text-white/70 hover:text-white transition text-sm font-semibold"
          >
            ← Kembali ke Dashboard
          </Link>
          <span className="text-white font-bold text-lg">
            Buat Janji Temu / Booking
          </span>
        </div>
      </header>

      {/* FORM CONTAINER */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 my-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#121212] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8"
        >
          {/* TITLE */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Reservasi Layanan Auto Craft
            </h1>
            <p className="text-xs sm:text-sm text-white/60">
              Isi detail berikut untuk mendaftarkan jadwal servis atau
              modifikasi kendaraan Anda.
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* 1. PILIH KENDARAAN */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-white/80 uppercase tracking-wider">
                1. Pilih Kendaraan
              </label>
              <select
                value={formData.vehicle}
                onChange={(e) =>
                  setFormData({ ...formData, vehicle: e.target.value })
                }
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition cursor-pointer"
              >
                <option value="Porsche 911 GT3 RS (B 911 CRA)">
                  Porsche 911 GT3 RS — B 911 CRA
                </option>
                <option value="BMW M4 Competition (B 444 M)">
                  BMW M4 Competition — B 444 M
                </option>
                <option value="+ Tambah Kendaraan Baru">
                  + Tambah Mobil Lain
                </option>
              </select>
            </div>

            {/* 2. PILIH LAYANAN */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-white/80 uppercase tracking-wider">
                2. Pilih Jenis Layanan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableServices.map((srv) => {
                  const isSelected = formData.services.includes(srv.name);
                  return (
                    <div
                      key={srv.id}
                      onClick={() => handleServiceToggle(srv.name)}
                      className={`p-4 rounded-xl border cursor-pointer transition flex justify-between items-center ${
                        isSelected
                          ? "bg-[#E07A5F]/15 border-[#E07A5F] text-white"
                          : "bg-[#1A1A1A] border-white/10 text-white/70 hover:border-white/30"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-white">
                          {srv.name}
                        </p>
                        <p className="text-xs text-[#E07A5F] font-semibold mt-1">
                          {srv.price}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-[#E07A5F] bg-[#E07A5F]"
                            : "border-white/30"
                        }`}
                      >
                        {isSelected && (
                          <span className="text-white text-[10px]">✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. TANGGAL & WAKTU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/80 uppercase tracking-wider">
                  3. Tanggal Kedatangan
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/80 uppercase tracking-wider">
                  Jam Kedatangan
                </label>
                <select
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition cursor-pointer"
                  required
                >
                  <option value="">Pilih Jam</option>
                  <option value="09:00 WIB">09:00 WIB</option>
                  <option value="11:00 WIB">11:00 WIB</option>
                  <option value="14:00 WIB">14:00 WIB</option>
                  <option value="16:00 WIB">16:00 WIB</option>
                </select>
              </div>
            </div>

            {/* 4. CATATAN TAMBAHAN */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-white/80 uppercase tracking-wider">
                4. Catatan / Keluhan Spesifik
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan jika ada kendala khusus atau permintaan kustomisasi..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition placeholder:text-white/30 resize-none"
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 flex gap-4">
              <Link
                href="/home"
                className="w-1/3 text-center bg-[#1A1A1A] hover:bg-white/10 text-white font-bold text-sm py-3.5 rounded-xl border border-white/10 transition flex items-center justify-center"
              >
                Batal
              </Link>
              <button
                type="submit"
                onClick={() => alert("Booking Berhasil Dibuat!")}
                className="w-2/3 bg-[#E07A5F] hover:bg-[#d0694e] text-white font-bold text-sm py-3.5 rounded-xl transition shadow-lg shadow-[#E07A5F]/20 active:scale-[0.98]"
              >
                Konfirmasi Booking
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
