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
import type {
  Booking,
  BookingStatus,
  Payment,
  ServiceRecord,
  Vehicle,
} from "@/lib/types/database";

type Tab = "profil" | "kendaraan" | "servis" | "pembayaran" | "booking";

const emptyVehicle = {
  merk: "",
  tipe: "",
  tahun: new Date().getFullYear(),
  nomor_polisi: "",
  warna: "",
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, signOut, isStaff } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [tab, setTab] = useState<Tab>("profil");
  const [mobileNav, setMobileNav] = useState(false);
  const [phone, setPhone] = useState("");
  const [editingPhone, setEditingPhone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

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

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/profile");
    if (!loading && isStaff) router.replace("/admin");
  }, [loading, user, isStaff, router]);

  useEffect(() => {
    if (profile) setPhone(profile.nomor_hp ?? "");
  }, [profile]);

  const loadAll = useCallback(async () => {
    if (!user) return;
    const [v, s, p, b] = await Promise.all([
      supabase.from("vehicles").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase
        .from("services")
        .select("*, vehicles(id,merk,tipe,nomor_polisi,warna,tahun)")
        .eq("user_id", user.id)
        .order("tanggal", { ascending: false }),
      supabase
        .from("payments")
        .select("*, services(id,nomor_invoice,tanggal,pekerjaan)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("bookings")
        .select("*, vehicles(id,merk,tipe,nomor_polisi,warna,tahun)")
        .eq("user_id", user.id)
        .order("tanggal", { ascending: false }),
    ]);
    setVehicles((v.data as Vehicle[]) ?? []);
    setServices((s.data as ServiceRecord[]) ?? []);
    setPayments((p.data as Payment[]) ?? []);
    setBookings((b.data as Booking[]) ?? []);
  }, [supabase, user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`customer-data:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "vehicles", filter: `user_id=eq.${user.id}` }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `user_id=eq.${user.id}` }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "services", filter: `user_id=eq.${user.id}` }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "payments", filter: `user_id=eq.${user.id}` }, () => loadAll())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, loadAll]);

  const savePhone = async () => {
    if (!user) return;
    setSaving(true);
    setError("");
    setMessage("");
    const { error: err } = await supabase
      .from("users")
      .update({ nomor_hp: phone })
      .eq("id", user.id);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage("Nomor telepon berhasil disimpan.");
    setEditingPhone(false);
  };

  const openVehicleModal = (v?: Vehicle) => {
    if (v) {
      setEditingVehicle(v);
      setVehicleForm({
        merk: v.merk,
        tipe: v.tipe,
        tahun: v.tahun,
        nomor_polisi: v.nomor_polisi,
        warna: v.warna,
      });
    } else {
      setEditingVehicle(null);
      setVehicleForm(emptyVehicle);
    }
    setVehicleModal(true);
  };

  const saveVehicle = async () => {
    if (!user) return;
    setSaving(true);
    setError("");
    if (editingVehicle) {
      const { error: err } = await supabase
        .from("vehicles")
        .update(vehicleForm)
        .eq("id", editingVehicle.id);
      if (err) setError(err.message);
    } else {
      const { error: err } = await supabase.from("vehicles").insert({
        ...vehicleForm,
        user_id: user.id,
      });
      if (err) setError(err.message);
    }
    setSaving(false);
    setVehicleModal(false);
    await loadAll();
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
      setBookingForm({
        vehicle_id: b.vehicle_id,
        tanggal: b.tanggal.slice(0, 16),
        jenis_servis: b.jenis_servis ?? "",
        keluhan: b.keluhan ?? "",
      });
    } else {
      setEditingBooking(null);
      setBookingForm({
        vehicle_id: vehicles[0]?.id ?? "",
        tanggal: "",
        jenis_servis: "",
        keluhan: "",
      });
    }
    setBookingModal(true);
  };

  const saveBooking = async () => {
    if (!user) return;
    setSaving(true);
    setError("");
    const payload = {
      vehicle_id: bookingForm.vehicle_id,
      tanggal: new Date(bookingForm.tanggal).toISOString(),
      jenis_servis: bookingForm.jenis_servis,
      keluhan: bookingForm.keluhan,
    };
    if (editingBooking) {
      const { error: err } = await supabase
        .from("bookings")
        .update(payload)
        .eq("id", editingBooking.id);
      if (err) setError(err.message);
    } else {
      const { error: err } = await supabase.from("bookings").insert({
        ...payload,
        user_id: user.id,
        status: "menunggu" as BookingStatus,
      });
      if (err) setError(err.message);
    }
    setSaving(false);
    setBookingModal(false);
    await loadAll();
  };

  const cancelBooking = async (id: string) => {
    if (!confirm("Batalkan booking ini?")) return;
    const { error: err } = await supabase
      .from("bookings")
      .update({ status: "dibatalkan" })
      .eq("id", id);
    if (err) setError(err.message);
    await loadAll();
  };

  const downloadPaymentInvoice = async (payment: Payment) => {
    const { data: service } = await supabase
      .from("services")
      .select("*, vehicles(*), users:user_id(nama,nomor_pelanggan,email,nomor_hp)")
      .eq("id", payment.service_id)
      .maybeSingle();
    if (!service) {
      setError("Data servis tidak ditemukan.");
      return;
    }
    downloadInvoicePdf({
      service: service as ServiceRecord,
      payment,
      customer: profile,
      vehicle: (service as ServiceRecord).vehicles,
    });
  };

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profil", label: "Informasi Pribadi", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "kendaraan", label: "Kendaraan Saya", icon: <Car className="h-4 w-4" /> },
    { id: "servis", label: "Riwayat Servis", icon: <History className="h-4 w-4" /> },
    { id: "pembayaran", label: "Riwayat Pembayaran", icon: <CreditCard className="h-4 w-4" /> },
    { id: "booking", label: "Booking Servis", icon: <Calendar className="h-4 w-4" /> },
  ];

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white/60">
        Memuat profil...
      </div>
    );
  }

  const Sidebar = (
    <aside className="space-y-2">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setTab(item.id);
            setMobileNav(false);
          }}
          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition ${
            tab === item.id
              ? "bg-[#E07A5F] text-white shadow-lg shadow-[#E07A5F]/20"
              : "border border-white/5 bg-[#121212] text-white/70 hover:bg-[#1A1A1A] hover:text-white"
          }`}
        >
          <span className="flex items-center gap-3">
            {item.icon}
            {item.label}
          </span>
        </button>
      ))}
      <Link
        href="/settings"
        className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-[#121212] px-4 py-3 text-sm font-bold text-white/70 transition hover:bg-[#1A1A1A] hover:text-white"
      >
        <Settings className="h-4 w-4" /> Settings
      </Link>
      <button
        onClick={async () => {
          await signOut();
          router.push("/login");
        }}
        className="flex w-full items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/20"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </aside>
  );

  return (
    <div className="min-h-screen pb-20 text-[#F4F1DE]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#121212]/90 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/home" className="text-sm font-semibold text-white/70 hover:text-white">
            ← Auto Craft
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-bold text-white sm:inline">Profil Saya</span>
            <button
              className="rounded-lg border border-white/10 p-2 sm:hidden"
              onClick={() => setMobileNav((v) => !v)}
            >
              {mobileNav ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {(message || error) && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-red-500/40 bg-red-500/10 text-red-300"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            {error || message}
          </div>
        )}

        {/* Profile header */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 overflow-hidden rounded-[28px] border border-white/10 bg-[#121212]"
        >
          <div className="h-28 bg-gradient-to-r from-[#E07A5F]/40 via-[#1f4b7a]/40 to-transparent" />
          <div className="-mt-10 flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar src={profile.foto} name={profile.nama} size={88} className="ring-4 ring-[#121212]" />
              <div className="pb-1">
                <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white sm:text-3xl">
                  {profile.nama}
                </h1>
                <p className="mt-1 text-sm text-white/60">{profile.nomor_pelanggan ?? "—"}</p>
              </div>
            </div>
            <Badge tone={statusTone(profile.status)}>{profile.status}</Badge>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className={`${mobileNav ? "block" : "hidden"} md:block`}>{Sidebar}</div>

          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {tab === "profil" && (
                <motion.div
                  key="profil"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-[28px] border border-white/10 bg-[#121212] p-6 sm:p-8"
                >
                  <h2 className="mb-6 text-xl font-bold text-white">Informasi Pribadi</h2>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Input label="Nama" value={profile.nama} disabled hint="Hanya Admin/Kasir yang dapat mengubah" />
                    <Input
                      label="Nomor Pelanggan"
                      value={profile.nomor_pelanggan ?? ""}
                      disabled
                      hint="Hanya Admin/Kasir yang dapat mengubah"
                    />
                    <Input label="Email" value={profile.email} disabled />
                    <Input
                      label="Nomor Telepon"
                      value={phone}
                      disabled={!editingPhone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <Input label="Tanggal Bergabung" value={formatDate(profile.created_at)} disabled />
                    <Input label="Total Servis" value={String(services.length)} disabled />
                    <div className="sm:col-span-2">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/50">
                        Kendaraan Terdaftar
                      </p>
                      <p className="rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm text-white/80">
                        {vehicles.length === 0
                          ? "Belum ada kendaraan"
                          : vehicles.map((v) => `${v.merk} ${v.tipe} (${v.nomor_polisi})`).join(" · ")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-white/5 pt-5">
                    {!editingPhone ? (
                      <Button onClick={() => setEditingPhone(true)}>Edit Nomor Telepon</Button>
                    ) : (
                      <>
                        <Button variant="secondary" onClick={() => { setEditingPhone(false); setPhone(profile.nomor_hp ?? ""); }}>
                          Batal
                        </Button>
                        <Button onClick={savePhone} disabled={saving}>
                          <Save className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {tab === "kendaraan" && (
                <motion.div
                  key="kendaraan"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-[28px] border border-white/10 bg-[#121212] p-6 sm:p-8"
                >
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold text-white">Kendaraan Saya</h2>
                    <Button size="sm" onClick={() => openVehicleModal()}>
                      <Plus className="h-4 w-4" /> Tambah
                    </Button>
                  </div>
                  {vehicles.length === 0 ? (
                    <div className="rounded-2xl border border-white/5 bg-[#1A1A1A] py-12 text-center">
                      <Car className="mx-auto mb-3 h-10 w-10 text-white/20" />
                      <p className="text-white/50">Belum ada kendaraan.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vehicles.map((car) => (
                        <div
                          key={car.id}
                          className="flex flex-col justify-between gap-4 rounded-2xl border border-white/5 bg-[#1A1A1A] p-5 sm:flex-row sm:items-center"
                        >
                          <div>
                            <h3 className="font-bold text-white">
                              {car.merk} {car.tipe}
                            </h3>
                            <p className="mt-1 text-sm text-white/50">
                              {car.tahun} · {car.warna} ·{" "}
                              <span className="font-semibold text-[#E07A5F]">{car.nomor_polisi}</span>
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => openVehicleModal(car)}>
                              <Edit2 className="h-3.5 w-3.5" /> Edit
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => deleteVehicle(car.id)}>
                              <Trash2 className="h-3.5 w-3.5" /> Hapus
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {tab === "servis" && (
                <motion.div
                  key="servis"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-[28px] border border-white/10 bg-[#121212] p-6 sm:p-8"
                >
                  <h2 className="mb-6 text-xl font-bold text-white">Riwayat Servis</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="text-[11px] uppercase tracking-wider text-white/40">
                        <tr>
                          <th className="pb-3">Tanggal</th>
                          <th className="pb-3">Invoice</th>
                          <th className="pb-3">Kendaraan</th>
                          <th className="pb-3">Jenis Servis</th>
                          <th className="pb-3">Teknisi</th>
                          <th className="pb-3">Total</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map((s) => (
                          <tr
                            key={s.id}
                            onClick={() => setServiceDetail(s)}
                            className="cursor-pointer border-t border-white/5 transition hover:bg-white/[0.03]"
                          >
                            <td className="py-3 text-white/80">{formatDate(s.tanggal)}</td>
                            <td className="py-3 font-semibold text-white">{s.nomor_invoice}</td>
                            <td className="py-3 text-white/70">
                              {s.vehicles ? `${s.vehicles.merk} ${s.vehicles.tipe}` : "—"}
                            </td>
                            <td className="py-3 text-white/70">{s.pekerjaan ?? "—"}</td>
                            <td className="py-3 text-white/70">{s.mekanik ?? "—"}</td>
                            <td className="py-3 text-white">{formatCurrency(Number(s.total))}</td>
                            <td className="py-3">
                              <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {services.length === 0 && (
                      <p className="py-10 text-center text-white/40">Belum ada riwayat servis.</p>
                    )}
                  </div>
                </motion.div>
              )}

              {tab === "pembayaran" && (
                <motion.div
                  key="pembayaran"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-[28px] border border-white/10 bg-[#121212] p-6 sm:p-8"
                >
                  <h2 className="mb-6 text-xl font-bold text-white">Riwayat Pembayaran</h2>
                  <div className="space-y-3">
                    {payments.map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-col justify-between gap-4 rounded-2xl border border-white/5 bg-[#1A1A1A] p-5 sm:flex-row sm:items-center"
                      >
                        <div>
                          <p className="font-bold text-white">
                            {p.nomor_invoice || p.services?.nomor_invoice || "Invoice"}
                          </p>
                          <p className="mt-1 text-sm text-white/50">
                            {formatDateTime(p.created_at)} · {p.metode} ·{" "}
                            <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                          </p>
                          <p className="mt-2 text-lg font-bold text-[#E07A5F]">
                            {formatCurrency(Number(p.total))}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => downloadPaymentInvoice(p)}>
                          <Download className="h-4 w-4" /> Download PDF
                        </Button>
                      </div>
                    ))}
                    {payments.length === 0 && (
                      <p className="py-10 text-center text-white/40">Belum ada pembayaran.</p>
                    )}
                  </div>
                </motion.div>
              )}

              {tab === "booking" && (
                <motion.div
                  key="booking"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-[28px] border border-white/10 bg-[#121212] p-6 sm:p-8"
                >
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold text-white">Booking Servis</h2>
                    <Button
                      size="sm"
                      onClick={() => openBookingModal()}
                      disabled={vehicles.length === 0}
                    >
                      <Plus className="h-4 w-4" /> Buat Booking
                    </Button>
                  </div>
                  {vehicles.length === 0 && (
                    <p className="mb-4 text-sm text-amber-300/80">
                      Tambahkan kendaraan terlebih dahulu sebelum booking.
                    </p>
                  )}
                  <div className="space-y-3">
                    {bookings.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-2xl border border-white/5 bg-[#1A1A1A] p-5"
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <Badge tone={statusTone(b.status)}>{b.status}</Badge>
                              <span className="text-sm text-white/50">{formatDateTime(b.tanggal)}</span>
                            </div>
                            <p className="font-bold text-white">
                              {b.vehicles
                                ? `${b.vehicles.merk} ${b.vehicles.tipe} · ${b.vehicles.nomor_polisi}`
                                : "Kendaraan"}
                            </p>
                            <p className="mt-1 text-sm text-white/60">
                              {b.jenis_servis || "Servis"} {b.keluhan ? `— ${b.keluhan}` : ""}
                            </p>
                            {b.mekanik && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-white/40">
                                <Wrench className="h-3 w-3" /> {b.mekanik}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!["selesai", "dibatalkan", "ditolak"].includes(b.status) && (
                              <>
                                <Button variant="secondary" size="sm" onClick={() => openBookingModal(b)}>
                                  Ubah Jadwal
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => cancelBooking(b.id)}>
                                  Batalkan
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {bookings.length === 0 && (
                      <p className="py-10 text-center text-white/40">Belum ada booking.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Modal open={vehicleModal} onClose={() => setVehicleModal(false)} title={editingVehicle ? "Edit Kendaraan" : "Tambah Kendaraan"}>
        <div className="space-y-4">
          <Input label="Merek" value={vehicleForm.merk} onChange={(e) => setVehicleForm({ ...vehicleForm, merk: e.target.value })} />
          <Input label="Tipe" value={vehicleForm.tipe} onChange={(e) => setVehicleForm({ ...vehicleForm, tipe: e.target.value })} />
          <Input label="Tahun" type="number" value={vehicleForm.tahun} onChange={(e) => setVehicleForm({ ...vehicleForm, tahun: Number(e.target.value) })} />
          <Input label="Nomor Polisi" value={vehicleForm.nomor_polisi} onChange={(e) => setVehicleForm({ ...vehicleForm, nomor_polisi: e.target.value })} />
          <Input label="Warna" value={vehicleForm.warna} onChange={(e) => setVehicleForm({ ...vehicleForm, warna: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setVehicleModal(false)}>Batal</Button>
            <Button onClick={saveVehicle} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={bookingModal} onClose={() => setBookingModal(false)} title={editingBooking ? "Ubah Jadwal" : "Buat Booking"}>
        <div className="space-y-4">
          <Select
            label="Kendaraan"
            value={bookingForm.vehicle_id}
            onChange={(e) => setBookingForm({ ...bookingForm, vehicle_id: e.target.value })}
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.merk} {v.tipe} — {v.nomor_polisi}
              </option>
            ))}
          </Select>
          <Input
            label="Tanggal & Waktu"
            type="datetime-local"
            value={bookingForm.tanggal}
            onChange={(e) => setBookingForm({ ...bookingForm, tanggal: e.target.value })}
          />
          <Input
            label="Jenis Servis"
            value={bookingForm.jenis_servis}
            onChange={(e) => setBookingForm({ ...bookingForm, jenis_servis: e.target.value })}
          />
          <Textarea
            label="Keluhan"
            rows={3}
            value={bookingForm.keluhan}
            onChange={(e) => setBookingForm({ ...bookingForm, keluhan: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setBookingModal(false)}>Batal</Button>
            <Button onClick={saveBooking} disabled={saving || !bookingForm.vehicle_id || !bookingForm.tanggal}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!serviceDetail} onClose={() => setServiceDetail(null)} title="Detail Servis" wide>
        {serviceDetail && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <p><span className="text-white/40">Invoice</span><br />{serviceDetail.nomor_invoice}</p>
              <p><span className="text-white/40">Tanggal</span><br />{formatDate(serviceDetail.tanggal)}</p>
              <p><span className="text-white/40">Teknisi</span><br />{serviceDetail.mekanik ?? "—"}</p>
              <p><span className="text-white/40">Status</span><br /><Badge tone={statusTone(serviceDetail.status)}>{serviceDetail.status}</Badge></p>
              <p className="col-span-2"><span className="text-white/40">Keluhan</span><br />{serviceDetail.keluhan ?? "—"}</p>
              <p className="col-span-2"><span className="text-white/40">Pekerjaan</span><br />{serviceDetail.pekerjaan ?? "—"}</p>
            </div>
            <p className="text-lg font-bold text-[#E07A5F]">{formatCurrency(Number(serviceDetail.total))}</p>
            <Button
              variant="outline"
              onClick={() =>
                downloadInvoicePdf({
                  service: serviceDetail,
                  customer: profile,
                  vehicle: serviceDetail.vehicles,
                })
              }
            >
              <Download className="h-4 w-4" /> Download Invoice PDF
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
