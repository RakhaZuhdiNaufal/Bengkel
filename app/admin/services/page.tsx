"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate, sumLineItems } from "@/lib/format";
import type {
  LineItem,
  ServiceRecord,
  ServiceStatus,
  UserProfile,
  Vehicle,
} from "@/lib/types/database";

function parseItems(raw: string): LineItem[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [nama, qty, harga] = line.split("|").map((p) => p.trim());
      return {
        nama: nama || "Item",
        qty: Number(qty) || 1,
        harga: Number(harga) || 0,
      };
    });
}

function itemsToText(items: LineItem[]) {
  return items.map((i) => `${i.nama}|${i.qty}|${i.harga}`).join("\n");
}

export default function AdminServicesPage() {
  const supabase = useMemo(() => createClient(), []);
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState<ServiceRecord[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    user_id: "",
    vehicle_id: "",
    booking_id: "",
    tanggal: new Date().toISOString().slice(0, 10),
    mekanik: "",
    keluhan: "",
    pekerjaan: "",
    sparepartText: "",
    jasaText: "",
    status: "proses" as ServiceStatus,
  });

  const load = useCallback(async () => {
    const [s, c, v] = await Promise.all([
      supabase
        .from("services")
        .select("*, users(id,nama,nomor_pelanggan,email,nomor_hp), vehicles(id,merk,tipe,nomor_polisi,warna,tahun)")
        .order("tanggal", { ascending: false }),
      supabase.from("users").select("*").eq("role", "customer").order("nama"),
      supabase.from("vehicles").select("*"),
    ]);
    setRows((s.data as ServiceRecord[]) ?? []);
    setCustomers((c.data as UserProfile[]) ?? []);
    setVehicles((v.data as Vehicle[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-services")
      .on("postgres_changes", { event: "*", schema: "public", table: "services" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, supabase]);

  const customerVehicles = vehicles.filter((v) => v.user_id === form.user_id);

  const openModal = (row?: ServiceRecord) => {
    if (row) {
      setEditing(row);
      setForm({
        user_id: row.user_id,
        vehicle_id: row.vehicle_id,
        booking_id: row.booking_id ?? "",
        tanggal: row.tanggal,
        mekanik: row.mekanik ?? "",
        keluhan: row.keluhan ?? "",
        pekerjaan: row.pekerjaan ?? "",
        sparepartText: itemsToText(row.sparepart ?? []),
        jasaText: itemsToText(row.jasa ?? []),
        status: row.status,
      });
    } else {
      setEditing(null);
      setForm({
        user_id: customers[0]?.id ?? "",
        vehicle_id: "",
        booking_id: "",
        tanggal: new Date().toISOString().slice(0, 10),
        mekanik: "",
        keluhan: "",
        pekerjaan: "",
        sparepartText: "",
        jasaText: "Servis rutin|1|250000",
        status: "proses",
      });
    }
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    const sparepart = parseItems(form.sparepartText);
    const jasa = parseItems(form.jasaText);
    const total = sumLineItems(sparepart) + sumLineItems(jasa);
    const payload = {
      user_id: form.user_id,
      vehicle_id: form.vehicle_id,
      booking_id: form.booking_id || null,
      tanggal: form.tanggal,
      mekanik: form.mekanik,
      keluhan: form.keluhan,
      pekerjaan: form.pekerjaan,
      sparepart,
      jasa,
      total,
      status: form.status,
    };

    if (editing) {
      const { error: err } = await supabase.from("services").update(payload).eq("id", editing.id);
      if (err) setError(err.message);
    } else {
      const { error: err } = await supabase.from("services").insert(payload);
      if (err) setError(err.message);
    }
    setSaving(false);
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("Hapus servis?")) return;
    const { error: err } = await supabase.from("services").delete().eq("id", id);
    if (err) setError(err.message);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Servis</h1>
          <p className="text-sm text-white/50">CRUD pekerjaan servis</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="h-4 w-4" /> Tambah
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#121212]">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Kendaraan</th>
              <th className="px-4 py-3">Teknisi</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/5">
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{r.nomor_invoice}</p>
                  <p className="text-xs text-white/40">{formatDate(r.tanggal)}</p>
                </td>
                <td className="px-4 py-3 text-white/80">{r.users?.nama}</td>
                <td className="px-4 py-3 text-white/70">
                  {r.vehicles ? `${r.vehicles.merk} ${r.vehicles.tipe}` : "—"}
                </td>
                <td className="px-4 py-3 text-white/70">{r.mekanik ?? "—"}</td>
                <td className="px-4 py-3 text-white">{formatCurrency(Number(r.total))}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openModal(r)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    {isAdmin && (
                      <Button variant="danger" size="sm" onClick={() => remove(r.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Servis" : "Tambah Servis"} wide>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Customer" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value, vehicle_id: "" })}>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.nama}</option>
            ))}
          </Select>
          <Select label="Kendaraan" value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
            <option value="">Pilih kendaraan</option>
            {customerVehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.merk} {v.tipe} — {v.nomor_polisi}</option>
            ))}
          </Select>
          <Input label="Tanggal" type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
          <Input label="Teknisi" value={form.mekanik} onChange={(e) => setForm({ ...form, mekanik: e.target.value })} />
          <Input label="Pekerjaan / Jenis Servis" value={form.pekerjaan} onChange={(e) => setForm({ ...form, pekerjaan: e.target.value })} />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ServiceStatus })}>
            <option value="proses">Proses</option>
            <option value="selesai">Selesai</option>
            <option value="dibatalkan">Dibatalkan</option>
          </Select>
          <div className="sm:col-span-2">
            <Textarea label="Keluhan" rows={2} value={form.keluhan} onChange={(e) => setForm({ ...form, keluhan: e.target.value })} />
          </div>
          <Textarea
            label="Jasa (nama|qty|harga per baris)"
            rows={3}
            value={form.jasaText}
            onChange={(e) => setForm({ ...form, jasaText: e.target.value })}
          />
          <Textarea
            label="Sparepart (nama|qty|harga per baris)"
            rows={3}
            value={form.sparepartText}
            onChange={(e) => setForm({ ...form, sparepartText: e.target.value })}
          />
        </div>
        <p className="mt-4 text-sm text-white/60">
          Total otomatis:{" "}
          <span className="font-bold text-[#E07A5F]">
            {formatCurrency(sumLineItems(parseItems(form.jasaText)) + sumLineItems(parseItems(form.sparepartText)))}
          </span>
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
          <Button onClick={save} disabled={saving || !form.user_id || !form.vehicle_id}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
