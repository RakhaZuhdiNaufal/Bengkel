"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

type Payment = {
  id: string;
  nomor_invoice: string;
  total: number;
  metode: string;
  status: string;
  paid_at: string;
  users: { nama: string; nomor_hp: string };
  services: { pekerjaan: string; sparepart: any[]; jasa: any[] };
  vehicles: { merk: string; tipe: string; nomor_polisi: string };
};

export default function InvoicePrintPage() {
  const params = useParams();
  const id = params.id as string;
  const [payment, setPayment] = useState<Payment | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (id) fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    // Perlu join ke services, lalu dari services join ke vehicles untuk pelat nomor
    const { data } = await supabase
      .from("payments")
      .select(`
        *,
        users (nama, nomor_hp),
        services (pekerjaan, sparepart, jasa, vehicles (merk, tipe, nomor_polisi))
      `)
      .eq("id", id)
      .single();

    if (data) {
      // Ratakan struktur agar gampang dibaca
      const formattedData: any = {
        ...data,
        vehicles: data.services?.vehicles
      };
      setPayment(formattedData);
      
      // Auto print saat selesai load (opsional, tapi mempermudah kasir)
      setTimeout(() => {
        window.print();
      }, 500);
    }
  };

  if (!payment) return <div className="p-4">Memuat struk...</div>;

  return (
    <div className="bg-white text-black min-h-screen flex justify-center py-8 print:py-0 print:bg-transparent">
      {/* Container dengan lebar pas untuk printer thermal 80mm (~300px / 80mm) */}
      <div className="w-[300px] bg-white p-4 font-mono text-sm leading-tight shadow-2xl print:shadow-none print:w-full print:p-0">
        
        {/* Header Struk */}
        <div className="text-center border-b border-black border-dashed pb-3 mb-3">
          <h1 className="font-bold text-lg tracking-widest uppercase">Auto Craft</h1>
          <p className="text-xs">Jl. Bengkel Hebat No. 1</p>
          <p className="text-xs">Telp: 0812-3456-7890</p>
        </div>

        {/* Info Transaksi */}
        <div className="text-xs space-y-1 border-b border-black border-dashed pb-3 mb-3">
          <div className="flex justify-between">
            <span>Tgl:</span>
            <span>{dayjs(payment.paid_at || new Date()).format("DD/MM/YY HH:mm")}</span>
          </div>
          <div className="flex justify-between">
            <span>No:</span>
            <span>{payment.nomor_invoice}</span>
          </div>
          <div className="flex justify-between">
            <span>Plg:</span>
            <span className="text-right truncate ml-2">{payment.users?.nama}</span>
          </div>
          <div className="flex justify-between">
            <span>Kendaraan:</span>
            <span className="text-right">{payment.vehicles?.nomor_polisi || "-"}</span>
          </div>
          </div>
        </div>

        {/* Item Sparepart */}
        {payment.services?.sparepart?.length > 0 && (
          <div className="border-b border-black border-dashed pb-3 mb-3 text-xs">
            <div className="font-bold mb-1">SPAREPART</div>
            {payment.services.sparepart.map((sp, idx) => (
              <div key={idx} className="mb-1">
                <div className="truncate">{sp.nama}</div>
                <div className="flex justify-between pl-2">
                  <span>{sp.qty} x {Number(sp.harga_jual).toLocaleString("id-ID")}</span>
                  <span>{(sp.qty * Number(sp.harga_jual)).toLocaleString("id-ID")}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Item Jasa */}
        {payment.services?.jasa?.length > 0 && (
          <div className="border-b border-black border-dashed pb-3 mb-3 text-xs">
            <div className="font-bold mb-1">JASA SERVIS</div>
            {payment.services.jasa.map((js, idx) => (
              <div key={idx} className="mb-1 flex justify-between">
                <span className="truncate pr-2">{js.nama}</span>
                <span>{Number(js.harga).toLocaleString("id-ID")}</span>
              </div>
            ))}
          </div>
        )}

        {/* Total & Pembayaran */}
        <div className="text-xs space-y-1 mb-4">
          <div className="flex justify-between font-bold text-sm">
            <span>TOTAL:</span>
            <span>Rp {payment.total.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between uppercase">
            <span>BAYAR ({payment.metode}):</span>
            <span>LUNAS</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs">
          <p>Terima kasih atas kunjungan Anda!</p>
          <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
          <div className="mt-4 border-t border-black pt-2">
            *** CUSTOMER COPY ***
          </div>
        </div>

      </div>

      {/* CSS Khusus Print (Sembunyikan tombol browser, hilangkan margin) */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:bg-transparent {
            background-color: transparent !important;
          }
          .w-\\[300px\\] {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm !important; /* Lebar thermal standar */
            padding: 0 !important;
            margin: 0 !important;
          }
          .w-\\[300px\\] * {
            visibility: visible;
          }
        }
      `}} />
    </div>
  );
}
