"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { UserProfile, Vehicle } from "@/lib/types/database";

const empty = {
  user_id: "",
  merk: "",
  tipe: "",
  tahun: new Date().getFullYear(),
  nomor_polisi: "",
  warna: "",
};

export default function AdminVehiclesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [v, c] = await Promise.all([
      supabase
        .from("vehicles")
        .select("*, users(id,nama,nomor_pelanggan,email,nomor_hp)")
        .order("created_at", { ascending: false }),
      supabase.from("users").select("*").eq("role", "customer").order("nama"),
    ]);
    setRows((v.data as Vehicle[]) ?? []);
    setCustomers((c.data as UserProfile[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-vehicles")
      .on("postgres_changes", { event: "*", schema: "public", table: "vehicles" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, supabase]);

  const openModal = (row?: Vehicle) => {
    if (row) {
      setEditing(row);
      setForm({
        user_id: row.user_id,
        merk: row.merk,
        tipe: row.tipe,
        tahun: row.tahun,
        nomor_polisi: row.nomor_polisi,
        warna: row.warna,
      });
    } else {
      setEditing(null);
      setForm({ ...empty, user_id: customers[0]?.id ?? "" });
    }
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    if (editing) {
      const { error: err } = await supabase.from("vehicles").update(form).eq("id", editing.id);
      if (err) setError(err.message);
    } else {
      const { error: err } = await supabase.from("vehicles").insert(form);
      if (err) setError(err.message);
    }
    setSaving(false);
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus kendaraan?")) return;
    const { error: err } = await supabase.from("vehicles").delete().eq("id", id);
    if (err) setError(err.message);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Kendaraan</h1>
          <p className="text-sm text-white/50">CRUD kendaraan pelanggan</p>
        </div>
        <Button onClick={() => openModal()} disabled={customers.length === 0}>
          <Plus className="h-4 w-4" /> Tambah
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#121212]">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Merk</th>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3">Tahun</th>
              <th className="px-4 py-3">No. Polisi</th>
              <th className="px-4 py-3">Warna</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/5">
                <td className="px-4 py-3 text-white">{r.users?.nama ?? "—"}</td>
                <td className="px-4 py-3 text-white/80">{r.merk}</td>
                <td className="px-4 py-3 text-white/80">{r.tipe}</td>
                <td className="px-4 py-3 text-white/80">{r.tahun}</td>
                <td className="px-4 py-3 font-semibold text-[#E07A5F]">{r.nomor_polisi}</td>
                <td className="px-4 py-3 text-white/80">{r.warna}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openModal(r)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => remove(r.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Kendaraan" : "Tambah Kendaraan"}>
        <div className="space-y-4">
          <Select label="Customer" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nama} ({c.nomor_pelanggan})
              </option>
            ))}
          </Select>
          <Input label="Merk" value={form.merk} onChange={(e) => setForm({ ...form, merk: e.target.value })} />
          <Input label="Tipe" value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })} />
          <Input label="Tahun" type="number" value={form.tahun} onChange={(e) => setForm({ ...form, tahun: Number(e.target.value) })} />
          <Input label="Nomor Polisi" value={form.nomor_polisi} onChange={(e) => setForm({ ...form, nomor_polisi: e.target.value })} />
          <Input label="Warna" value={form.warna} onChange={(e) => setForm({ ...form, warna: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
