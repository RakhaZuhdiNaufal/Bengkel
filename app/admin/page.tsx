"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
import { CalendarDays, Car, Users, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/format";
import type { Booking, Payment, ServiceRecord, UserProfile, Vehicle } from "@/lib/types/database";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default function AdminDashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);

  const load = useCallback(async () => {
    const [c, v, b, p, s] = await Promise.all([
      supabase.from("users").select("*").eq("role", "customer"),
      supabase.from("vehicles").select("*"),
      supabase.from("bookings").select("*"),
      supabase.from("payments").select("*"),
      supabase.from("services").select("*"),
    ]);
    setCustomers((c.data as UserProfile[]) ?? []);
    setVehicles((v.data as Vehicle[]) ?? []);
    setBookings((b.data as Booking[]) ?? []);
    setPayments((p.data as Payment[]) ?? []);
    setServices((s.data as ServiceRecord[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "vehicles" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "services" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, supabase]);

  const today = startOfDay();
  const monthStart = startOfMonth();

  const bookingToday = bookings.filter((b) => new Date(b.tanggal) >= today).length;
  const revenueToday = payments
    .filter((p) => p.status === "lunas" && p.paid_at && new Date(p.paid_at) >= today)
    .reduce((a, p) => a + Number(p.total), 0);
  const revenueMonth = payments
    .filter((p) => p.status === "lunas" && p.paid_at && new Date(p.paid_at) >= monthStart)
    .reduce((a, p) => a + Number(p.total), 0);

  const monthlyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, 0);
    }
    payments
      .filter((p) => p.status === "lunas")
      .forEach((p) => {
        const d = new Date(p.paid_at || p.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (map.has(key)) map.set(key, (map.get(key) ?? 0) + Number(p.total));
      });
    return Array.from(map.entries()).map(([bulan, total]) => ({ bulan, total }));
  }, [payments]);

  const weeklyBookings = useMemo(() => {
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const counts = Array(7).fill(0);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);
    bookings.forEach((b) => {
      const d = new Date(b.tanggal);
      if (d >= weekAgo) counts[d.getDay()] += 1;
    });
    return days.map((name, i) => ({ hari: name, total: counts[i] }));
  }, [bookings]);

  const topServices = useMemo(() => {
    const map = new Map<string, number>();
    services.forEach((s) => {
      const key = s.pekerjaan || "Lainnya";
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([nama, total]) => ({ nama, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [services]);

  const cards = [
    { label: "Total Customer", value: customers.length, icon: Users },
    { label: "Booking Hari Ini", value: bookingToday, icon: CalendarDays },
    { label: "Kendaraan Terdaftar", value: vehicles.length, icon: Car },
    { label: "Pendapatan Hari Ini", value: formatCurrency(revenueToday), icon: Wallet },
    { label: "Pendapatan Bulan Ini", value: formatCurrency(revenueMonth), icon: Wallet },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white lg:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-white/50">Realtime overview operasional bengkel</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-[#121212] p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  {c.label}
                </p>
                <Icon className="h-4 w-4 text-[#E07A5F]" />
              </div>
              <p className="text-2xl font-bold text-white">{c.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-5 xl:col-span-2">
          <h3 className="mb-4 font-semibold text-white">Pendapatan Bulanan</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E07A5F" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#E07A5F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="bulan" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  contentStyle={{ background: "#121212", border: "1px solid #333" }}
                  formatter={(v) => formatCurrency(Number(v))}
                />
                <Area type="monotone" dataKey="total" stroke="#E07A5F" fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
          <h3 className="mb-4 font-semibold text-white">Booking Mingguan</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBookings}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="hari" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#121212", border: "1px solid #333" }} />
                <Bar dataKey="total" fill="#1f4b7a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
        <h3 className="mb-4 font-semibold text-white">Servis Terbanyak</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topServices} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" stroke="#666" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="nama" stroke="#666" fontSize={12} width={100} />
              <Tooltip contentStyle={{ background: "#121212", border: "1px solid #333" }} />
              <Bar dataKey="total" fill="#E07A5F" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
