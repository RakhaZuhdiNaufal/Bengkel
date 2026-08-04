"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Car, Wrench, Download, Calendar, MapPin, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import dayjs from "dayjs";

export default function ServiceHistoryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("Menunggu");
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  
  const tabs = ["Menunggu", "Di Bengkel", "Proses", "Terjadwal", "Selesai", "Batal"];
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [myCars, setMyCars] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?redirect=/riwayat-servis");
        return;
      }

      setUserProfile({
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Pengguna",
        points: 1250 // Dummy loyalitas
      });

      const { data: vehiclesData } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", user.id);
        
      if (vehiclesData) {
        setMyCars(vehiclesData.map(v => ({
          brand: v.merk,
          model: v.tipe,
          year: v.tahun,
          plate: v.nomor_polisi,
          nextService: "Cek Berkala"
        })));
      }

      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*, vehicles(*), services(*), payments(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const { data: allProsesServices } = await supabase
        .from("services")
        .select("id, bookings(tanggal)")
        .eq("status", "proses")
        .order("created_at", { ascending: true });

      const activeQueueIds = (allProsesServices || [])
        .filter((s: any) => !s.bookings?.tanggal || dayjs(s.bookings.tanggal).isBefore(dayjs().endOf('day')))
        .map((s: any) => s.id);

      if (bookingsData) {
        const mapped = bookingsData.map((b: any) => {
          const srv = b.services && b.services.length > 0 ? b.services[0] : null;
          
          let statusLabel = "Menunggu";
          let progress = 0;
          
          if (srv) {
            if (srv.status === 'selesai') {
              statusLabel = "Selesai";
              progress = 100;
            } else if (srv.status === 'dibatalkan') {
              statusLabel = "Batal";
              progress = 0;
            } else if (srv.status === 'menunggu') {
              // Sudah Check-In tapi belum masuk Bay
              statusLabel = "Di Bengkel (Menunggu Antrean)";
              progress = 30;
            } else if (srv.status === 'proses') {
              if (dayjs(b.tanggal).isAfter(dayjs().endOf('day'))) {
                statusLabel = "Terjadwal";
                progress = 20;
              } else {
                // Cari antrean (hanya untuk hari ini/lalu)
                const index = activeQueueIds.indexOf(srv.id);
                if (index !== -1 && index < 4) {
                  statusLabel = "Proses"; // Masuk 4 Bay Utama
                  progress = 50;
                } else if (index >= 4) {
                  statusLabel = `Menunggu Antrean (Ke-${index - 3})`;
                  progress = 0;
                } else {
                  statusLabel = "Proses";
                  progress = 50;
                }
              }
            }
          } else {
            // Tidak ada service record — booking saja
            if (b.status === 'batal' || b.status === 'dibatalkan') {
              statusLabel = "Batal";
            } else if (b.status === 'checked_in') {
              statusLabel = "Di Bengkel (Menunggu Antrean)";
              progress = 30;
            } else if (b.status === 'diterima') {
              statusLabel = "Menunggu Kedatangan";
              progress = 10;
            } else if (b.status === 'menunggu') {
              statusLabel = "Menunggu Konfirmasi";
              progress = 5;
            } else if (b.status === 'ditolak') {
              statusLabel = "Ditolak";
            }
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
            date: formattedDate,
            services: serviceList.length > 0 ? serviceList : ["Servis Umum"],
            total: srv?.total || b.estimasi_total || 0,
            branch: "Auto Craft Pusat",
            technician: srv?.mekanik || b.mekanik || "-",
            progress,
            depositPayment
          };
        });
        setHistory(mapped);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [router, supabase]);

  const handleCancelBooking = async (bookingId: string, serviceId?: string) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan booking ini?")) return;
    
    setIsCancelling(bookingId);
    try {
      const res = await fetch("/api/booking/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId, service_id: serviceId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membatalkan pesanan");
      
      alert("Booking berhasil dibatalkan.");
      // Refresh page to show updated status
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCancelling(null);
    }
  };

  const [isPaying, setIsPaying] = useState<string | null>(null);

  const handlePayDeposit = async (paymentId: string) => {
    setIsPaying(paymentId);
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'success' })
        .eq('id', paymentId);
      
      if (error) throw new Error(error.message);
      
      alert('Pembayaran deposit berhasil disimulasikan!');
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPaying(null);
    }
  };

  const filteredHistory = history.filter(h => {
    if (activeTab === "Menunggu") return h.status.includes("Menunggu") || h.status === "Menunggu Kedatangan";
    if (activeTab === "Di Bengkel") return h.status.includes("Di Bengkel");
    return h.status === activeTab;
  });

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
              {userProfile?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="text-white text-sm font-bold hidden sm:block">{userProfile?.name || "Memuat..."}</span>
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
            <h2 className="text-xl font-bold text-white mb-1">{userProfile?.name || "Pengguna"}</h2>
            <p className="text-[#E07A5F] text-xs font-black uppercase tracking-widest mb-4">Member Reguler</p>
            <div className="bg-[#1A1A1A] rounded-xl py-3 px-4 flex justify-between items-center text-sm">
              <span className="text-white/60">Poin Loyalitas</span>
              <span className="text-white font-bold">{userProfile?.points || 0} Pts</span>
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
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-2 font-bold text-sm transition border-b-2 whitespace-nowrap ${
                    activeTab === tab ? "border-[#E07A5F] text-[#E07A5F]" : "border-transparent text-white/50 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-20 text-white/40">
                  <p>Memuat riwayat servis Anda...</p>
                </div>
              ) : filteredHistory.length === 0 ? (
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
                          {item.services.map((srv: string, i: number) => <li key={i}>{srv}</li>)}
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
                        {item.status === "Menunggu Konfirmasi" && (
                          <div className="space-y-2 text-center">
                            <span className="text-orange-400 font-bold text-sm mb-2 block border border-orange-500/30 bg-orange-500/10 py-2 rounded-xl">
                              {item.status}
                            </span>
                            <button 
                              onClick={() => handleCancelBooking(item.rawBookingId, item.rawServiceId)}
                              disabled={isCancelling === item.rawBookingId}
                              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3 px-4 rounded-xl transition text-sm border border-red-500/20 disabled:opacity-50"
                            >
                              {isCancelling === item.rawBookingId ? "Membatalkan..." : "Batalkan"}
                            </button>
                          </div>
                        )}

                        {item.status === "Menunggu Kedatangan" && (
                          <div className="space-y-2 text-center">
                            {item.depositPayment ? (
                              <div className="mb-3">
                                <div className="text-left bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-2 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/20 rounded-bl-full -z-10"></div>
                                  <p className="text-yellow-500 font-bold text-xs uppercase tracking-wider">Tagihan Deposit (30%)</p>
                                  <p className="text-xl font-black text-white my-1">Rp {item.depositPayment.total.toLocaleString("id-ID")}</p>
                                  <p className="text-yellow-500/70 text-[10px]">Bayar sebelum {new Date(new Date(item.depositPayment.created_at).getTime() + 86400000).toLocaleString("id-ID", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} WIB</p>
                                </div>
                                <button 
                                  onClick={() => handlePayDeposit(item.depositPayment.id)}
                                  disabled={isPaying === item.depositPayment.id}
                                  className="w-full bg-[#E07A5F] hover:bg-[#d0694e] text-white font-bold py-3 px-4 rounded-xl transition text-sm shadow-lg shadow-[#E07A5F]/20 disabled:opacity-50 mb-2 flex items-center justify-center gap-2"
                                >
                                  {isPaying === item.depositPayment.id ? "Memproses..." : "Bayar Deposit Sekarang"}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[#E07A5F] font-bold text-sm mb-2 block border border-[#E07A5F]/30 bg-[#E07A5F]/10 py-2 rounded-xl">
                                {item.status}
                              </span>
                            )}
                            
                            <button 
                              onClick={() => handleCancelBooking(item.rawBookingId, item.rawServiceId)}
                              disabled={isCancelling === item.rawBookingId}
                              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3 px-4 rounded-xl transition text-sm border border-red-500/20 disabled:opacity-50"
                            >
                              {isCancelling === item.rawBookingId ? "Membatalkan..." : "Batalkan"}
                            </button>
                          </div>
                        )}
                        
                        {item.status === "Di Bengkel (Menunggu Antrean)" && (
                          <div className="space-y-2 text-center">
                            <span className="text-emerald-400 font-bold text-sm mb-2 block border border-emerald-500/30 bg-emerald-500/10 py-2 rounded-xl">
                              Di Bengkel (Antrean)
                            </span>
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
