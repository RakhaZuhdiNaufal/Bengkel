"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Car,
  CreditCard,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Save,
  Settings,
  Trash2,
  Edit2,
  X,
  Download,
  Wrench,
  Award,
  User,
  MapPin
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { downloadInvoicePdf } from "@/lib/pdf";
import dayjs from "dayjs";
import type {
  Booking,
  BookingStatus,
  Payment,
  ServiceRecord,
  Vehicle,
} from "@/lib/types/database";

type MainTab = "dashboard" | "profil" | "pembayaran";

const emptyVehicle = {
  merk: "",
  tipe: "",
  tahun: new Date().getFullYear(),
  nomor_polisi: "",
  warna: "",
};

export default function AkunPage() {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  // Tabs & Navigation
  const [mainTab, setMainTab] = useState<MainTab>("dashboard");
  const [subTab, setSubTab] = useState("Menunggu");
  const subTabs = ["Menunggu", "Di Bengkel", "Proses", "Terjadwal", "Selesai", "Batal"];

  // Form State
  const [phone, setPhone] = useState("");
  const [editingPhone, setEditingPhone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Data State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [historyCards, setHistoryCards] = useState<any[]>([]);

  // Modals
  const [vehicleModal, setVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle);

  const [bookingModal, setBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookingForm, setBookingForm] = useState({
    vehicle_id: "",
    tanggal: "",
    jenis_servis: "",
    keluhan: "",
  });

  const [serviceDetail, setServiceDetail] = useState<ServiceRecord | null>(null);

  // New UI Modals
  const [popup, setPopup] = useState<{show: boolean, type: 'success' | 'error', message: string, reloadOnClose?: boolean}>({ show: false, type: 'success', message: '' });
  const [paymentModal, setPaymentModal] = useState<{show: boolean, paymentId: string | null, total: number}>({show: false, paymentId: null, total: 0});
  const [selectedMethod, setSelectedMethod] = useState("");
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/akun");
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) setPhone(profile.nomor_hp ?? "");
  }, [profile]);

  const loadAll = useCallback(async () => {
    if (!user) return;
    const [v, s, p, b, allProses] = await Promise.all([
      supabase.from("vehicles").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("services").select("*, vehicles(id,merk,tipe,nomor_polisi,warna,tahun)").eq("user_id", user.id).order("tanggal", { ascending: false }),
      supabase.from("payments").select("*, services(id,nomor_invoice,tanggal,pekerjaan)").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("bookings").select("*, vehicles(*), services(*), payments(*)").eq("user_id", user.id).order("tanggal", { ascending: false }),
      supabase.from("services").select("id, bookings(tanggal)").eq("status", "proses").order("created_at", { ascending: true })
    ]);
    
    setVehicles((v.data as Vehicle[]) ?? []);
    setServices((s.data as ServiceRecord[]) ?? []);
    setPayments((p.data as Payment[]) ?? []);
    
    const bookingsData = b.data as any[] || [];
    setBookings(bookingsData);

    const activeQueueIds = (allProses.data || [])
      .filter((s: any) => !s.bookings?.tanggal || dayjs(s.bookings.tanggal).isBefore(dayjs().endOf('day')))
      .map((s: any) => s.id);

    const mapped = bookingsData.map((b: any) => {
      const srv = b.services && b.services.length > 0 ? b.services[0] : null;
      let statusLabel = "Menunggu";
      let progress = 0;
      
      if (srv) {
        if (srv.status === 'selesai') { statusLabel = "Selesai"; progress = 100; } 
        else if (srv.status === 'dibatalkan') { statusLabel = "Batal"; progress = 0; } 
        else if (srv.status === 'menunggu') { statusLabel = "Di Bengkel (Menunggu Antrean)"; progress = 30; } 
        else if (srv.status === 'proses') {
          if (dayjs(b.tanggal).isAfter(dayjs().endOf('day'))) {
            statusLabel = "Terjadwal"; progress = 20;
          } else {
            const index = activeQueueIds.indexOf(srv.id);
            if (index !== -1 && index < 4) { statusLabel = "Proses"; progress = 50; } 
            else if (index >= 4) { statusLabel = `Menunggu Antrean (Ke-${index - 3})`; progress = 0; } 
            else { statusLabel = "Proses"; progress = 50; }
          }
        }
      } else {
        if (b.status === 'batal' || b.status === 'dibatalkan') { statusLabel = "Batal"; } 
        else if (b.status === 'checked_in') { statusLabel = "Di Bengkel (Menunggu Antrean)"; progress = 30; } 
        else if (b.status === 'diterima') { statusLabel = "Menunggu Kedatangan"; progress = 10; } 
        else if (b.status === 'menunggu') { statusLabel = "Menunggu Konfirmasi"; progress = 5; } 
        else if (b.status === 'ditolak') { statusLabel = "Ditolak"; }
      }

      const dateObj = new Date(b.tanggal);
      const formattedDate = dateObj.toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' });
      const serviceList = (srv?.pekerjaan || b.jenis_servis || "Servis Umum").split(",").map((x: string) => x.trim()).filter((x: string) => x);
      const depositPayment = b.payments?.find((p: any) => p.metode === 'dp' && p.status === 'pending');

      return {
        rawBookingId: b.id,
        rawServiceId: srv?.id,
        id: srv?.nomor_invoice || `BKG-${b.id.substring(0,8).toUpperCase()}`,
        status: statusLabel,
        car: b.vehicles ? `${b.vehicles.merk} ${b.vehicles.tipe}` : "Kendaraan Dihapus",
        plate: b.vehicles?.nomor_polisi || "-",
        date: formattedDate,
        services: serviceList.length > 0 ? serviceList : ["Servis Umum"],
        total: srv?.total || b.estimasi_total || 0,
        branch: "Auto Craft Pusat",
        progress,
        depositPayment
      };
    });
    setHistoryCards(mapped);
  }, [supabase, user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`customer-data:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "vehicles", filter: `user_id=eq.${user.id}` }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `user_id=eq.${user.id}` }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "services", filter: `user_id=eq.${user.id}` }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "payments", filter: `user_id=eq.${user.id}` }, () => loadAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, supabase, loadAll]);

  // Actions
  const savePhone = async () => {
    if (!user) return;
    setSaving(true); setError(""); setMessage("");
    const { error: err } = await supabase.from("users").update({ nomor_hp: phone }).eq("id", user.id);
    setSaving(false);
    if (err) return setError(err.message);
    setMessage("Nomor telepon berhasil disimpan.");
    setEditingPhone(false);
  };

  const openVehicleModal = (v?: Vehicle) => {
    if (v) {
      setEditingVehicle(v);
      setVehicleForm({ merk: v.merk, tipe: v.tipe, tahun: v.tahun, nomor_polisi: v.nomor_polisi, warna: v.warna });
    } else {
      setEditingVehicle(null);
      setVehicleForm(emptyVehicle);
    }
    setVehicleModal(true);
  };

  const saveVehicle = async () => {
    if (!user) return;
    setSaving(true); setError("");
    if (editingVehicle) {
      const { error: err } = await supabase.from("vehicles").update(vehicleForm).eq("id", editingVehicle.id);
      if (err) setError(err.message);
    } else {
      const { error: err } = await supabase.from("vehicles").insert({ ...vehicleForm, user_id: user.id });
      if (err) setError(err.message);
    }
    setSaving(false); setVehicleModal(false); await loadAll();
  };

  const deleteVehicle = async (id: string) => {
    if (!confirm("Hapus kendaraan ini?")) return;
    const { error: err } = await supabase.from("vehicles").delete().eq("id", id);
    if (err) setError(err.message);
    await loadAll();
  };

  const openBookingModal = (b?: Booking) => {
    if (b) {
      setEditingBooking(b);
      setBookingForm({ vehicle_id: b.vehicle_id, tanggal: b.tanggal.slice(0, 16), jenis_servis: b.jenis_servis ?? "", keluhan: b.keluhan ?? "" });
    } else {
      setEditingBooking(null);
      setBookingForm({ vehicle_id: vehicles[0]?.id ?? "", tanggal: "", jenis_servis: "", keluhan: "" });
    }
    setBookingModal(true);
  };

  const saveBooking = async () => {
    if (!user) return;
    setSaving(true); setError("");
    const payload = { vehicle_id: bookingForm.vehicle_id, tanggal: new Date(bookingForm.tanggal).toISOString(), jenis_servis: bookingForm.jenis_servis, keluhan: bookingForm.keluhan };
    if (editingBooking) {
      const { error: err } = await supabase.from("bookings").update(payload).eq("id", editingBooking.id);
      if (err) setError(err.message);
    } else {
      const { error: err } = await supabase.from("bookings").insert({ ...payload, user_id: user.id, status: "menunggu" });
      if (err) setError(err.message);
    }
    setSaving(false); setBookingModal(false); await loadAll();
  };

  const handleCancelBooking = async (bookingId: string, serviceId?: string) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;
    setIsCancelling(bookingId);
    try {
      const res = await fetch("/api/booking/cancel", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId, service_id: serviceId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membatalkan pesanan");
      setPopup({ show: true, type: 'success', message: 'Pesanan berhasil dibatalkan.' });
      loadAll();
    } catch (err: any) {
      setPopup({ show: true, type: 'error', message: err.message });
    } finally {
      setIsCancelling(null);
    }
  };

  const handlePayDeposit = async (paymentId: string) => {
    setIsPaying(paymentId);
    try {
      const { error } = await supabase.from('payments').update({ status: 'lunas' }).eq('id', paymentId);
      if (error) throw new Error(error.message);
      setPopup({ show: true, type: 'success', message: 'Pembayaran deposit berhasil disimulasikan!' });
      loadAll();
    } catch (err: any) {
      setPopup({ show: true, type: 'error', message: err.message });
    } finally {
      setIsPaying(null);
    }
  };

  const downloadPaymentInvoice = async (payment: Payment) => {
    const { data: service } = await supabase.from("services").select("*, vehicles(*), users:user_id(nama,nomor_pelanggan,email,nomor_hp)").eq("id", payment.service_id).maybeSingle();
    if (!service) return setError("Data servis tidak ditemukan.");
    downloadInvoicePdf({ service: service as ServiceRecord, payment, customer: profile, vehicle: (service as ServiceRecord).vehicles });
  };

  const filteredHistory = historyCards.filter(h => {
    if (subTab === "Menunggu") return h.status.includes("Menunggu") || h.status === "Menunggu Kedatangan";
    if (subTab === "Di Bengkel") return h.status.includes("Di Bengkel");
    return h.status === subTab;
  });

  if (loading || !user) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center text-white/60">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#E07A5F] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold">{loading ? "Memuat profil..." : "Mengarahkan ke halaman login..."}</p>
        </div>
      </div>
    );
  }

  const activeProfile = profile || {
    id: user.id, nama: user.user_metadata?.full_name || user.email?.split("@")[0] || "Pengguna", email: user.email || "",
    nomor_hp: phone || "", role: "customer", foto: null, status: "aktif", nomor_pelanggan: "AC-00100", created_at: new Date().toISOString()
  };

  return (
    <div className="min-h-screen bg-black text-[#F4F1DE] flex flex-col font-sans relative">
      {/* Popups & Modals */}
      {popup.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1A1A1A] border border-white/10 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${popup.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {popup.type === 'success' ? <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{popup.type === 'success' ? 'Berhasil!' : 'Terjadi Kesalahan'}</h3>
            <p className="text-white/60 mb-6">{popup.message}</p>
            <button onClick={() => { if (popup.reloadOnClose) window.location.reload(); else setPopup({ ...popup, show: false }); }} className="w-full py-3 bg-[#E07A5F] hover:bg-[#d0694e] text-white font-bold rounded-xl transition">Tutup</button>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {paymentModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-[#1A1A1A] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Pembayaran Deposit</h3>
                <button onClick={() => { setPaymentModal({ show: false, paymentId: null, total: 0 }); setSelectedMethod(""); }} className="text-white/40 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6">
                <div className="mb-6 p-4 bg-black/40 rounded-2xl text-center border border-white/5">
                  <p className="text-white/60 text-sm mb-1">Total Pembayaran</p>
                  <p className="text-3xl font-black text-[#E07A5F]">Rp {paymentModal.total.toLocaleString("id-ID")}</p>
                </div>
                <h4 className="text-white font-semibold mb-3">Pilih Metode Pembayaran</h4>
                <div className="space-y-3 mb-8">
                  {[{ id: "bca", name: "BCA Virtual Account", icon: "🏦" }, { id: "mandiri", name: "Mandiri Virtual Account", icon: "🏦" }, { id: "qris", name: "QRIS (GoPay, OVO, Dana)", icon: "📱" }].map(method => (
                    <button key={method.id} onClick={() => setSelectedMethod(method.id)} className={`w-full flex items-center p-4 rounded-2xl border transition-all ${selectedMethod === method.id ? 'border-[#E07A5F] bg-[#E07A5F]/10 text-white' : 'border-white/10 text-white/70 hover:border-white/30 hover:bg-white/5'}`}>
                      <span className="text-2xl mr-3">{method.icon}</span><span className="font-semibold">{method.name}</span>
                      {selectedMethod === method.id && <svg className="w-5 h-5 ml-auto text-[#E07A5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                  ))}
                </div>
                <button onClick={() => { if (!selectedMethod || !paymentModal.paymentId) return; setPaymentModal({ show: false, paymentId: null, total: 0 }); handlePayDeposit(paymentModal.paymentId); }} disabled={!selectedMethod || isPaying !== null} className="w-full bg-[#E07A5F] hover:bg-[#d0694e] disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-[#E07A5F]/20">Bayar Sekarang</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="bg-[#121212]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2 text-white/70 hover:text-white transition text-sm font-semibold">← Kembali ke Halaman Utama</Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E07A5F] flex items-center justify-center text-white font-bold text-xs">
              {activeProfile.nama?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="text-white text-sm font-bold hidden sm:block">{activeProfile.nama}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR: Profile & Garage */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 text-center shadow-lg">
            <div className="w-24 h-24 rounded-full bg-[#1A1A1A] border-4 border-[#E07A5F] mx-auto mb-4 flex items-center justify-center relative">
              <User className="w-10 h-10 text-white/50" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{activeProfile.nama}</h2>
            <p className="text-[#E07A5F] text-xs font-black uppercase tracking-widest mb-4">Member Reguler</p>
            <div className="bg-[#1A1A1A] rounded-xl py-3 px-4 flex justify-between items-center text-sm mb-6 border border-white/5">
              <span className="text-white/60">Poin Loyalitas</span>
              <span className="text-white font-bold flex items-center gap-1"><Award className="w-4 h-4 text-amber-400" /> 1,250</span>
            </div>

            <div className="space-y-2 text-left">
              <button onClick={() => setMainTab("dashboard")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold text-sm ${mainTab === "dashboard" ? "bg-[#E07A5F] text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                <LayoutDashboard className="w-4 h-4" /> Pesanan & Servis
              </button>
              <button onClick={() => setMainTab("pembayaran")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold text-sm ${mainTab === "pembayaran" ? "bg-[#E07A5F] text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                <CreditCard className="w-4 h-4" /> Riwayat Pembayaran
              </button>
              <button onClick={() => setMainTab("profil")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold text-sm ${mainTab === "profil" ? "bg-[#E07A5F] text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                <Settings className="w-4 h-4" /> Pengaturan Profil
              </button>
              <button onClick={async () => { await signOut(); router.push("/login"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold text-sm text-red-400 hover:bg-red-500/10">
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </div>
          </div>

          <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-lg">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Car className="w-5 h-5 text-[#E07A5F]" /> Garasi Saya</h3>
            <div className="space-y-3">
              {vehicles.map((car) => (
                <div key={car.id} className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 transition hover:border-white/20 group relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white text-sm">{car.merk} {car.tipe}</p>
                      <p className="text-white/50 text-xs mt-1">{car.tahun} • <span className="text-[#E07A5F] font-semibold">{car.nomor_polisi}</span></p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => openVehicleModal(car)} className="p-1.5 bg-white/5 rounded-md hover:bg-white/10 text-white/70"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={() => deleteVehicle(car.id)} className="p-1.5 bg-red-500/10 rounded-md hover:bg-red-500/20 text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => openVehicleModal()} className="w-full bg-[#1A1A1A] hover:bg-[#E07A5F]/10 text-white/70 hover:text-white font-bold py-3 rounded-2xl border border-white/10 border-dashed hover:border-[#E07A5F]/50 transition text-xs mt-2 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Tambah Kendaraan
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3">
          {(message || error) && (
            <div className={`mb-6 rounded-2xl border px-5 py-4 text-sm font-semibold flex items-center justify-between ${error ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"}`}>
              {error || message}
              <button onClick={() => { setError(""); setMessage(""); }}><X className="w-4 h-4" /></button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* TAB: DASHBOARD (PESANAN & SERVIS) */}
            {mainTab === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#121212] border border-white/10 rounded-3xl p-6 sm:p-10 min-h-[600px] shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h1 className="text-3xl font-extrabold text-white mb-2">Pesanan & Servis</h1>
                    <p className="text-white/60 text-sm">Pantau status pengerjaan mobil Anda dan kelola pesanan.</p>
                  </div>
                  <Button onClick={() => openBookingModal()} className="shadow-lg shadow-[#E07A5F]/20"><Plus className="w-4 h-4" /> Buat Booking</Button>
                </div>
                
                <div className="flex gap-4 border-b border-white/10 mb-8 overflow-x-auto pb-1 scrollbar-none">
                  {subTabs.map((tab) => (
                    <button key={tab} onClick={() => setSubTab(tab)} className={`pb-4 px-2 font-bold text-sm transition border-b-2 whitespace-nowrap ${subTab === tab ? "border-[#E07A5F] text-[#E07A5F]" : "border-transparent text-white/50 hover:text-white"}`}>
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="space-y-6">
                  {filteredHistory.length === 0 ? (
                    <div className="text-center py-20 text-white/40">
                      <Wrench className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p>Tidak ada riwayat servis untuk tab ini.</p>
                    </div>
                  ) : (
                    filteredHistory.map((item) => (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 justify-between hover:border-white/30 transition-colors shadow-md relative overflow-hidden">
                        <div className="flex-1 space-y-4 relative z-10">
                          <div className="flex items-center gap-3">
                            <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">{item.id}</span>
                            <span className="text-white/50 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">{item.car}</h3>
                            <div className="text-sm text-[#E07A5F] font-semibold flex items-center gap-2"><MapPin className="w-4 h-4" /> {item.branch}</div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Layanan Dikerjakan:</span>
                            <ul className="text-sm text-white/80 list-disc list-inside">
                              {item.services.map((srv: string, i: number) => <li key={i}>{srv}</li>)}
                            </ul>
                          </div>
                        </div>

                        <div className="sm:w-64 flex flex-col justify-between sm:items-end border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6 relative z-10">
                          <div className="w-full text-left sm:text-right mb-6">
                            <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold block mb-1">Total Biaya</span>
                            <span className="text-2xl font-black text-white">Rp {item.total.toLocaleString("id-ID")}</span>
                          </div>
                          
                          <div className="w-full">
                            {item.status === "Menunggu Konfirmasi" && (
                              <div className="space-y-2 text-center">
                                <span className="text-orange-400 font-bold text-sm mb-2 block border border-orange-500/30 bg-orange-500/10 py-2 rounded-xl">{item.status}</span>
                                <button onClick={() => handleCancelBooking(item.rawBookingId, item.rawServiceId)} disabled={isCancelling === item.rawBookingId} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3 px-4 rounded-xl transition text-sm border border-red-500/20 disabled:opacity-50">
                                  {isCancelling === item.rawBookingId ? "Membatalkan..." : "Batalkan"}
                                </button>
                              </div>
                            )}

                            {item.status === "Menunggu Kedatangan" && (
                              <div className="space-y-2 text-center">
                                {item.depositPayment ? (
                                  <div className="mb-3">
                                    <div className="text-left bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-2 relative overflow-hidden">
                                      <p className="text-yellow-500 font-bold text-xs uppercase tracking-wider">Tagihan Deposit (30%)</p>
                                      <p className="text-xl font-black text-white my-1">Rp {item.depositPayment.total.toLocaleString("id-ID")}</p>
                                    </div>
                                    <button onClick={() => setPaymentModal({ show: true, paymentId: item.depositPayment.id, total: item.depositPayment.total })} disabled={isPaying === item.depositPayment.id} className="w-full bg-[#E07A5F] hover:bg-[#d0694e] text-white font-bold py-3 px-4 rounded-xl transition text-sm shadow-lg shadow-[#E07A5F]/20 disabled:opacity-50 flex items-center justify-center gap-2">
                                      {isPaying === item.depositPayment.id ? "Memproses..." : "Bayar Deposit"}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[#E07A5F] font-bold text-sm mb-2 block border border-[#E07A5F]/30 bg-[#E07A5F]/10 py-2 rounded-xl">{item.status}</span>
                                )}
                                <button onClick={() => handleCancelBooking(item.rawBookingId, item.rawServiceId)} disabled={isCancelling === item.rawBookingId} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3 px-4 rounded-xl transition text-sm border border-red-500/20 disabled:opacity-50">
                                  {isCancelling === item.rawBookingId ? "Membatalkan..." : "Batalkan"}
                                </button>
                              </div>
                            )}
                            
                            {item.status === "Di Bengkel (Menunggu Antrean)" && (
                              <div className="space-y-2 text-center">
                                <span className="text-emerald-400 font-bold text-sm mb-2 block border border-emerald-500/30 bg-emerald-500/10 py-2 rounded-xl">Di Bengkel (Antrean)</span>
                                <p className="text-[10px] text-white/50">Tidak bisa dibatalkan dari aplikasi.</p>
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
                              <div className="space-y-2 text-center">
                                <span className="text-emerald-400 font-bold text-sm mb-2 block border border-emerald-500/30 bg-emerald-500/10 py-2 rounded-xl">Selesai Dikerjakan</span>
                                <button className="w-full bg-[#E07A5F]/10 hover:bg-[#E07A5F]/20 text-[#E07A5F] font-bold py-3 px-4 rounded-xl transition text-sm border border-[#E07A5F]/30">Beri Ulasan</button>
                              </div>
                            )}

                            {item.status === "Batal" && (
                              <span className="text-red-400 font-bold text-sm mb-2 block border border-red-500/30 bg-red-500/10 py-2 rounded-xl text-center">Dibatalkan</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: PROFIL */}
            {mainTab === "profil" && (
              <motion.div key="profil" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#121212] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-lg">
                <h2 className="mb-6 text-2xl font-extrabold text-white">Pengaturan Profil</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Input label="Nama" value={activeProfile.nama} disabled hint="Hubungi Admin untuk mengubah" />
                  <Input label="Nomor Pelanggan" value={activeProfile.nomor_pelanggan ?? ""} disabled hint="ID Pelanggan Unik" />
                  <Input label="Email" value={activeProfile.email} disabled />
                  <Input label="Nomor Telepon" value={phone} disabled={!editingPhone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-white/5 pt-6">
                  {!editingPhone ? (
                    <Button onClick={() => setEditingPhone(true)}><Edit2 className="w-4 h-4 mr-2" /> Edit Telepon</Button>
                  ) : (
                    <>
                      <Button variant="secondary" onClick={() => { setEditingPhone(false); setPhone(activeProfile.nomor_hp ?? ""); }}>Batal</Button>
                      <Button onClick={savePhone} disabled={saving}><Save className="h-4 w-4 mr-2" /> {saving ? "Menyimpan..." : "Simpan Perubahan"}</Button>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: PEMBAYARAN */}
            {mainTab === "pembayaran" && (
              <motion.div key="pembayaran" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#121212] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-lg">
                <h2 className="mb-6 text-2xl font-extrabold text-white">Riwayat Pembayaran</h2>
                <div className="space-y-4">
                  {payments.map((p) => (
                    <div key={p.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-white/5 bg-[#1A1A1A] p-6 sm:flex-row sm:items-center hover:border-white/20 transition">
                      <div>
                        <p className="font-bold text-white text-lg">{p.nomor_invoice || p.services?.nomor_invoice || "Invoice"}</p>
                        <div className="mt-1 flex items-center gap-3 text-sm text-white/50">
                          <span>{formatDateTime(p.created_at)}</span>
                          <span className="uppercase text-xs font-bold px-2 py-1 bg-white/5 rounded-md">{p.metode}</span>
                          <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                        </div>
                        <p className="mt-3 text-xl font-black text-[#E07A5F]">{formatCurrency(Number(p.total))}</p>
                      </div>
                      <Button variant="outline" className="border-white/10 hover:bg-white/5 hover:text-white" onClick={() => downloadPaymentInvoice(p)}>
                        <Download className="h-4 w-4 mr-2" /> Unduh Invoice PDF
                      </Button>
                    </div>
                  ))}
                  {payments.length === 0 && <p className="py-10 text-center text-white/40">Belum ada pembayaran.</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* MODALS */}
      <Modal open={vehicleModal} onClose={() => setVehicleModal(false)} title={editingVehicle ? "Edit Kendaraan" : "Tambah Kendaraan"}>
        <div className="space-y-4">
          <Input label="Merek" value={vehicleForm.merk} onChange={(e) => setVehicleForm({ ...vehicleForm, merk: e.target.value })} />
          <Input label="Tipe" value={vehicleForm.tipe} onChange={(e) => setVehicleForm({ ...vehicleForm, tipe: e.target.value })} />
          <Input label="Tahun" type="number" value={vehicleForm.tahun} onChange={(e) => setVehicleForm({ ...vehicleForm, tahun: Number(e.target.value) })} />
          <Input label="Nomor Polisi" value={vehicleForm.nomor_polisi} onChange={(e) => setVehicleForm({ ...vehicleForm, nomor_polisi: e.target.value })} />
          <Input label="Warna" value={vehicleForm.warna} onChange={(e) => setVehicleForm({ ...vehicleForm, warna: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setVehicleModal(false)}>Batal</Button>
            <Button onClick={saveVehicle} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Kendaraan"}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={bookingModal} onClose={() => setBookingModal(false)} title={editingBooking ? "Ubah Jadwal" : "Buat Booking Baru"}>
        <div className="space-y-4">
          <Select label="Kendaraan" value={bookingForm.vehicle_id} onChange={(e) => setBookingForm({ ...bookingForm, vehicle_id: e.target.value })}>
            <option value="" disabled>Pilih kendaraan...</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.merk} {v.tipe} — {v.nomor_polisi}</option>
            ))}
          </Select>
          <Input label="Tanggal & Waktu Drop-off" type="datetime-local" value={bookingForm.tanggal} onChange={(e) => setBookingForm({ ...bookingForm, tanggal: e.target.value })} />
          <Input label="Jenis Servis" placeholder="Contoh: Ganti Oli, Tune Up" value={bookingForm.jenis_servis} onChange={(e) => setBookingForm({ ...bookingForm, jenis_servis: e.target.value })} />
          <Textarea label="Keluhan (Opsional)" rows={3} placeholder="Jelaskan keluhan kendaraan Anda..." value={bookingForm.keluhan} onChange={(e) => setBookingForm({ ...bookingForm, keluhan: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setBookingModal(false)}>Batal</Button>
            <Button onClick={saveBooking} disabled={saving || !bookingForm.vehicle_id || !bookingForm.tanggal}>
              {saving ? "Memproses..." : "Konfirmasi Booking"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
