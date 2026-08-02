"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, CheckCircle, XCircle, Wrench, Search } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

type Booking = {
  id: string;
  tanggal: string;
  jenis_servis: string;
  keluhan: string;
  mekanik: string;
  status: string;
  catatan: string;
  created_at: string;
  users: { nama: string; nomor_hp: string; nomor_pelanggan: string };
  vehicles: { merk: string; tipe: string; nomor_polisi: string };
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("menunggu");
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  
  const [newStatus, setNewStatus] = useState("");
  const [newMekanik, setNewMekanik] = useState("");
  const [newCatatan, setNewCatatan] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        users (nama, nomor_hp, nomor_pelanggan),
        vehicles (merk, tipe, nomor_polisi)
      `)
      .order("tanggal", { ascending: true });

    if (data) setBookings(data as any);
    setLoading(false);
  };

  const filteredBookings = bookings.filter((b) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      b.users?.nama?.toLowerCase().includes(searchLower) || 
      b.vehicles?.nomor_polisi?.toLowerCase().includes(searchLower) ||
      b.id.toLowerCase().includes(searchLower);
      
    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const openProcessModal = (booking: Booking, targetStatus: string) => {
    setSelectedBooking(booking);
    setNewStatus(targetStatus);
    setNewMekanik(booking.mekanik || "");
    setNewCatatan(booking.catatan || "");
    setIsProcessModalOpen(true);
  };

  const handleProcessBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setSaving(true);
    
    // Update booking status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ 
        status: newStatus,
        mekanik: newMekanik,
        catatan: newCatatan
      })
      .eq("id", selectedBooking.id);
      
    if (updateError) {
      alert("Gagal memproses pesanan: " + updateError.message);
      setSaving(false);
      return;
    }

    // Jika status diubah menjadi "diterima", buatkan record kosong di tabel `services` otomatis!
    if (newStatus === "diterima") {
      const { error: serviceError } = await supabase
        .from("services")
        .insert({
          booking_id: selectedBooking.id,
          user_id: (selectedBooking as any).user_id,
          vehicle_id: (selectedBooking as any).vehicle_id,
          mekanik: newMekanik,
          keluhan: selectedBooking.keluhan,
          pekerjaan: selectedBooking.jenis_servis,
          status: "proses"
        });
        
      if (serviceError) {
        alert("Pesanan diterima, tapi gagal membuat antrean servis: " + serviceError.message);
      }
    }
    
    setIsProcessModalOpen(false);
    fetchBookings();
    setSaving(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Pesanan (Booking)</h1>
          <p className="text-white/60 mt-1">Konfirmasi atau tolak jadwal servis dari pelanggan.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-[#1A1A1A] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input 
            type="text" 
            placeholder="Cari nama, nomor polisi, atau ID pesanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition-colors"
          />
        </div>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition-colors cursor-pointer"
        >
          <option value="all">Semua Status</option>
          <option value="menunggu">Menunggu Konfirmasi</option>
          <option value="diterima">Diterima</option>
          <option value="ditolak">Ditolak</option>
          <option value="selesai">Selesai</option>
        </select>
      </div>

      {/* Booking Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-white/40">Memuat data pesanan...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="col-span-full py-12 text-center text-white/40">Tidak ada pesanan ditemukan.</div>
        ) : (
          filteredBookings.map((booking) => (
            <motion.div 
              key={booking.id}
              layout
              className="bg-[#1A1A1A] border border-white/10 p-6 rounded-2xl hover:border-white/20 transition-all flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    booking.status === 'diterima' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    booking.status === 'ditolak' || booking.status === 'dibatalkan' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    booking.status === 'menunggu' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[#E07A5F] font-bold text-sm">
                    {dayjs(booking.tanggal).format("DD MMM YYYY")}
                  </div>
                  <div className="text-white/60 text-xs">
                    Pukul {dayjs(booking.tanggal).format("HH:mm")}
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="font-semibold text-lg text-white">{booking.users?.nama || "Pelanggan"}</h3>
                  <p className="text-sm text-white/60">{booking.users?.nomor_hp || "-"}</p>
                </div>
                
                <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                  <div className="text-xs text-white/40 mb-1">KENDARAAN</div>
                  <div className="font-medium text-white">{booking.vehicles?.merk} {booking.vehicles?.tipe}</div>
                  <div className="text-sm text-white/70 font-mono mt-0.5 uppercase">{booking.vehicles?.nomor_polisi}</div>
                </div>

                <div>
                  <div className="text-xs text-white/40 mb-1">KELUHAN / PERMINTAAN</div>
                  <p className="text-sm text-white/80 line-clamp-2">{booking.keluhan || booking.jenis_servis || "-"}</p>
                </div>
              </div>

              {booking.status === 'menunggu' && (
                <div className="mt-6 flex gap-3 border-t border-white/10 pt-4">
                  <button 
                    onClick={() => openProcessModal(booking, 'ditolak')}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Tolak
                  </button>
                  <button 
                    onClick={() => openProcessModal(booking, 'diterima')}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Terima
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Modal Proses (Terima / Tolak) */}
      <AnimatePresence>
        {isProcessModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsProcessModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className={`p-6 border-b border-white/10 ${newStatus === 'diterima' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <h2 className={`text-xl font-bold ${newStatus === 'diterima' ? 'text-green-400' : 'text-red-400'}`}>
                  {newStatus === 'diterima' ? 'Terima Pesanan?' : 'Tolak Pesanan?'}
                </h2>
                <p className="text-white/60 text-sm mt-1">
                  Atas nama {selectedBooking.users?.nama} ({selectedBooking.vehicles?.nomor_polisi})
                </p>
              </div>
              
              <form onSubmit={handleProcessBooking} className="p-6 space-y-4">
                {newStatus === 'diterima' && (
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-2 uppercase">
                      Tugaskan Mekanik
                    </label>
                    <input 
                      type="text"
                      placeholder="Nama mekanik (Bisa diisi nanti)"
                      value={newMekanik}
                      onChange={(e) => setNewMekanik(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2 uppercase">
                    Catatan untuk Pelanggan (Opsional)
                  </label>
                  <textarea 
                    placeholder={newStatus === 'diterima' ? "Contoh: Silakan datang tepat waktu..." : "Alasan penolakan..."}
                    value={newCatatan}
                    onChange={(e) => setNewCatatan(e.target.value)}
                    rows={3}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-3 justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsProcessModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
                      newStatus === 'diterima' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'
                    }`}
                  >
                    {saving ? "Memproses..." : "Konfirmasi"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
