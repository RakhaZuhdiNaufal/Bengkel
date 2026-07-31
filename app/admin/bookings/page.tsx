"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatDateTime } from "@/lib/format";
import type { Booking, BookingStatus } from "@/lib/types/database";

const statuses: BookingStatus[] = [
  "menunggu",
  "diproses",
  "diterima",
  "ditolak",
  "selesai",
  "dibatalkan",
];

export default function AdminBookingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<Booking[]>([]);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [status, setStatus] = useState<BookingStatus>("menunggu");
  const [mekanik, setMekanik] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*, users(id,nama,nomor_pelanggan,nomor_hp), vehicles(id,merk,tipe,nomor_polisi,warna,tahun)")
      .order("tanggal", { ascending: false });
    setRows((data as Booking[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, supabase]);

  const openEdit = (b: Booking) => {
    setEditing(b);
    setStatus(b.status);
    setMekanik(b.mekanik ?? "");
    setTanggal(b.tanggal.slice(0, 16));
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setError("");
    const { error: err } = await supabase
      .from("bookings")
      .update({
        status,
        mekanik,
        tanggal: new Date(tanggal).toISOString(),
      })
      .eq("id", editing.id);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setEditing(null);
    await load();
  };

  const cancel = async (id: string) => {
    if (!confirm("Batalkan booking?")) return;
    await supabase.from("bookings").update({ status: "dibatalkan" }).eq("id", id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Booking</h1>
        <p className="text-sm text-white/50">Status realtime · jadwalkan mekanik</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#121212]">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Kendaraan</th>
              <th className="px-4 py-3">Jenis</th>
              <th className="px-4 py-3">Mekanik</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-t border-white/5">
                <td className="px-4 py-3 text-white/80">{formatDateTime(b.tanggal)}</td>
                <td className="px-4 py-3 text-white">{b.users?.nama}</td>
                <td className="px-4 py-3 text-white/70">
                  {b.vehicles ? `${b.vehicles.merk} ${b.vehicles.tipe}` : "—"}
                </td>
                <td className="px-4 py-3 text-white/70">{b.jenis_servis ?? "—"}</td>
                <td className="px-4 py-3 text-white/70">{b.mekanik ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(b.status)}>{b.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEdit(b)}>
                      Kelola
                    </Button>
                    {!["dibatalkan", "selesai", "ditolak"].includes(b.status) && (
                      <Button variant="danger" size="sm" onClick={() => cancel(b.id)}>
                        Batalkan
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Kelola Booking">
        <div className="space-y-4">
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)}>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Input label="Mekanik" value={mekanik} onChange={(e) => setMekanik(e.target.value)} />
          <Input
            label="Jadwal"
            type="datetime-local"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>Batal</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
