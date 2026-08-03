"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { vehicles, branches, services } from "@/data/dummy";
import { CheckCircle2, ChevronRight, ChevronLeft, Wrench, User, Calendar, MapPin, Car, AlertTriangle, Shield, Clock, Copy, CreditCard } from "lucide-react";

interface BookingData {
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  vehiclePlate: string;
  branch: string;
  technician: string;
  selectedServices: string[];
  date: string;
  time: string;
  notes: string;
  paymentMethod: "dp" | "lunas" | "";
  paymentChannel: string;
}

const paymentChannels = {
  bank: [
    { id: "bca", name: "Bank BCA", logo: "/bca.png", va: "8801 0812 7654 3210" },
    { id: "bri", name: "Bank BRI", logo: "/bri.png", va: "1020 0812 9988 7766" },
    { id: "bni", name: "Bank BNI", logo: "/bni.png", va: "9889 0812 4455 6677" },
    { id: "mandiri", name: "Bank Mandiri", logo: "/mandiri.png", va: "8900 1234 5678 9012" },
  ],
  ewallet: [
    { id: "gopay", name: "GoPay", logo: "/gopay.png" },
    { id: "dana", name: "DANA", logo: "/dana.png" },
    { id: "ovo", name: "OVO", logo: "/ovo.png" },
  ],
  qris: [
    { id: "qris", name: "QRIS", logo: "/qris.png" },
  ]
};

const technicians = [
  { id: "any", name: "Siapa Saja (Tersedia Pertama)" },
  { id: "budi", name: "Budi (Master Mechanic)" },
  { id: "ahmad", name: "Ahmad (Engine Specialist)" },
  { id: "reza", name: "Reza (Detailing Expert)" },
];

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentSubStep, setPaymentSubStep] = useState<"scheme" | "channel" | "detail">("scheme");
  const [showWarning, setShowWarning] = useState(false);
  const [warningAccepted, setWarningAccepted] = useState(false);
  const [copied, setCopied] = useState(false);

  const [data, setData] = useState<BookingData>({
    vehicleBrand: "",
    vehicleModel: "",
    vehicleYear: "",
    vehiclePlate: "",
    branch: "",
    technician: "any",
    selectedServices: [],
    date: "",
    time: "",
    notes: "",
    paymentMethod: "",
    paymentChannel: "",
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

  const handleNext = () => setStep((p) => Math.min(p + 1, 7));
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

      // 2. Buat Booking
      const combinedServices = data.selectedServices.map(id => services.find(s => s.id === id)?.name).join(", ");
      
      const { data: booking, error: bErr } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          vehicle_id: vehicleId,
          tanggal: data.date + " " + data.time,
          jenis_servis: combinedServices,
          keluhan: data.notes,
          mekanik: data.technician !== "any" ? technicians.find(t => t.id === data.technician)?.name : null,
          status: "diterima" // Langsung diterima kalau online booking
        })
        .select("id")
        .single();
      if (bErr) throw new Error("Gagal membuat pesanan: " + bErr.message);

      // 3. Buat Service Record
      const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const { data: serviceRec, error: sErr } = await supabase
        .from("services")
        .insert({
          nomor_invoice: invoiceNumber,
          booking_id: booking.id,
          user_id: user.id,
          vehicle_id: vehicleId,
          keluhan: data.notes,
          pekerjaan: combinedServices,
          mekanik: data.technician !== "any" ? technicians.find(t => t.id === data.technician)?.name : null,
          total: computedTotal,
          status: "proses"
        })
        .select("id")
        .single();
      if (sErr) throw new Error("Gagal memasukkan antrean: " + sErr.message);

      // 4. Buat Payment
      const paymentTotal = data.paymentMethod === "dp" ? computedTotal * 0.3 : computedTotal;
      const { error: pErr } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          service_id: serviceRec.id,
          metode: data.paymentMethod === "dp" ? "dp" : "transfer",
          total: paymentTotal,
          status: "pending"
        });
      if (pErr) throw new Error("Gagal membuat tagihan: " + pErr.message);

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
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Booking Berhasil!</h2>
          <p className="text-white/60 mb-8">
            Terima kasih, jadwal servis kendaraan Anda telah dikonfirmasi. Kami telah mengirimkan detailnya ke email Anda.
          </p>
          <button 
            onClick={() => router.push("/riwayat-servis")}
            className="w-full bg-[#E07A5F] hover:bg-[#d0694e] text-white font-bold py-4 rounded-xl transition"
          >
            Lihat Tiket Booking
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
            ← Batal & Kembali
          </Link>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold transition-colors ${
                  step >= num ? "bg-[#E07A5F] text-white" : "bg-[#1A1A1A] text-white/40 border border-white/10"
                }`}>
                  {num}
                </div>
                {num < 7 && (
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

            {/* STEP 3: Teknisi */}
            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="mb-8">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#E07A5F] mb-4">
                    <User className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-white">Pilih Teknisi</h2>
                  <p className="text-white/60 text-sm mt-2">Ingin ditangani oleh mekanik langganan Anda? Pilih di bawah ini.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {technicians.map((t) => (
                    <div 
                      key={t.id}
                      onClick={() => setData({ ...data, technician: t.id })}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col gap-3 ${
                        data.technician === t.id ? "border-[#E07A5F] bg-[#E07A5F]/10" : "border-white/5 bg-[#1A1A1A] hover:border-white/20"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/50">
                          <User className="w-5 h-5" />
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${data.technician === t.id ? "border-[#E07A5F]" : "border-white/20"}`}>
                          {data.technician === t.id && <div className="w-2.5 h-2.5 bg-[#E07A5F] rounded-full" />}
                        </div>
                      </div>
                      <span className={`font-bold ${data.technician === t.id ? "text-white" : "text-white/70"}`}>{t.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: Servis */}
            {step === 4 && (
              <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
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

            {/* STEP 5: Jadwal */}
            {step === 5 && (
              <motion.div key="step5" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
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

            {/* STEP 6: Konfirmasi */}
            {step === 6 && (
              <motion.div key="step6" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
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

            {/* STEP 7: Pembayaran */}
            {step === 7 && (
              <motion.div key="step7" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                
                {/* Sub-step 1: Pilih Skema DP / Lunas */}
                {paymentSubStep === "scheme" && (
                  <>
                    <div className="mb-8">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#E07A5F] mb-4">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-extrabold text-white">Skema Pembayaran</h2>
                      <p className="text-white/60 text-sm mt-2">Pilih skema pembayaran untuk mengamankan jadwal Anda.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div 
                        onClick={() => { setData({ ...data, paymentMethod: "dp" }); }}
                        className={`p-6 rounded-2xl border-2 cursor-pointer transition flex flex-col ${
                          data.paymentMethod === "dp" ? "border-[#E07A5F] bg-[#E07A5F]/10" : "border-white/5 bg-[#1A1A1A] hover:border-white/20"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-bold text-white">Bayar DP 30%</span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${data.paymentMethod === "dp" ? "border-[#E07A5F]" : "border-white/20"}`}>
                            {data.paymentMethod === "dp" && <div className="w-2.5 h-2.5 bg-[#E07A5F] rounded-full" />}
                          </div>
                        </div>
                        <span className="text-2xl font-black text-[#E07A5F]">Rp {(totalBiaya * 0.3).toLocaleString("id-ID")}</span>
                        <p className="text-xs text-white/50 mt-2">Sisa pembayaran Rp {(totalBiaya * 0.7).toLocaleString("id-ID")} dibayarkan di bengkel setelah servis selesai.</p>
                      </div>
                      <div 
                        onClick={() => { setData({ ...data, paymentMethod: "lunas" }); }}
                        className={`p-6 rounded-2xl border-2 cursor-pointer transition flex flex-col ${
                          data.paymentMethod === "lunas" ? "border-[#E07A5F] bg-[#E07A5F]/10" : "border-white/5 bg-[#1A1A1A] hover:border-white/20"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-bold text-white">Bayar Lunas (100%)</span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${data.paymentMethod === "lunas" ? "border-[#E07A5F]" : "border-white/20"}`}>
                            {data.paymentMethod === "lunas" && <div className="w-2.5 h-2.5 bg-[#E07A5F] rounded-full" />}
                          </div>
                        </div>
                        <span className="text-2xl font-black text-[#E07A5F]">Rp {totalBiaya.toLocaleString("id-ID")}</span>
                        <p className="text-xs text-white/50 mt-2">Dapatkan ekstra <span className="text-green-400 font-bold">+500 Poin Loyalitas</span> jika membayar lunas di depan.</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Sub-step 2: Pilih Channel Pembayaran */}
                {paymentSubStep === "channel" && (
                  <>
                    <div className="mb-6">
                      <button onClick={() => setPaymentSubStep("scheme")} className="text-white/50 hover:text-white text-sm mb-4 flex items-center gap-1 transition"><ChevronLeft className="w-4 h-4" /> Ubah Skema</button>
                      <h2 className="text-3xl font-extrabold text-white">Metode Pembayaran</h2>
                      <p className="text-white/60 text-sm mt-2">Pilih metode pembayaran yang Anda inginkan.</p>
                      <div className="mt-3 bg-[#E07A5F]/10 border border-[#E07A5F]/30 rounded-xl px-4 py-3 flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-[#E07A5F] shrink-0" />
                        <span className="text-sm text-white">Total yang harus dibayar: <span className="font-black text-[#E07A5F]">Rp {(data.paymentMethod === "dp" ? totalBiaya * 0.3 : totalBiaya).toLocaleString("id-ID")}</span></span>
                      </div>
                    </div>

                    {/* Bank Transfer */}
                    <div>
                      <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Transfer Bank</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {paymentChannels.bank.map((ch) => (
                          <div
                            key={ch.id}
                            onClick={() => setData({ ...data, paymentChannel: ch.id })}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col items-center gap-3 ${
                              data.paymentChannel === ch.id ? "border-[#E07A5F] bg-[#E07A5F]/10" : "border-white/10 bg-[#1A1A1A] hover:border-white/30"
                            }`}
                          >
                            <div className="w-full h-10 relative flex items-center justify-center">
                              <Image src={ch.logo} alt={ch.name} width={80} height={40} className="object-contain" />
                            </div>
                            <span className="text-xs font-bold text-white/70">{ch.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* E-Wallet */}
                    <div>
                      <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">E-Wallet</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {paymentChannels.ewallet.map((ch) => (
                          <div
                            key={ch.id}
                            onClick={() => setData({ ...data, paymentChannel: ch.id })}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col items-center gap-3 ${
                              data.paymentChannel === ch.id ? "border-[#E07A5F] bg-[#E07A5F]/10" : "border-white/10 bg-[#1A1A1A] hover:border-white/30"
                            }`}
                          >
                            <div className="w-full h-10 relative flex items-center justify-center">
                              <Image src={ch.logo} alt={ch.name} width={80} height={40} className="object-contain" />
                            </div>
                            <span className="text-xs font-bold text-white/70">{ch.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* QRIS */}
                    <div>
                      <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">QRIS (Semua Aplikasi)</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {paymentChannels.qris.map((ch) => (
                          <div
                            key={ch.id}
                            onClick={() => setData({ ...data, paymentChannel: ch.id })}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col items-center gap-3 ${
                              data.paymentChannel === ch.id ? "border-[#E07A5F] bg-[#E07A5F]/10" : "border-white/10 bg-[#1A1A1A] hover:border-white/30"
                            }`}
                          >
                            <div className="w-full h-10 relative flex items-center justify-center">
                              <Image src={ch.logo} alt={ch.name} width={80} height={40} className="object-contain" />
                            </div>
                            <span className="text-xs font-bold text-white/70">{ch.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Sub-step 3: Detail Pembayaran */}
                {paymentSubStep === "detail" && (
                  <>
                    <div className="mb-6">
                      <button onClick={() => setPaymentSubStep("channel")} className="text-white/50 hover:text-white text-sm mb-4 flex items-center gap-1 transition"><ChevronLeft className="w-4 h-4" /> Ubah Metode</button>
                      <h2 className="text-3xl font-extrabold text-white">Detail Pembayaran</h2>
                      <p className="text-white/60 text-sm mt-2">Selesaikan pembayaran Anda dalam waktu <span className="text-[#E07A5F] font-bold">24 jam</span>.</p>
                    </div>

                    {/* Timer Bar */}
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-500 shrink-0" />
                      <div className="flex-1">
                        <p className="text-yellow-500 font-bold text-sm">Batas waktu pembayaran</p>
                        <p className="text-yellow-500/70 text-xs">Selesaikan sebelum {new Date(Date.now() + 86400000).toLocaleString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB</p>
                      </div>
                    </div>

                    {/* Bank Transfer Detail */}
                    {["bca", "bri", "bni", "mandiri"].includes(data.paymentChannel) && (() => {
                      const bank = paymentChannels.bank.find(b => b.id === data.paymentChannel)!;
                      const payAmount = data.paymentMethod === "dp" ? totalBiaya * 0.3 : totalBiaya;
                      return (
                        <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden">
                          {/* Header */}
                          <div className="p-5 border-b border-white/5 flex items-center gap-4">
                            <div className="w-16 h-10 relative flex items-center justify-center bg-white rounded-lg p-1">
                              <Image src={bank.logo} alt={bank.name} width={60} height={30} className="object-contain" />
                            </div>
                            <div>
                              <p className="font-bold text-white">{bank.name}</p>
                              <p className="text-xs text-white/50">Virtual Account</p>
                            </div>
                          </div>
                          {/* VA Number */}
                          <div className="p-5 border-b border-white/5">
                            <p className="text-xs text-white/50 uppercase tracking-wider font-bold mb-2">Nomor Virtual Account</p>
                            <div className="flex items-center justify-between bg-black/40 rounded-xl px-4 py-3">
                              <span className="text-xl font-mono font-black text-white tracking-widest">{bank.va}</span>
                              <button
                                onClick={() => { navigator.clipboard.writeText(bank.va.replace(/\s/g, "")); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                className="flex items-center gap-1 text-[#E07A5F] hover:text-[#d0694e] text-xs font-bold transition"
                              >
                                <Copy className="w-4 h-4" /> {copied ? "Tersalin!" : "Salin"}
                              </button>
                            </div>
                          </div>
                          {/* Amount */}
                          <div className="p-5 border-b border-white/5">
                            <p className="text-xs text-white/50 uppercase tracking-wider font-bold mb-2">Total Pembayaran</p>
                            <div className="flex items-center justify-between">
                              <span className="text-3xl font-black text-[#E07A5F]">Rp {payAmount.toLocaleString("id-ID")}</span>
                              <span className="text-xs bg-[#E07A5F]/10 text-[#E07A5F] font-bold px-3 py-1 rounded-full">{data.paymentMethod === "dp" ? "DP 30%" : "Lunas"}</span>
                            </div>
                            <p className="text-xs text-white/40 mt-2">Transfer tepat hingga 3 digit terakhir agar pembayaran terverifikasi otomatis.</p>
                          </div>
                          {/* Instructions */}
                          <div className="p-5">
                            <p className="text-xs text-white/50 uppercase tracking-wider font-bold mb-3">Cara Pembayaran</p>
                            <ol className="space-y-2 text-sm text-white/70">
                              <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">1</span> Buka aplikasi {bank.name} atau ATM terdekat</li>
                              <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">2</span> Pilih menu Transfer → Virtual Account</li>
                              <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">3</span> Masukkan nomor VA: <span className="font-mono font-bold text-white">{bank.va}</span></li>
                              <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">4</span> Konfirmasi nama <span className="font-bold text-white">Auto Craft Indonesia</span> dan nominal</li>
                              <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">5</span> Selesaikan pembayaran dan simpan bukti transfer</li>
                            </ol>
                          </div>
                        </div>
                      );
                    })()}

                    {/* E-Wallet Detail */}
                    {["gopay", "dana", "ovo"].includes(data.paymentChannel) && (() => {
                      const ew = paymentChannels.ewallet.find(e => e.id === data.paymentChannel)!;
                      const payAmount = data.paymentMethod === "dp" ? totalBiaya * 0.3 : totalBiaya;
                      return (
                        <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden">
                          <div className="p-5 border-b border-white/5 flex items-center gap-4">
                            <div className="w-16 h-10 relative flex items-center justify-center bg-white rounded-lg p-1">
                              <Image src={ew.logo} alt={ew.name} width={60} height={30} className="object-contain" />
                            </div>
                            <div>
                              <p className="font-bold text-white">{ew.name}</p>
                              <p className="text-xs text-white/50">E-Wallet Payment</p>
                            </div>
                          </div>
                          <div className="p-5 border-b border-white/5">
                            <p className="text-xs text-white/50 uppercase tracking-wider font-bold mb-2">Nomor {ew.name} Anda</p>
                            <input
                              type="tel"
                              placeholder="Contoh: 0812xxxxxxxx"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-[#E07A5F] focus:outline-none transition font-mono"
                            />
                            <p className="text-xs text-white/30 mt-2">Masukkan nomor telepon yang terdaftar di {ew.name}</p>
                          </div>
                          <div className="p-5 border-b border-white/5">
                            <p className="text-xs text-white/50 uppercase tracking-wider font-bold mb-2">Total Pembayaran</p>
                            <div className="flex items-center justify-between">
                              <span className="text-3xl font-black text-[#E07A5F]">Rp {payAmount.toLocaleString("id-ID")}</span>
                              <span className="text-xs bg-[#E07A5F]/10 text-[#E07A5F] font-bold px-3 py-1 rounded-full">{data.paymentMethod === "dp" ? "DP 30%" : "Lunas"}</span>
                            </div>
                          </div>
                          <div className="p-5">
                            <p className="text-xs text-white/50 uppercase tracking-wider font-bold mb-3">Cara Pembayaran</p>
                            <ol className="space-y-2 text-sm text-white/70">
                              <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">1</span> Masukkan nomor {ew.name} Anda di atas</li>
                              <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">2</span> Klik "Konfirmasi & Bayar" di bawah</li>
                              <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">3</span> Buka notifikasi di aplikasi {ew.name}</li>
                              <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">4</span> Konfirmasi pembayaran dengan PIN {ew.name}</li>
                            </ol>
                          </div>
                        </div>
                      );
                    })()}

                    {/* QRIS Detail */}
                    {data.paymentChannel === "qris" && (() => {
                      const payAmount = data.paymentMethod === "dp" ? totalBiaya * 0.3 : totalBiaya;
                      return (
                        <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden">
                          <div className="p-5 border-b border-white/5 flex items-center gap-4">
                            <div className="w-16 h-10 relative flex items-center justify-center bg-white rounded-lg p-1">
                              <Image src="/qris.png" alt="QRIS" width={60} height={30} className="object-contain" />
                            </div>
                            <div>
                              <p className="font-bold text-white">QRIS</p>
                              <p className="text-xs text-white/50">Scan & Pay — Semua Aplikasi</p>
                            </div>
                          </div>
                          <div className="p-6 flex flex-col items-center border-b border-white/5">
                            <div className="bg-white rounded-2xl p-4 mb-4">
                              {/* Fake QR Code Grid */}
                              <div className="w-48 h-48 grid grid-cols-8 grid-rows-8 gap-[2px]">
                                {Array.from({ length: 64 }).map((_, i) => (
                                  <div key={i} className={`rounded-[1px] ${Math.random() > 0.45 ? 'bg-black' : 'bg-white'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-white/50 text-center">Scan kode QR di atas menggunakan aplikasi<br />GoPay, DANA, OVO, atau aplikasi bank Anda</p>
                          </div>
                          <div className="p-5">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-white/50 uppercase tracking-wider font-bold">Total Pembayaran</p>
                                <span className="text-3xl font-black text-[#E07A5F]">Rp {payAmount.toLocaleString("id-ID")}</span>
                              </div>
                              <span className="text-xs bg-[#E07A5F]/10 text-[#E07A5F] font-bold px-3 py-1 rounded-full">{data.paymentMethod === "dp" ? "DP 30%" : "Lunas"}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Security Badge */}
                    <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-3">
                      <Shield className="w-5 h-5 text-green-500 shrink-0" />
                      <p className="text-xs text-green-500/80">Transaksi Anda dilindungi enkripsi SSL 256-bit. Data pembayaran tidak disimpan di server kami.</p>
                    </div>
                  </>
                )}

                {/* Warning Modal */}
                <AnimatePresence>
                  {showWarning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
                      onClick={() => setShowWarning(false)}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#1A1A1A] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                      >
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <AlertTriangle className="w-8 h-8 text-yellow-500" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-white text-center mb-3">Konfirmasi Pembayaran</h3>
                        <div className="space-y-3 mb-6">
                          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                            <p className="text-red-400 text-sm font-semibold flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                              Uang yang sudah ditransfer <span className="font-black">TIDAK DAPAT</span> dikembalikan (non-refundable).
                            </p>
                          </div>
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                            <p className="text-blue-400 text-sm flex items-start gap-2">
                              <Car className="w-4 h-4 mt-0.5 shrink-0" />
                              Setelah pembayaran dikonfirmasi, data kendaraan Anda akan <span className="font-bold">langsung masuk ke tahap antrean servis</span>.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowWarning(false)}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition text-sm border border-white/10"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => { setShowWarning(false); setWarningAccepted(true); submitBooking(); }}
                            disabled={isSubmitting}
                            className="flex-1 bg-[#E07A5F] hover:bg-[#d0694e] text-white font-bold py-3 rounded-xl transition text-sm shadow-lg shadow-[#E07A5F]/20 disabled:opacity-50"
                          >
                            {isSubmitting ? "Memproses..." : "Ya, Saya Mengerti"}
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
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

            {step < 7 ? (
              <button
                onClick={handleNext}
                disabled={
                  (step === 1 && (!data.vehicleBrand || !data.vehicleModel || !data.vehicleYear || !data.vehiclePlate)) ||
                  (step === 2 && !data.branch) ||
                  (step === 3 && !data.technician) ||
                  (step === 4 && data.selectedServices.length === 0) ||
                  (step === 5 && (!data.date || !data.time))
                }
                className="flex items-center gap-2 bg-[#E07A5F] hover:bg-[#d0694e] text-white px-8 py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                {paymentSubStep === "scheme" && (
                  <button
                    onClick={() => setPaymentSubStep("channel")}
                    disabled={!data.paymentMethod}
                    className="flex items-center gap-2 bg-[#E07A5F] hover:bg-[#d0694e] text-white px-8 py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Pilih Metode Pembayaran <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                {paymentSubStep === "channel" && (
                  <button
                    onClick={() => setPaymentSubStep("detail")}
                    disabled={!data.paymentChannel}
                    className="flex items-center gap-2 bg-[#E07A5F] hover:bg-[#d0694e] text-white px-8 py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Lanjutkan <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                {paymentSubStep === "detail" && (
                  <button
                    onClick={() => setShowWarning(true)}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-[#E07A5F] hover:bg-[#d0694e] text-white px-8 py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-[#E07A5F]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Memproses..." : "Konfirmasi & Bayar"}
                  </button>
                )}
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
