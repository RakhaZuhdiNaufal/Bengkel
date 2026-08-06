"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

export default function InvoicePrint({ params }: { params: { id: string } }) {
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadPayment() {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          users (nama, nomor_hp, email),
          services (nomor_invoice, pekerjaan, sparepart, jasa, keluhan, total, vehicles (merk, tipe, nomor_polisi)),
          bookings (tanggal, booking_date, vehicles (merk, tipe, nomor_polisi))
        `)
        .eq("id", params.id)
        .single();
        
      if (data) {
        setPayment(data);
      }
      setLoading(false);
      
      // Auto trigger print dialog after small delay to ensure rendering
      setTimeout(() => {
        window.print();
      }, 500);
    }
    
    loadPayment();
  }, [params.id, supabase]);

  if (loading) return <div className="p-10 text-center font-mono">Memuat Invoice...</div>;
  if (!payment) return <div className="p-10 text-center font-mono text-red-500">Invoice tidak ditemukan.</div>;

  const vehicle = payment.bookings?.vehicles || payment.services?.vehicles;
  const isDeposit = payment.metode === 'dp';
  
  // Hitung subtotal untuk layanan jika ada (opsional)
  const serviceSubtotal = payment.services?.total || payment.total;

  return (
    <div className="bg-white text-black min-h-screen font-sans p-8 print:p-0">
      <div className="max-w-3xl mx-auto border border-gray-200 p-10 print:border-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">AUTO CRAFT</h1>
            <p className="text-sm text-gray-600 mt-1">Premium Auto Service & Detailing</p>
            <p className="text-xs text-gray-500 mt-1">Jl. Sudirman No. 123, Jakarta Selatan<br/>Telp: 021-555-1234</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold uppercase text-gray-800">INVOICE</h2>
            <div className="mt-2 text-sm">
              <span className="text-gray-500">No. Invoice:</span>
              <span className="font-mono font-bold ml-2">{payment.nomor_invoice}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Tanggal:</span>
              <span className="ml-2 font-semibold">{dayjs(payment.paid_at || payment.created_at).format('DD MMM YYYY, HH:mm')}</span>
            </div>
            <div className="mt-3 inline-block bg-gray-100 px-3 py-1 rounded font-bold uppercase text-xs tracking-widest border border-gray-300">
              {payment.status}
            </div>
          </div>
        </div>

        {/* Customer & Vehicle Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ditagihkan Kepada</h3>
            <p className="font-bold text-lg">{payment.users?.nama}</p>
            <p className="text-gray-600 text-sm">{payment.users?.nomor_hp}</p>
            <p className="text-gray-600 text-sm">{payment.users?.email}</p>
          </div>
          {vehicle && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Informasi Kendaraan</h3>
              <p className="font-bold text-lg">{vehicle.merk} {vehicle.tipe}</p>
              <p className="font-mono font-bold text-lg border border-gray-300 inline-block px-3 py-1 mt-1 rounded bg-gray-50">
                {vehicle.nomor_polisi}
              </p>
            </div>
          )}
        </div>

        {/* Invoice Type Alert */}
        {isDeposit && (
          <div className="bg-gray-100 border border-gray-300 p-4 rounded mb-8 text-center text-sm font-semibold">
            Nota ini merupakan bukti pembayaran Uang Muka (Deposit). Sisa tagihan akan dibayarkan setelah servis selesai.
          </div>
        )}

        {/* Line Items */}
        <table className="w-full text-left mb-8 border-collapse">
          <thead>
            <tr className="border-b border-gray-300 text-sm">
              <th className="py-3 px-2 text-gray-600 uppercase tracking-wider font-semibold w-12">No</th>
              <th className="py-3 px-2 text-gray-600 uppercase tracking-wider font-semibold">Deskripsi Layanan</th>
              <th className="py-3 px-2 text-gray-600 uppercase tracking-wider font-semibold text-right">Nominal</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-4 px-2 text-sm text-gray-600">1</td>
              <td className="py-4 px-2">
                <p className="font-bold">{payment.services?.pekerjaan || "Servis Reguler"}</p>
                {isDeposit ? (
                  <p className="text-sm text-gray-500 mt-1">Pembayaran Deposit (Estimasi 30%)</p>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">Pelunasan biaya servis dan pergantian suku cadang.</p>
                )}
              </td>
              <td className="py-4 px-2 text-right font-mono font-bold">
                Rp {payment.total.toLocaleString("id-ID")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-mono">Rp {payment.total.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between py-3 font-black text-xl">
              <span>TOTAL</span>
              <span className="font-mono">Rp {payment.total.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-8 flex justify-between text-sm text-gray-500">
          <div>
            <p className="font-bold text-gray-700 mb-1">Metode Pembayaran:</p>
            <p className="uppercase">{payment.metode === 'dp' ? 'Transfer (Deposit)' : payment.metode}</p>
          </div>
          <div className="text-right">
            <p className="mb-8">Hormat Kami,</p>
            <p className="font-bold text-gray-800">Auto Craft Administrator</p>
          </div>
        </div>
        
        <div className="mt-12 text-center text-xs text-gray-400 print:mt-16">
          Terima kasih telah mempercayakan kendaraan Anda kepada Auto Craft.<br/>
          Garansi servis berlaku selama 7 hari sejak tanggal pengambilan kendaraan.
        </div>
      </div>

      {/* Non-print action buttons */}
      <div className="fixed bottom-8 right-8 flex gap-4 print:hidden">
        <button 
          onClick={() => window.close()}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-bold shadow-lg hover:bg-gray-300 transition"
        >
          Tutup
        </button>
        <button 
          onClick={() => window.print()}
          className="px-6 py-3 bg-black text-white rounded-full font-bold shadow-lg hover:bg-gray-800 transition"
        >
          Cetak Ulang
        </button>
      </div>
    </div>
  );
}
