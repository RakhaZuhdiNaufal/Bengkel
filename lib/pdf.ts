import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/format";
import type { LineItem, Payment, ServiceRecord, UserProfile, Vehicle } from "@/lib/types/database";

interface InvoiceData {
  service: ServiceRecord;
  payment?: Payment | null;
  customer?: Pick<UserProfile, "nama" | "nomor_pelanggan" | "email" | "nomor_hp"> | null;
  vehicle?: Pick<Vehicle, "merk" | "tipe" | "nomor_polisi" | "tahun" | "warna"> | null;
}

function lineRows(items: LineItem[]) {
  return items.map((i) => [
    i.nama,
    String(i.qty),
    formatCurrency(i.harga),
    formatCurrency(i.qty * i.harga),
  ]);
}

export function downloadInvoicePdf(data: InvoiceData) {
  const doc = new jsPDF();
  const invoice =
    data.service.nomor_invoice ||
    data.payment?.nomor_invoice ||
    data.service.id.slice(0, 8).toUpperCase();

  doc.setFontSize(18);
  doc.text("AUTO CRAFT", 14, 20);
  doc.setFontSize(11);
  doc.text("Invoice Servis", 14, 28);
  doc.text(`No: ${invoice}`, 14, 34);
  doc.text(`Tanggal: ${formatDate(data.service.tanggal)}`, 14, 40);

  doc.text(`Pelanggan: ${data.customer?.nama ?? "—"}`, 14, 52);
  doc.text(`No. Pelanggan: ${data.customer?.nomor_pelanggan ?? "—"}`, 14, 58);
  doc.text(`Telepon: ${data.customer?.nomor_hp ?? "—"}`, 14, 64);

  if (data.vehicle) {
    doc.text(
      `Kendaraan: ${data.vehicle.merk} ${data.vehicle.tipe} (${data.vehicle.tahun})`,
      14,
      76
    );
    doc.text(`No. Polisi: ${data.vehicle.nomor_polisi}`, 14, 82);
  }

  const jasa = data.service.jasa ?? [];
  const sparepart = data.service.sparepart ?? [];

  autoTable(doc, {
    startY: 92,
    head: [["Item", "Qty", "Harga", "Subtotal"]],
    body: [...lineRows(jasa), ...lineRows(sparepart)],
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? 120;

  doc.text(`Teknisi: ${data.service.mekanik ?? "—"}`, 14, finalY + 12);
  doc.text(`Status: ${data.payment?.status ?? data.service.status}`, 14, finalY + 18);
  doc.setFontSize(13);
  doc.text(`Total: ${formatCurrency(Number(data.service.total))}`, 14, finalY + 28);
  if (data.payment) {
    doc.setFontSize(11);
    doc.text(`Metode: ${data.payment.metode}`, 14, finalY + 36);
  }

  doc.save(`${invoice}.pdf`);
}

export function exportRowsToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join(
    "\n"
  );
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
