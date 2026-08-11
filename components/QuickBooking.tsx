import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { vehicles, branches, services } from "@/data/dummy";
import { CheckCircle2, X } from "lucide-react";

export default function QuickBooking() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");
  const [branch, setBranch] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [service, setService] = useState("");

  const selectedBrand = vehicles.find((v) => v.brand === brand);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setShowModal(true);
    }, 1500);
  };

  return (
    <section className="relative z-20 mt-10 sm:mt-12 mx-auto max-w-7xl px-4 sm:px-8 mb-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-[#121212] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Quick Booking
          </h2>
          <p className="text-[#E07A5F] text-sm font-semibold mt-1">
            Jadwalkan servis tanpa ribet.
          </p>
        </div>

        <form onSubmit={handleBooking} className="space-y-6">
          {/* Kendaraan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase">
                Merek
              </label>
              <select
                required
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  setModel("");
                }}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition cursor-pointer"
              >
                <option value="">Pilih Merek</option>
                {vehicles.map((v) => (
                  <option key={v.brand} value={v.brand}>
                    {v.brand}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase">
                Model
              </label>
              <select
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={!brand}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition cursor-pointer disabled:opacity-50"
              >
                <option value="">Pilih Model</option>
                {selectedBrand?.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase">
                Tahun
              </label>
              <input
                required
                type="number"
                min="1990"
                max="2026"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2023"
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase">
                Plat Nomor
              </label>
              <input
                required
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder="B 1234 ABC"
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition placeholder:text-white/30 uppercase"
              />
            </div>
          </div>

          {/* Jadwal & Layanan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase">
                Cabang
              </label>
              <select
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition cursor-pointer"
              >
                <option value="">Pilih Cabang</option>
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase">
                Tanggal
              </label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase">
                Jam
              </label>
              <select
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition cursor-pointer"
              >
                <option value="">Pilih Jam</option>
                <option value="09:00">09:00 WIB</option>
                <option value="11:00">11:00 WIB</option>
                <option value="14:00">14:00 WIB</option>
                <option value="16:00">16:00 WIB</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase">
                Jenis Servis
              </label>
              <select
                required
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition cursor-pointer"
              >
                <option value="">Pilih Layanan</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#E07A5F] hover:bg-[#d9a41c] disabled:bg-[#E07A5F]/50 text-black font-extrabold text-sm px-10 py-4 rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              {loading ? "Memproses..." : "Booking Sekarang"}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Success Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1C1C1C] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Booking Berhasil!
              </h3>
              <p className="text-sm text-white/70 mb-6">
                Jadwal servis Anda telah dikonfirmasi. Kami akan menghubungi
                Anda segera.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-[#E07A5F] text-black font-bold py-3 rounded-xl hover:bg-[#d9a41c] transition"
              >
                Tutup
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
