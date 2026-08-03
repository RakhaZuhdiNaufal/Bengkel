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
  
  // State untuk Tambah Pesanan Walk-in
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [walkinUserId, setWalkinUserId] = useState("");
  const [walkinNamaBaru, setWalkinNamaBaru] = useState("");
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const [walkinMerk, setWalkinMerk] = useState("");
  const [walkinTipe, setWalkinTipe] = useState("");
  const [walkinNopol, setWalkinNopol] = useState("");
  const [walkinKeluhan, setWalkinKeluhan] = useState("");
  
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

  const fetchCustomers = async () => {
    const { data } = await supabase.from("users").select("id, nama").eq("role", "customer").order("nama");
    if (data) setCustomers(data);
  };

  const openAddModal = () => {
    fetchCustomers();
    setIsAddModalOpen(true);
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

  const processWalkinCreation = async (userId: string) => {
    // 1. Buat kendaraan baru untuk user ini
    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .insert({
        user_id: userId,
        merk: walkinMerk,
        tipe: walkinTipe,
        nomor_polisi: walkinNopol.toUpperCase(),
        tahun: new Date().getFullYear() // default
      })
      .select("id")
      .single();

    if (vehicleError) {
      alert("Gagal menambahkan kendaraan: " + vehicleError.message);
      setSaving(false);
      return;
    }

    // 2. Buat pesanan dengan status 'diterima' otomatis
    const { error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        vehicle_id: vehicle.id,
        tanggal: new Date().toISOString(),
        jenis_servis: "Servis Walk-in",
        keluhan: walkinKeluhan,
        status: "diterima" // Otomatis diterima
      });

    if (bookingError) {
      alert("Gagal membuat antrean: " + bookingError.message);
      setSaving(false);
      return;
    }

    // 3. Buatkan service record langsung
    const { data: newBooking } = await supabase.from("bookings").select("id").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).single();
    
    if (newBooking) {
      await supabase.from("services").insert({
        booking_id: newBooking.id,
        user_id: userId,
        vehicle_id: vehicle.id,
        keluhan: walkinKeluhan,
        pekerjaan: "Servis Umum (Walk-in)",
        status: "proses"
      });
    }

    setIsAddModalOpen(false);
    setShowAccountPrompt(false);
    setWalkinNamaBaru("");
    setWalkinUserId("");
    setWalkinMerk("");
    setWalkinTipe("");
    setWalkinNopol("");
    setWalkinKeluhan("");
    fetchBookings();
    setSaving(false);
  };

  const handleAddWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walkinUserId && !walkinNamaBaru) {
      alert("Silakan pilih pelanggan terdaftar atau masukkan nama pelanggan baru.");
      return;
    }

    if (walkinNamaBaru && !walkinUserId) {
      // Tampilkan prompt akun jika ini pelanggan baru
      setShowAccountPrompt(true);
      return;
    }

    setSaving(true);
    await processWalkinCreation(walkinUserId);
  };

  const handleLanjutTanpaAkun = async () => {
    setSaving(true);
    
    // Buat dummy akun (guest)
    const dummyEmail = `guest_${Date.now()}@autocraft.com`;
    try {
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: dummyEmail,
          password: "guestpassword123",
          nama: walkinNamaBaru + " (Walk-in)",
          role: "customer"
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      await processWalkinCreation(data.data.id);
    } catch (err: any) {
      alert("Gagal membuat data guest: " + err.message);
      setSaving(false);
    }
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
          <p className="text-white/60 mt-1">Konfirmasi antrean online atau tambahkan walk-in manual.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-5 py-2.5 bg-[#E07A5F] hover:bg-[#d0694e] text-white font-semibold rounded-xl shadow-lg transition-colors inline-flex items-center gap-2"
        >
          <span>+ Pesanan Walk-in</span>
        </button>
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

      {/* Booking List grouped by Date */}
      <div className="space-y-12">
        {loading ? (
          <div className="py-12 text-center text-white/40">Memuat data pesanan...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-12 text-center text-white/40">Tidak ada pesanan ditemukan.</div>
        ) : (
          <>
            {(() => {
               const todayBookings = filteredBookings.filter(b => dayjs(b.tanggal).isSame(dayjs(), 'day'));
               const upcomingBookings = filteredBookings.filter(b => dayjs(b.tanggal).isAfter(dayjs(), 'day'));
               const pastBookings = filteredBookings.filter(b => dayjs(b.tanggal).isBefore(dayjs(), 'day'));
               
               const renderGrid = (bookings: any[]) => (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {bookings.map((booking) => (
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
                   ))}
                 </div>
               );
               
               return (
                 <>
                   {todayBookings.length > 0 && (
                     <div className="space-y-4">
                       <h2 className="text-xl font-bold text-white flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#E07A5F]"></div> Jadwal Hari Ini</h2>
                       {renderGrid(todayBookings)}
                     </div>
                   )}
                   {upcomingBookings.length > 0 && (
                     <div className="space-y-4">
                       <h2 className="text-xl font-bold text-white flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Jadwal Mendatang</h2>
                       {renderGrid(upcomingBookings)}
                     </div>
                   )}
                   {pastBookings.length > 0 && (
                     <div className="space-y-4">
                       <h2 className="text-xl font-bold text-white/60 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white/20"></div> Riwayat Terdahulu</h2>
                       {renderGrid(pastBookings)}
                     </div>
                   )}
                 </>
               );
            })()}
          </>
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

      {/* Modal Walk-in */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 bg-[#1A1A1A]">
                <h2 className="text-xl font-bold text-white">Pesanan Walk-in Baru</h2>
                <p className="text-white/60 text-sm mt-1">Daftarkan kendaraan dan langsung masukkan ke antrean servis.</p>
              </div>
              
              {showAccountPrompt ? (
                <div className="p-6 space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-[#E07A5F]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wrench className="w-8 h-8 text-[#E07A5F]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Buat Akun Pelanggan?</h3>
                    <p className="text-sm text-white/60">
                      Anda memasukkan pelanggan baru <strong>{walkinNamaBaru}</strong>.<br/>
                      Apakah Anda ingin membuatkan akun resmi untuknya agar bisa pesan online ke depannya?
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                    <button 
                      onClick={() => window.location.href = "/users?openAdd=true"}
                      className="w-full py-3 rounded-xl text-sm font-semibold bg-[#E07A5F] hover:bg-[#d0694e] text-white transition-colors"
                    >
                      Ya, Pergi ke Halaman Pengguna
                    </button>
                    <button 
                      onClick={handleLanjutTanpaAkun}
                      disabled={saving}
                      className="w-full py-3 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-50"
                    >
                      {saving ? "Memproses..." : "Tidak, Lanjutkan Tanpa Akun (Guest)"}
                    </button>
                    <button 
                      onClick={() => setShowAccountPrompt(false)}
                      className="w-full py-2 rounded-xl text-xs font-semibold text-white/40 hover:text-white/70 transition-colors"
                    >
                      Kembali Edit Form
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddWalkin} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-4 p-4 bg-black/30 rounded-xl border border-white/5">
                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-2">PILIH PELANGGAN (JIKA SUDAH ADA)</label>
                      <select 
                        value={walkinUserId}
                        onChange={(e) => {
                          setWalkinUserId(e.target.value);
                          if(e.target.value) setWalkinNamaBaru("");
                        }}
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition-colors cursor-pointer"
                      >
                        <option value="">-- Pilih Pelanggan Terdaftar --</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.nama}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="h-px bg-white/10 flex-1"></div>
                      <span className="text-xs text-white/40 font-semibold">ATAU</span>
                      <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-2">NAMA PELANGGAN BARU</label>
                      <input 
                        type="text" placeholder="Masukkan nama pelanggan baru..."
                        value={walkinNamaBaru} 
                        onChange={(e) => {
                          setWalkinNamaBaru(e.target.value);
                          if(e.target.value) setWalkinUserId("");
                        }}
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F]"
                      />
                    </div>
                  </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-2">MERK MOBIL</label>
                    <input 
                      type="text" required placeholder="Misal: Toyota"
                      value={walkinMerk} onChange={(e) => setWalkinMerk(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-2">TIPE MOBIL</label>
                    <input 
                      type="text" required placeholder="Misal: Avanza"
                      value={walkinTipe} onChange={(e) => setWalkinTipe(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">NOMOR POLISI</label>
                  <input 
                    type="text" required placeholder="Misal: B 1234 XYZ"
                    value={walkinNopol} onChange={(e) => setWalkinNopol(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">KELUHAN AWAL</label>
                  <textarea 
                    required placeholder="Catat keluhan pelanggan..." rows={2}
                    value={walkinKeluhan} onChange={(e) => setWalkinKeluhan(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] resize-none"
                  />
                </div>

                  <div className="pt-4 flex gap-3 justify-end border-t border-white/10">
                    <button 
                      type="button" onClick={() => setIsAddModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:bg-white/10"
                    >Batal</button>
                    <button 
                      type="submit" disabled={saving}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#E07A5F] hover:bg-[#d0694e] text-white disabled:opacity-50"
                    >{saving ? "Memproses..." : "Lanjut"}</button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
