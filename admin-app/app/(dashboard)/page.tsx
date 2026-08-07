"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Wallet, Clock, Users, Activity, Banknote, CalendarClock, PenTool, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Basic Metrics
  const [pendingBookings, setPendingBookings] = useState(0);
  const [activeServices, setActiveServices] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  
  // Finance Metrics
  const [revenueDisetor, setRevenueDisetor] = useState(0);
  const [revenueBelumDisetor, setRevenueBelumDisetor] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  
  // Schedule & Bay
  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);
  const [bayUsed, setBayUsed] = useState(0);
  const BAY_CAPACITY = 4;

  const supabase = createClient();

  useEffect(() => {
    async function loadDashboardData() {
      // 1. Profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
        setProfile(data);
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const startOfDay = `${todayStr}T00:00:00.000Z`;
      const endOfDay = `${todayStr}T23:59:59.999Z`;

      // 2. Fetch Basic Counts
      const [bookingsRes, servicesRes, usersRes] = await Promise.all([
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "menunggu"),
        supabase.from("services").select("*", { count: "exact", head: true }).in("status", ["menunggu", "proses"]),
        supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "customer")
      ]);

      if (bookingsRes.count !== null) setPendingBookings(bookingsRes.count);
      if (servicesRes.count !== null) setActiveServices(servicesRes.count);
      if (usersRes.count !== null) setTotalCustomers(usersRes.count);

      // 3. Fetch Finance
      const { data: paymentsToday } = await supabase
        .from("payments")
        .select("total, status, is_setor")
        .gte("created_at", startOfDay)
        .lte("created_at", endOfDay);

      if (paymentsToday) {
        let setor = 0;
        let belumSetor = 0;
        paymentsToday.forEach(p => {
          if (p.status === 'lunas') {
            if (p.is_setor) setor += p.total;
            else belumSetor += p.total;
          }
        });
        setRevenueDisetor(setor);
        setRevenueBelumDisetor(belumSetor);
      }

      const { count: pendingPayCount } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      
      if (pendingPayCount !== null) setPendingPayments(pendingPayCount);

      // 4. Fetch Today's Schedules
      const { data: schedules } = await supabase
        .from("bookings")
        .select(`
          id, booking_time, status,
          users (nama),
          vehicles (brand_model, license_plate)
        `)
        .eq("booking_date", todayStr)
        .order("booking_time", { ascending: true });
        
      if (schedules) setTodaySchedules(schedules);

      // 5. Fetch Bay Utilization
      const { data: bayData } = await supabase
        .from("services")
        .select("id, bookings(tanggal)")
        .eq("status", "proses");
        
      if (bayData) {
        let activeCount = 0;
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        bayData.forEach((s: any) => {
          if (!s.bookings?.tanggal || new Date(s.bookings.tanggal) <= now) {
            activeCount++;
          }
        });
        setBayUsed(Math.min(activeCount, BAY_CAPACITY));
      }

      setLoading(false);
    }
    loadDashboardData();
  }, [supabase]);

  if (loading) return <div className="text-white/60 p-8">Memuat dashboard komprehensif...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview Dashboard</h1>
        <p className="text-white/60 mt-1">Selamat datang kembali, {profile?.nama || "Admin"}. Berikut ringkasan operasional hari ini.</p>
      </div>

      {/* METRIK KEUANGAN & UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Pendapatan Bersih (Tersimpan) */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A1A1A] border border-green-500/20 p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-white/80">Pendapatan (Disetor)</h3>
            <Wallet className="text-green-400 w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-white">Rp {revenueDisetor.toLocaleString('id-ID')}</div>
          <p className="text-green-400 text-xs mt-2 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Masuk ke rekening bos
          </p>
        </div>

        {/* Uang di Kasir (Belum Disetor) */}
        <div className="bg-[#1A1A1A] border border-[#E07A5F]/20 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E07A5F]"></div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-white/80">Uang di Laci Kasir</h3>
            <Wallet className="text-[#E07A5F] w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-[#E07A5F]">Rp {revenueBelumDisetor.toLocaleString('id-ID')}</div>
          <p className="text-white/40 text-xs mt-2 font-medium">Belum ditutup/disetorkan kasir</p>
        </div>

        <div className="bg-[#1A1A1A] border border-white/10 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-white/80">Tagihan Gantung</h3>
            <Banknote className="text-red-400 w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-white">{pendingPayments} <span className="text-lg font-normal text-white/40">Tagihan</span></div>
          <p className="text-red-400/80 text-xs mt-2 font-medium">Pelanggan belum melunasi</p>
        </div>
        
        <div className="bg-[#1A1A1A] border border-white/10 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-white/80">Pesanan Baru</h3>
            <Clock className="text-blue-400 w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-white">{pendingBookings}</div>
          <p className="text-white/40 text-xs mt-2">Menunggu konfirmasi admin</p>
        </div>

        <div className="bg-[#1A1A1A] border border-white/10 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-white/80">Total Pelanggan</h3>
            <Users className="text-purple-400 w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-white">{totalCustomers}</div>
          <p className="text-white/40 text-xs mt-2">Pelanggan aktif terdaftar</p>
        </div>
      </div>

      {/* ROW 2: JADWAL & KAPASITAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Jadwal Kedatangan Hari Ini */}
        <div className="lg:col-span-2 bg-[#1A1A1A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <CalendarClock className="w-6 h-6 text-[#E07A5F]" />
            <div>
              <h2 className="text-xl font-bold text-white">Jadwal Kedatangan Hari Ini</h2>
              <p className="text-xs text-white/50 mt-1">Daftar pelanggan yang telah reservasi untuk tanggal ini.</p>
            </div>
          </div>
          
          {todaySchedules.length === 0 ? (
            <div className="text-center py-10 text-white/40 text-sm">Tidak ada jadwal kedatangan hari ini.</div>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {todaySchedules.map((schedule) => (
                <div key={schedule.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="bg-black/50 text-[#E07A5F] font-bold px-3 py-1.5 rounded-lg text-sm border border-white/5">
                      {schedule.booking_time.slice(0, 5)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{schedule.users?.nama}</h4>
                      <p className="text-xs text-white/60 mt-0.5">{schedule.vehicles?.brand_model} • <span className="text-[#E07A5F]">{schedule.vehicles?.license_plate}</span></p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider
                      ${schedule.status === 'menunggu' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : ''}
                      ${schedule.status === 'diterima' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : ''}
                      ${schedule.status === 'selesai' ? 'bg-green-500/20 text-green-500 border border-green-500/30' : ''}
                      ${schedule.status === 'ditolak' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : ''}
                    `}>
                      {schedule.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kapasitas Bengkel (Bay Utilization) */}
        <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <Activity className="w-6 h-6 text-[#E07A5F]" />
            <div>
              <h2 className="text-xl font-bold text-white">Kapasitas Bay</h2>
              <p className="text-xs text-white/50 mt-1">Utilisasi tempat kerja (Bay) aktif.</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center py-6">
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="rgba(255,255,255,0.05)" 
                  strokeWidth="8"
                />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke={bayUsed >= BAY_CAPACITY ? "#ef4444" : "#E07A5F"} 
                  strokeWidth="8"
                  strokeDasharray={`${(bayUsed / BAY_CAPACITY) * 283} 283`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white">{bayUsed}<span className="text-xl text-white/30">/{BAY_CAPACITY}</span></span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 mt-1">Terisi</span>
              </div>
            </div>
            
            <div className="w-full space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60 flex items-center gap-1.5"><PenTool className="w-3.5 h-3.5"/> Servis Berjalan</span>
                <span className="font-bold text-white">{activeServices} Mobil</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-3 border-t border-white/5">
                <span className="text-white/60">Status Kapasitas</span>
                <span className={`font-bold ${bayUsed >= BAY_CAPACITY ? 'text-red-400' : 'text-green-400'}`}>
                  {bayUsed >= BAY_CAPACITY ? 'Penuh' : 'Tersedia'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
