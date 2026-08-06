"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { vehicles, branches, services } from "@/data/dummy";
import { CheckCircle2, ChevronRight, ChevronLeft, Wrench, User, Calendar, MapPin, Car } from "lucide-react";

interface BookingData {
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  vehiclePlate: string;
  branch: string;
  selectedServices: string[];
  date: string;
  time: string;
  notes: string;
}



export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [data, setData] = useState<BookingData>({
    vehicleBrand: "",
    vehicleModel: "",
    vehicleYear: "",
    vehiclePlate: "",
    branch: "",
    selectedServices: [],
    date: "",
    time: "",
    notes: "",
  });

  const [myCars, setMyCars] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserCars = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: cars } = await supabase.from("vehicles").select("*").eq("user_id", user.id);
        if (cars) {
          setMyCars(cars);
          // Auto-select if they have cars
          if (cars.length > 0) {
            setData(prev => ({
              ...prev,
              vehicleBrand: cars[0].merk,
              vehicleModel: cars[0].tipe,
              vehicleYear: cars[0].tahun?.toString() || "",
              vehiclePlate: cars[0].nomor_polisi
            }));
          }
        }
      }
    };
    fetchUserCars();
  }, []);

  const selectedBrandObj = vehicles.find((v) => v.brand === data.vehicleBrand);

  const handleNext = () => setStep((p) => Math.min(p + 1, 5));
  const handlePrev = () => setStep((p) => Math.max(p - 1, 1));

  const toggleService = (id: string) => {
    setData((prev) => {
      const exists = prev.selectedServices.includes(id);
      if (exists) {
        return { ...prev, selectedServices: prev.selectedServices.filter((s) => s !== id) };
      } else {
        return { ...prev, selectedServices: [...prev.selectedServices, id] };
      }
    });
  };

  const supabase = createClient();

  const submitBooking = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Anda harus login terlebih dahulu");

      // 1. Cek atau Buat Kendaraan
      let vehicleId = "";
      const { data: existingVehicle } = await supabase
        .from("vehicles")
        .select("id")
        .eq("nomor_polisi", data.vehiclePlate)
        .eq("user_id", user.id)
        .single();
      
      if (existingVehicle) {
        vehicleId = existingVehicle.id;
      } else {
        const { data: newVehicle, error: vErr } = await supabase
          .from("vehicles")
          .insert({
            user_id: user.id,
            merk: data.vehicleBrand,
            tipe: data.vehicleModel,
            nomor_polisi: data.vehiclePlate,
            tahun: parseInt(data.vehicleYear) || new Date().getFullYear(),
            warna: "Hitam" // Default warna karena tidak ada di form booking
          })
          .select("id")
          .single();
        if (vErr) throw new Error("Gagal menyimpan data kendaraan: " + vErr.message);
        vehicleId = newVehicle.id;
      }

      // Kalkulasi Total
      const computedTotal = data.selectedServices.reduce((total, srvId) => {
        const srv = services.find((s) => s.id === srvId);
        return total + (srv ? srv.price : 0);
      }, 0);

      // 2. Buat Booking (tanpa membuat Service/Work Order — itu tugas Admin saat Check-In)
      const combinedServices = data.selectedServices.map(id => services.find(s => s.id === id)?.name).join(", ");
      const serviceItemsJson = data.selectedServices.map(id => {
        const srv = services.find(s => s.id === id);
        return { id: srv?.id, name: srv?.name, price: srv?.price };
      });
      
      const { error: bErr } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          vehicle_id: vehicleId,
          tanggal: data.date + " " + data.time,
          jenis_servis: combinedServices,
          keluhan: data.notes,
          mekanik: null,
          status: "menunggu",
          service_items: serviceItemsJson,
          estimasi_total: computedTotal
        });
      if (bErr) throw new Error("Gagal membuat pesanan: " + bErr.message);

      // Payment/Invoice TIDAK dibuat di sini.
      // Invoice deposit akan diterbitkan otomatis oleh Admin saat menekan "Terima".

      setIsSuccess(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kalkulasi Total
  const totalBiaya = data.selectedServices.reduce((total, srvId) => {
    const srv = services.find((s) => s.id === srvId);
    return total + (srv ? srv.price : 0);
  }, 0);

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#1A1A1A] border border-white/10 rounded-3xl p-10 text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Pesanan Terkirim!</h2>
          <p className="text-white/60 mb-3">
            Pesanan Anda sedang ditinjau oleh bengkel. Kami akan mengonfirmasi ketersediaan jadwal dan mengirimkan tagihan deposit setelah pesanan diterima.
          </p>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3 mb-8">
            <p className="text-orange-400 text-sm font-semibold">🕒 Status: Menunggu Konfirmasi Bengkel</p>
            <p className="text-orange-400/70 text-xs mt-1">Anda tidak perlu membayar apa pun saat ini.</p>
          </div>
          <button 
            onClick={() => router.push("/riwayat-servis")}
            className="w-full bg-[#E07A5F] hover:bg-[#d0694e] text-white font-bold py-4 rounded-xl transition"
          >
            Lihat Status Pesanan
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] flex flex-col font-sans selection:bg-[#E07A5F]/30">
      {/* HEADER */}
      <header className="bg-[#121212]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            href="/home"
            className="flex items-center gap-2 text-white/70 hover:text-white transition text-sm font-semibold"
          >
            &larr; Batal & Kembali
          </Link>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold transition-colors ${
                  step >= num ? "bg-[#E07A5F] text-white" : "bg-[#1A1A1A] text-white/40 border border-white/10"
                }`}>
                  {num}
                </div>
                {num < 5 && (
                  <div className={`w-2 sm:w-4 h-[1px] mx-1 sm:mx-1 ${step > num ? "bg-[#E07A5F]" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* FORM CONTENT */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        <div className="bg-[#121212] border border-white/10 rounded-[32px] p-6 sm:p-12 shadow-2xl overflow-hidden relative min-h-[500px]">
          
          <AnimatePresence mode="wait">
            {/* STEP 1: Kendaraan */}
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="mb-8">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#E07A5F] mb-4">
                    <Car className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-white">Data Kendaraan</h2>
                  <p className="text-white/60 text-sm mt-2">Pilih kendaraan yang akan Anda servis.</p>
                </div>
                
                {/* Existing Cars Selector */}
                {myCars.length > 0 && (
                  <div className="mb-6 space-y-3">
                    <label className="block text-xs font-bold text-white/70 uppercase">Pilih Kendaraan Anda</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {myCars.map((car) => (
                        <div 
                          key={car.id}
                          onClick={() => {
                            setData({
                              ...data,
                              vehicleBrand: car.merk,
                              vehicleModel: car.tipe,
                              vehicleYear: car.tahun?.toString() || "",
                              vehiclePlate: car.nomor_polisi
                            });
                          }}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                            data.vehiclePlate === car.nomor_polisi ? "border-[#E07A5F] bg-[#E07A5F]/10" : "border-white/10 hover:border-white/30 bg-[#1A1A1A]"
                          }`}
                        >
                          <div className="font-bold text-white">{car.merk} {car.tipe}</div>
                          <div className="text-sm text-white/50">{car.nomor_polisi}</div>
                        </div>
                      ))}
                      <div 
                        onClick={() => {
                          setData({ ...data, vehicleBrand: "", vehicleModel: "", vehicleYear: "", vehiclePlate: "" });
                        }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center justify-center ${
                          !myCars.some(c => c.nomor_polisi === data.vehiclePlate) ? "border-[#E07A5F] bg-[#E07A5F]/10" : "border-white/10 border-dashed hover:border-white/30"
                        }`}
                      >
                        <span className="font-bold text-white/70 text-sm">+ Kendaraan Lain</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Input Kendaraan */}
                {(!myCars.some(c => c.nomor_polisi === data.vehiclePlate)) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4">
                    <div>
                      <label className="block text-xs font-bold text-white/70 uppercase mb-2">Merek Kendaraan</label>
                      <select
                        value={data.vehicleBrand}
                        onChange={(e) => setData({ ...data, vehicleBrand: e.target.value, vehicleModel: "" })}
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-[#E07A5F] focus:outline-none transition"
                      >
                        <option value="">Pilih Merek</option>
                        {vehicles.map((v) => (
                          <option key={v.brand} value={v.brand}>{v.brand}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/70 uppercase mb-2">Model Kendaraan</label>
                      <select
                        value={data.vehicleModel}
                        onChange={(e) => setData({ ...data, vehicleModel: e.target.value })}
                        disabled={!data.vehicleBrand}
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-[#E07A5F] focus:outline-none transition disabled:opacity-50"
                      >
                        <option value="">Pilih Model</option>
                        {selectedBrandObj?.models.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/70 uppercase mb-2">Tahun Pembuatan</label>
                      <input
                        type="number"
                        placeholder="Contoh: 2020"
                        value={data.vehicleYear}
                        onChange={(e) => setData({ ...data, vehicleYear: e.target.value })}
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-[#E07A5F] focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/70 uppercase mb-2">Plat Nomor</label>
                      <input
                        type="text"
                        placeholder="B 1234 ABC"
                        value={data.vehiclePlate}
                        onChange={(e) => setData({ ...data, vehiclePlate: e.target.value.toUpperCase() })}
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-[#E07A5F] focus:outline-none transition uppercase"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: Cabang */}
            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="mb-8">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#E07A5F] mb-4">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-white">Lokasi Cabang</h2>
                  <p className="text-white/60 text-sm mt-2">Pilih bengkel Auto Craft terdekat dari lokasi Anda.</p>
                </div>

                <div className="space-y-3">
                  {branches.map((b) => (
                    <div 
                      key={b}
                      onClick={() => setData({ ...data, branch: b })}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                        data.branch === b ? "border-[#E07A5F] bg-[#E07A5F]/10" : "border-white/5 bg-[#1A1A1A] hover:border-white/20"
                      }`}
                    >
                      <span className={`font-bold ${data.branch === b ? "text-white" : "text-white/70"}`}>{b}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${data.branch === b ? "border-[#E07A5F]" : "border-white/20"}`}>
                        {data.branch === b && <div className="w-2.5 h-2.5 bg-[#E07A5F] rounded-full" />}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 3: Servis */}
            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="mb-8">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#E07A5F] mb-4">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-white">Jenis Servis</h2>
                  <p className="text-white/60 text-sm mt-2">Pilih satu atau beberapa layanan sekaligus.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {services.map((srv) => {
                    const isSelected = data.selectedServices.includes(srv.id);
                    return (
                      <div 
                        key={srv.id}
                        onClick={() => toggleService(srv.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition flex justify-between items-center ${
                          isSelected ? "border-[#E07A5F] bg-[#E07A5F]/10" : "border-white/5 bg-[#1A1A1A] hover:border-white/20"
                        }`}
                      >
                        <div>
                          <p className={`font-bold text-sm ${isSelected ? "text-white" : "text-white/80"}`}>{srv.name}</p>
                          <p className="text-[#E07A5F] text-xs font-semibold mt-1">Rp {srv.price.toLocaleString("id-ID")}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? "border-[#E07A5F] bg-[#E07A5F]" : "border-white/20"}`}>
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 4: Jadwal */}
            {step === 4 && (
              <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="mb-8">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#E07A5F] mb-4">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-white">Jadwal Kedatangan</h2>
                  <p className="text-white/60 text-sm mt-2">Kapan Anda ingin membawa kendaraan Anda ke bengkel?</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase mb-2">Tanggal</label>
                    <input
                      type="date"
                      value={data.date}
                      onChange={(e) => setData({ ...data, date: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-[#E07A5F] focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase mb-2">Jam</label>
                    <select
                      value={data.time}
                      onChange={(e) => setData({ ...data, time: e.target.value })}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-[#E07A5F] focus:outline-none transition"
                    >
                      <option value="">Pilih Jam</option>
                      <option value="09:00">09:00 WIB (Pagi)</option>
                      <option value="11:00" disabled className="text-white/30">11:00 WIB (Penuh)</option>
                      <option value="14:00">14:00 WIB (Sore)</option>
                      <option value="16:00" disabled className="text-white/30">16:00 WIB (Penuh)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase mb-2 mt-4">Catatan Tambahan (Opsional)</label>
                  <textarea
                    rows={4}
                    value={data.notes}
                    onChange={(e) => setData({ ...data, notes: e.target.value })}
                    placeholder="Contoh: Tolong cek juga suara bising di bagian roda depan kiri."
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#E07A5F] focus:outline-none transition resize-none placeholder:text-white/20"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 5: Konfirmasi */}
            {step === 5 && (
              <motion.div key="step5" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-3xl font-extrabold text-white">Ringkasan Booking</h2>
                  <p className="text-white/60 text-sm mt-2">Pastikan semua data sudah benar sebelum mengonfirmasi.</p>
                </div>

                <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-white/50 text-sm">Kendaraan</span>
                    <span className="font-bold text-white text-right">{data.vehicleBrand} {data.vehicleModel} ({data.vehicleYear}) <br/><span className="text-[#E07A5F]">{data.vehiclePlate}</span></span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-white/50 text-sm">Cabang</span>
                    <span className="font-bold text-white text-right">{data.branch}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-white/50 text-sm">Jadwal</span>
                    <span className="font-bold text-white text-right">{data.date} <br/> {data.time}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-white/50 text-sm block mb-3">Layanan Dipilih:</span>
                    <ul className="space-y-2">
                      {data.selectedServices.map(srvId => {
                        const srv = services.find(s => s.id === srvId);
                        return (
                          <li key={srvId} className="flex justify-between items-center text-sm">
                            <span className="text-white/80">• {srv?.name}</span>
                            <span className="font-bold text-white">Rp {srv?.price.toLocaleString("id-ID")}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                  <div className="mt-6 pt-6 border-t border-dashed border-white/20 flex justify-between items-center">
                    <span className="text-white text-sm font-bold">Total Estimasi</span>
                    <span className="text-2xl font-black text-[#E07A5F]">Rp {totalBiaya.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-6">
            <button
              onClick={handlePrev}
              disabled={step === 1 || isSubmitting}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition ${
                step === 1 ? "opacity-0 pointer-events-none" : "bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Kembali
            </button>

            {step < 5 ? (
              <button
                onClick={handleNext}
                disabled={
                  (step === 1 && (!data.vehicleBrand || !data.vehicleModel || !data.vehicleYear || !data.vehiclePlate)) ||
                  (step === 2 && !data.branch) ||
                  (step === 3 && data.selectedServices.length === 0) ||
                  (step === 4 && (!data.date || !data.time))
                }
                className="flex items-center gap-2 bg-[#E07A5F] hover:bg-[#d0694e] text-white px-8 py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={submitBooking}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-[#E07A5F] hover:bg-[#d0694e] text-white px-8 py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-[#E07A5F]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Mengirim Pesanan..." : "Kirim Pesanan"} <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
