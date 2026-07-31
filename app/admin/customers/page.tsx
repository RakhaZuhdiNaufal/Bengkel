"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RotateCcw, Trash2, Edit2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { UserProfile, UserRole, UserStatus } from "@/lib/types/database";

const emptyForm = {
  nama: "",
  email: "",
  nomor_hp: "",
  nomor_pelanggan: "",
  status: "aktif" as UserStatus,
  role: "customer" as UserRole,
  password: "",
};

export default function AdminCustomersPage() {
  const supabase = useMemo(() => createClient(), []);
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState<UserProfile[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserProfile | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    setRows((data as UserProfile[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-customers")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, supabase]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (u: UserProfile) => {
    setEditing(u);
    setForm({
      nama: u.nama,
      email: u.email,
      nomor_hp: u.nomor_hp ?? "",
      nomor_pelanggan: u.nomor_pelanggan ?? "",
      status: u.status,
      role: u.role,
      password: "",
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError("");

    if (editing) {
      const payload: Partial<UserProfile> = {
        nama: form.nama,
        nomor_hp: form.nomor_hp,
        nomor_pelanggan: form.nomor_pelanggan || null,
        status: form.status,
      };
      if (isAdmin) payload.role = form.role;
      const { error: err } = await supabase.from("users").update(payload).eq("id", editing.id);
      if (err) setError(err.message);
    } else {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          nama: form.nama,
          nomor_hp: form.nomor_hp,
          nomor_pelanggan: form.nomor_pelanggan,
          status: form.status,
          role: form.role,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Gagal membuat user");
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    if (!isAdmin) {
      setError("Hanya admin yang dapat menghapus user.");
      return;
    }
    if (!confirm("Hapus customer ini? Data terkait ikut terpengaruh.")) return;
    const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) setError(json.error || "Gagal menghapus user");
    await load();
  };

  const resetPassword = async (u: UserProfile) => {
    const { error: err } = await supabase.auth.resetPasswordForEmail(u.email, {
      redirectTo: `${window.location.origin}/lupa-password`,
    });
    if (err) setError(err.message);
    else alert(`Link reset password dikirim ke ${u.email}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Customer</h1>
          <p className="text-sm text-white/50">Kelola data pelanggan, kasir, dan admin</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#121212]">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-4 py-3">Foto</th>
              <th className="px-4 py-3">No. Pelanggan</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">HP</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <Avatar src={u.foto} name={u.nama} size={36} />
                </td>
                <td className="px-4 py-3 text-white/80">{u.nomor_pelanggan ?? "—"}</td>
                <td className="px-4 py-3 font-semibold text-white">
                  {u.nama}
                  <div className="mt-1">
                    <Badge tone={statusTone(u.role)}>{u.role}</Badge>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/70">{u.nomor_hp ?? "—"}</td>
                <td className="px-4 py-3 text-white/70">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(u.status)}>{u.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEdit(u)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => resetPassword(u)}>
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                    {isAdmin && (
                      <Button variant="danger" size="sm" onClick={() => remove(u.id)}>
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

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit User" : "Tambah User"}>
        <div className="space-y-4">
          <Input label="Nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          {!editing && (
            <>
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Password sementara" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} hint="Kosongkan untuk generate otomatis" />
            </>
          )}
          <Input label="Nomor Pelanggan" value={form.nomor_pelanggan} onChange={(e) => setForm({ ...form, nomor_pelanggan: e.target.value })} />
          <Input label="Nomor HP" value={form.nomor_hp} onChange={(e) => setForm({ ...form, nomor_hp: e.target.value })} />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })}>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
            <option value="suspended">Suspended</option>
          </Select>
          {isAdmin && (
            <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
              <option value="customer">Customer</option>
              <option value="kasir">Kasir</option>
              <option value="admin">Admin</option>
            </Select>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
