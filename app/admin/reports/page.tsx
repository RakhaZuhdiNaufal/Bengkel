"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, FileSpreadsheet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/format";
import { exportRowsToCsv } from "@/lib/pdf";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Booking, Payment, ServiceRecord } from "@/lib/types/database";

type Range = "harian" | "mingguan" | "bulanan" | "tahunan";

function rangeStart(range: Range) {
  const d = new Date();
  if (range === "harian") d.setHours(0, 0, 0, 0);
  if (range === "mingguan") {
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
  }
  if (range === "bulanan") {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  }
  if (range === "tahunan") {
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

export default function AdminReportsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [range, setRange] = useState<Range>("bulanan");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);

  const load = useCallback(async () => {
    const [p, b, s] = await Promise.all([
      supabase.from("payments").select("*, users(id,nama,nomor_pelanggan)"),
      supabase.from("bookings").select("*"),
      supabase.from("services").select("*"),
    ]);
    setPayments((p.data as Payment[]) ?? []);
    setBookings((b.data as Booking[]) ?? []);
    setServices((s.data as ServiceRecord[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const start = rangeStart(range);
  const filteredPayments = payments.filter(
    (p) => new Date(p.paid_at || p.created_at) >= start && p.status === "lunas"
  );
  const filteredBookings = bookings.filter((b) => new Date(b.tanggal) >= start);
  const filteredServices = services.filter((s) => new Date(s.tanggal) >= start);

  const chartData = useMemo(() => {
    const map = new Map<string, { label: string; pendapatan: number; booking: number }>();
    filteredPayments.forEach((p) => {
      const d = new Date(p.paid_at || p.created_at);
      const key = d.toISOString().slice(0, 10);
      const cur = map.get(key) ?? { label: key, pendapatan: 0, booking: 0 };
      cur.pendapatan += Number(p.total);
      map.set(key, cur);
    });
    filteredBookings.forEach((b) => {
      const key = new Date(b.tanggal).toISOString().slice(0, 10);
      const cur = map.get(key) ?? { label: key, pendapatan: 0, booking: 0 };
      cur.booking += 1;
      map.set(key, cur);
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [filteredPayments, filteredBookings]);

  const totalRevenue = filteredPayments.reduce((a, p) => a + Number(p.total), 0);

  const exportExcel = () => {
    exportRowsToCsv(
      `laporan-${range}.csv`,
      ["Tanggal", "Invoice", "Customer", "Total", "Metode", "Status"],
      filteredPayments.map((p) => [
        formatDate(p.paid_at || p.created_at),
        p.nomor_invoice ?? "",
        p.users?.nama ?? "",
        Number(p.total),
        p.metode,
        p.status,
      ])
    );
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Laporan Auto Craft (${range})`, 14, 18);
    doc.setFontSize(11);
    doc.text(`Total pendapatan: ${formatCurrency(totalRevenue)}`, 14, 26);
    doc.text(`Booking: ${filteredBookings.length} · Servis: ${filteredServices.length}`, 14, 32);
    autoTable(doc, {
      startY: 40,
      head: [["Tanggal", "Invoice", "Customer", "Total", "Status"]],
      body: filteredPayments.map((p) => [
        formatDate(p.paid_at || p.created_at),
        p.nomor_invoice ?? "",
        p.users?.nama ?? "",
        formatCurrency(Number(p.total)),
        p.status,
      ]),
    });
    doc.save(`laporan-${range}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Laporan</h1>
          <p className="text-sm text-white/50">Filter periode · export PDF / Excel</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Periode" value={range} onChange={(e) => setRange(e.target.value as Range)}>
            <option value="harian">Harian</option>
            <option value="mingguan">Mingguan</option>
            <option value="bulanan">Bulanan</option>
            <option value="tahunan">Tahunan</option>
          </Select>
          <Button variant="outline" onClick={exportPdf}>
            <Download className="h-4 w-4" /> PDF
          </Button>
          <Button variant="secondary" onClick={exportExcel}>
            <FileSpreadsheet className="h-4 w-4" /> Excel (CSV)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
          <p className="text-xs uppercase tracking-wider text-white/40">Pendapatan</p>
          <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
          <p className="text-xs uppercase tracking-wider text-white/40">Booking</p>
          <p className="mt-2 text-2xl font-bold text-white">{filteredBookings.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
          <p className="text-xs uppercase tracking-wider text-white/40">Servis</p>
          <p className="mt-2 text-2xl font-bold text-white">{filteredServices.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
          <h3 className="mb-4 font-semibold text-white">Pendapatan</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="#666" fontSize={11} />
                <YAxis stroke="#666" fontSize={11} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
                <Tooltip
                  contentStyle={{ background: "#121212", border: "1px solid #333" }}
                  formatter={(v) => formatCurrency(Number(v))}
                />
                <Area type="monotone" dataKey="pendapatan" stroke="#E07A5F" fill="#E07A5F33" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
          <h3 className="mb-4 font-semibold text-white">Booking</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="#666" fontSize={11} />
                <YAxis stroke="#666" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#121212", border: "1px solid #333" }} />
                <Bar dataKey="booking" fill="#1f4b7a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
