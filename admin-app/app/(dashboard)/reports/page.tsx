"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { TrendingUp, Banknote, Users, Activity, BarChart3 } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

type ReportData = {
  totalPendapatan: number;
  totalModalSparepart: number;
  totalBagiHasil: number;
  labaBersih: number;
  mechanicShares: Record<string, number>;
  transactions: any[];
};

export default function ReportsPage() {
  const [data, setData] = useState<ReportData>({
    totalPendapatan: 0,
    totalModalSparepart: 0,
    totalBagiHasil: 0,
    labaBersih: 0,
    mechanicShares: {},
    transactions: []
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    
    // 1. Ambil pembayaran lunas untuk pendapatan & transaksi
    const { data: payments } = await supabase
      .from("payments")
      .select(`
        *,
        users (nama),
        services (mekanik, sparepart, jasa, total)
      `)
      .eq("status", "lunas")
      .order("paid_at", { ascending: false });

    if (!payments) {
      setLoading(false);
      return;
    }

    let pendapatan = 0;
    let modalSparepart = 0;
    let bagiHasil = 0;
    const mechanics: Record<string, number> = {};

    payments.forEach((p) => {
      pendapatan += Number(p.total);

      // Hitung Modal Sparepart
      const spareparts = p.services?.sparepart || [];
      spareparts.forEach((item: any) => {
        modalSparepart += (Number(item.harga_modal || 0) * Number(item.qty || 1));
      });

      // Hitung Bagi Hasil Mekanik
      const jasas = p.services?.jasa || [];
      const mekanikName = p.services?.mekanik || "Tanpa Nama";
      
      let shareMekanikTransaksiIni = 0;
      jasas.forEach((jasaItem: any) => {
        const persentase = Number(jasaItem.persentase_mekanik || 40) / 100;
        const komisi = Number(jasaItem.harga || 0) * persentase;
        shareMekanikTransaksiIni += komisi;
      });

      bagiHasil += shareMekanikTransaksiIni;

      if (!mechanics[mekanikName]) mechanics[mekanikName] = 0;
      mechanics[mekanikName] += shareMekanikTransaksiIni;
    });

    setData({
      totalPendapatan: pendapatan,
      totalModalSparepart: modalSparepart,
      totalBagiHasil: bagiHasil,
      labaBersih: pendapatan - modalSparepart - bagiHasil,
      mechanicShares: mechanics,
      transactions: payments
    });

    setLoading(false);
  };

  if (loading) {
    return <div className="text-white/60">Mengalkulasi laporan keuangan...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan Keuangan</h1>
          <p className="text-white/60 mt-1">Analitik pendapatan, laba bersih, dan bagi hasil mekanik.</p>
        </div>
        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold">
          <BarChart3 className="w-4 h-4" /> Cetak Laporan
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1A1A1A] border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="flex items-center gap-3 mb-4 text-blue-400">
            <div className="p-2 bg-blue-500/20 rounded-lg"><Banknote className="w-5 h-5" /></div>
            <h3 className="font-semibold">Pendapatan Kotor</h3>
          </div>
          <div className="text-3xl font-black text-white whitespace-nowrap">
            Rp {data.totalPendapatan.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />
          <div className="flex items-center gap-3 mb-4 text-red-400">
            <div className="p-2 bg-red-500/20 rounded-lg"><Activity className="w-5 h-5" /></div>
            <h3 className="font-semibold">Modal Sparepart</h3>
          </div>
          <div className="text-3xl font-black text-white whitespace-nowrap">
            - Rp {data.totalModalSparepart.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all" />
          <div className="flex items-center gap-3 mb-4 text-[#E07A5F]">
            <div className="p-2 bg-[#E07A5F]/20 rounded-lg"><Users className="w-5 h-5" /></div>
            <h3 className="font-semibold">Bagi Hasil Mekanik</h3>
          </div>
          <div className="text-3xl font-black text-white whitespace-nowrap">
            - Rp {data.totalBagiHasil.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-green-500/30 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all" />
          <div className="flex items-center gap-3 mb-4 text-green-400">
            <div className="p-2 bg-green-500/20 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            <h3 className="font-semibold">Laba Bersih</h3>
          </div>
          <div className="text-3xl font-black text-white whitespace-nowrap">
            Rp {data.labaBersih.toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rekap Mekanik */}
        <div className="lg:col-span-1 bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/10">
            <h3 className="font-bold text-lg text-white">Komisi Mekanik</h3>
            <p className="text-sm text-white/40 mt-1">Berdasarkan persentase (40% / 60%)</p>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {Object.keys(data.mechanicShares).length === 0 ? (
              <div className="text-center text-white/40 text-sm">Belum ada data komisi.</div>
            ) : (
              <div className="space-y-4">
                {Object.entries(data.mechanicShares)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, amount]) => (
                  <div key={name} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="font-semibold text-white">{name}</div>
                    <div className="font-bold text-[#E07A5F]">Rp {amount.toLocaleString("id-ID")}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Riwayat Transaksi */}
        <div className="lg:col-span-2 bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/10">
            <h3 className="font-bold text-lg text-white">Riwayat Transaksi Terakhir</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/80">
              <thead className="bg-black/50 text-white/60 font-semibold">
                <tr>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Metode</th>
                  <th className="px-6 py-4 text-right">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-white/40">Belum ada transaksi.</td>
                  </tr>
                ) : (
                  data.transactions.slice(0, 10).map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-white">{dayjs(t.paid_at).format("DD MMM YYYY")}</div>
                        <div className="text-white/40 text-xs">{dayjs(t.paid_at).format("HH:mm")}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-[#E07A5F]">{t.nomor_invoice}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">{t.users?.nama}</td>
                      <td className="px-6 py-4 uppercase text-xs tracking-wider">{t.metode}</td>
                      <td className="px-6 py-4 text-right font-bold text-white">
                        Rp {t.total.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
