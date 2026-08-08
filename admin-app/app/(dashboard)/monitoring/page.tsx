"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Clock, Wrench, CheckCircle2, Activity, User } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

export default function MonitoringPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchServices();
    
    // Auto-refresh every 30 seconds for live monitoring
    const interval = setInterval(fetchServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchServices = async () => {
    const { data } = await supabase
      .from("services")
      .select(`
        *,
        users (nama, nomor_hp),
        vehicles (merk, tipe, nomor_polisi)
      `)
      .in("status", ["menunggu", "proses", "selesai"])
      .order("created_at", { ascending: true });

    if (data) setServices(data);
    setLoading(false);
  };

  const getDuration = (start: string) => {
    const diff = dayjs().diff(dayjs(start), 'minute');
    if (diff < 60) return `${diff} m`;
    return `${Math.floor(diff / 60)}j ${diff % 60}m`;
  };

  const antrean = services.filter((s) => s.status === "menunggu");
  const proses = services.filter((s) => s.status === "proses");
  const selesai = services.filter((s) => s.status === "selesai");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#121212] p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-[#E07A5F]" />
            Monitoring Operasional
          </h1>
          <p className="text-gray-400 mt-1">Pantau pergerakan servis di garasi secara real-time (Read-Only).</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#1A1A1A] px-4 py-2 rounded-xl border border-white/5">
            <p className="text-xs text-gray-500 font-semibold uppercase">Sedang Dikerjakan</p>
            <p className="text-xl font-bold text-white">{proses.length} <span className="text-sm text-gray-400 font-normal">Mobil</span></p>
          </div>
          <div className="bg-[#1A1A1A] px-4 py-2 rounded-xl border border-white/5">
            <p className="text-xs text-gray-500 font-semibold uppercase">Selesai Hari Ini</p>
            <p className="text-xl font-bold text-[#81B29A]">{selesai.length} <span className="text-sm text-gray-400 font-normal">Mobil</span></p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3].map(i => (
            <div key={i} className="h-96 bg-[#121212] rounded-2xl border border-white/5"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kolom 1: Antrean */}
          <div className="bg-[#121212] rounded-2xl border border-white/10 p-5 flex flex-col h-[calc(100vh-220px)]">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                Antrean Servis
              </h2>
              <span className="bg-white/10 text-white text-xs px-2 py-1 rounded-full font-bold">{antrean.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {antrean.map(item => (
                <motion.div key={item.id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">{item.vehicles?.nomor_polisi}</span>
                    <span className="text-[10px] text-gray-500">{dayjs(item.created_at).format('HH:mm')}</span>
                  </div>
                  <p className="text-white font-semibold">{item.users?.nama}</p>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{item.keluhan || item.pekerjaan || "Belum ada keluhan dicatat"}</p>
                </motion.div>
              ))}
              {antrean.length === 0 && (
                <p className="text-center text-gray-500 text-sm mt-10">Tidak ada antrean</p>
              )}
            </div>
          </div>

          {/* Kolom 2: Proses */}
          <div className="bg-[#121212] rounded-2xl border border-white/10 p-5 flex flex-col h-[calc(100vh-220px)]">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#E07A5F]" />
                Sedang Dikerjakan
              </h2>
              <span className="bg-white/10 text-white text-xs px-2 py-1 rounded-full font-bold">{proses.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {proses.map(item => (
                <motion.div key={item.id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-[#1A1A1A] p-4 rounded-xl border border-[#E07A5F]/30 relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-[#E07A5F] bg-[#E07A5F]/10 px-2 py-1 rounded">{item.vehicles?.nomor_polisi}</span>
                    <div className="text-[10px] font-bold text-red-400 animate-pulse bg-red-400/10 px-2 py-1 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {getDuration(item.updated_at || item.created_at)}
                    </div>
                  </div>
                  <p className="text-white font-semibold">{item.users?.nama}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                    <User className="w-4 h-4" />
                    <span>Mekanik: {item.mekanik || "Sedang bekerja"}</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-2 line-clamp-2 bg-white/5 p-2 rounded">{item.pekerjaan || "Mengecek kendaraan..."}</p>
                </motion.div>
              ))}
              {proses.length === 0 && (
                <p className="text-center text-gray-500 text-sm mt-10">Tidak ada mobil yang sedang dikerjakan</p>
              )}
            </div>
          </div>

          {/* Kolom 3: Selesai (Menunggu Pembayaran) */}
          <div className="bg-[#121212] rounded-2xl border border-white/10 p-5 flex flex-col h-[calc(100vh-220px)]">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <h2 className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#81B29A]" />
                Selesai (Menunggu Pembayaran)
              </h2>
              <span className="bg-white/10 text-white text-xs px-2 py-1 rounded-full font-bold">{selesai.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {selesai.map(item => (
                <motion.div key={item.id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-400 bg-white/5 px-2 py-1 rounded">{item.vehicles?.nomor_polisi}</span>
                    <span className="text-[10px] text-[#81B29A] font-bold bg-[#81B29A]/10 px-2 py-1 rounded">
                      Rp {item.total.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <p className="text-white font-semibold">{item.users?.nama}</p>
                  <p className="text-xs text-gray-500 mt-2">Dikerjakan oleh: {item.mekanik || "-"}</p>
                </motion.div>
              ))}
              {selesai.length === 0 && (
                <p className="text-center text-gray-500 text-sm mt-10">Belum ada yang selesai</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
