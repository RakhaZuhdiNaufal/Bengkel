"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { downloadInvoicePdf } from "@/lib/pdf";
import type {
  Payment,
  PaymentMethod,
  PaymentStatus,
  ServiceRecord,
} from "@/lib/types/database";

export default function AdminPaymentsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<Payment[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    service_id: "",
    metode: "tunai" as PaymentMethod,
    status: "lunas" as PaymentStatus,
    total: 0,
  });

  const load = useCallback(async () => {
    const [p, s] = await Promise.all([
      supabase
        .from("payments")
        .select("*, services(id,nomor_invoice,tanggal,pekerjaan), users(id,nama,nomor_pelanggan)")
        .order("created_at", { ascending: false }),
      supabase
        .from("services")
        .select("*, users(id,nama,nomor_pelanggan,email,nomor_hp), vehicles(id,merk,tipe,nomor_polisi,warna,tahun)")
        .order("tanggal", { ascending: false }),
    ]);
    setRows((p.data as Payment[]) ?? []);
    setServices((s.data as ServiceRecord[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-payments")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, supabase]);

  const selectedService = services.find((s) => s.id === form.service_id);

  useEffect(() => {
    if (selectedService) {
      setForm((f) => ({ ...f, total: Number(selectedService.total) }));
    }
  }, [selectedService]);

  const createPayment = async () => {
    if (!selectedService) return;
    setSaving(true);
    setError("");
    const { error: err } = await supabase.from("payments").insert({
      service_id: selectedService.id,
      user_id: selectedService.user_id,
      nomor_invoice: selectedService.nomor_invoice,
      metode: form.metode,
      total: form.total,
      status: form.status,
      paid_at: form.status === "lunas" ? new Date().toISOString() : null,
    });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setOpen(false);
    await load();
  };

  const updateStatus = async (id: string, status: PaymentStatus) => {
    const { error: err } = await supabase
      .from("payments")
      .update({
        status,
        paid_at: status === "lunas" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    if (err) setError(err.message);
    await load();
  };

  const downloadPdf = async (payment: Payment) => {
    const service = services.find((s) => s.id === payment.service_id);
    if (!service) {
      setError("Servis terkait tidak ditemukan.");
      return;
    }
    downloadInvoicePdf({
      service,
      payment,
      customer: service.users,
      vehicle: service.vehicles,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Pembayaran</h1>
          <p className="text-sm text-white/50">Invoice, status, dan PDF</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Buat Invoice
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
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Metode</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/5">
                <td className="px-4 py-3 font-semibold text-white">
                  {r.nomor_invoice || r.services?.nomor_invoice}
                </td>
                <td className="px-4 py-3 text-white/80">{r.users?.nama}</td>
                <td className="px-4 py-3 text-white/70">{formatDateTime(r.created_at)}</td>
                <td className="px-4 py-3 text-white/70">{r.metode}</td>
                <td className="px-4 py-3 text-white">{formatCurrency(Number(r.total))}</td>
                <td className="px-4 py-3">
                  <Select
                    value={r.status}
                    onChange={(e) => updateStatus(r.id, e.target.value as PaymentStatus)}
                    className="py-2"
                  >
                    <option value="pending">pending</option>
                    <option value="lunas">lunas</option>
                    <option value="gagal">gagal</option>
                    <option value="refund">refund</option>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm" onClick={() => downloadPdf(r)}>
                    <Download className="h-3.5 w-3.5" /> PDF
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Buat Invoice Pembayaran">
        <div className="space-y-4">
          <Select
            label="Servis / Invoice"
            value={form.service_id}
            onChange={(e) => setForm({ ...form, service_id: e.target.value })}
          >
            <option value="">Pilih servis</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nomor_invoice} — {s.users?.nama} — {formatCurrency(Number(s.total))}
              </option>
            ))}
          </Select>
          <Select
            label="Metode"
            value={form.metode}
            onChange={(e) => setForm({ ...form, metode: e.target.value as PaymentMethod })}
          >
            <option value="tunai">Tunai</option>
            <option value="transfer">Transfer</option>
            <option value="qris">QRIS</option>
            <option value="kartu">Kartu</option>
            <option value="dp">DP</option>
          </Select>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as PaymentStatus })}
          >
            <option value="pending">Pending</option>
            <option value="lunas">Lunas</option>
          </Select>
          <Input
            label="Total"
            type="number"
            value={form.total}
            onChange={(e) => setForm({ ...form, total: Number(e.target.value) })}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={createPayment} disabled={saving || !form.service_id}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
