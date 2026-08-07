"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

export default function ThermalReceiptPrint({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    async function loadPayment() {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          users (nama, nomor_hp, email),
          services (nomor_invoice, pekerjaan, sparepart, jasa, keluhan, total, vehicles (merk, tipe, nomor_polisi)),
          bookings (tanggal, vehicles (merk, tipe, nomor_polisi))
        `)
        .eq("id", id)
        .single();
        
      if (error) {
        setErrorMsg(error.message);
        console.error("Supabase Error:", error);
      }
      
      if (data) {
        setPayment(data);
      }
      setLoading(false);
      
      // Auto trigger print dialog
      setTimeout(() => {
        window.print();
      }, 500);
    }
    
    loadPayment();
  }, [id, supabase]);

  if (loading) return <div className="p-10 text-center font-mono">Memuat Struk...</div>;
  if (errorMsg) return <div className="p-10 text-center font-mono text-red-500">Error DB: {errorMsg}</div>;
  if (!payment) return <div className="p-10 text-center font-mono text-red-500">Struk tidak ditemukan.</div>;

  const vehicle = payment.bookings?.vehicles || payment.services?.vehicles;
  const isDeposit = payment.metode === 'dp';
  
  // Calculate parts and labor
  const spareparts = payment.services?.sparepart || [];
  const jasas = payment.services?.jasa || [];
  
  // Get original total if it's a final payment and there was a deposit
  // For thermal receipt, we just need to show what is paid now.
  
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            margin: 0;
            size: 80mm 297mm; /* Standard 80mm thermal paper width */
          }
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          /* Hide scrollbar for printing */
          ::-webkit-scrollbar {
            display: none;
          }
        }
        body {
          background: #f0f0f0; /* Darker bg on screen to show the paper clearly */
        }
      `}} />

      {/* Screen container (centers the receipt on screen) */}
      <div className="min-h-screen flex items-start justify-center py-10 print:py-0 print:block">
        
        {/* Receipt Paper Area (Max width ~300px for 80mm) */}
        <div className="bg-white text-black font-mono text-[12px] leading-tight w-[300px] p-4 mx-auto shadow-xl print:shadow-none print:w-full print:p-2">
          
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold uppercase tracking-widest mb-1">AUTO CRAFT</h1>
            <p className="text-[10px]">Premium Auto Service</p>
            <p className="text-[10px]">Jl. Sudirman No. 123, Jaksel</p>
            <p className="text-[10px]">Telp: 021-555-1234</p>
          </div>

          <div className="border-t border-dashed border-black my-2"></div>

          {/* Info */}
          <div className="mb-2">
            <div className="flex justify-between">
              <span>Waktu</span>
              <span>{dayjs(payment.paid_at || payment.created_at).format('DD/MM/YY HH:mm')}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir</span>
              <span>Admin/Kasir</span>
            </div>
            <div className="flex justify-between">
              <span>Nota</span>
              <span>{payment.nomor_invoice}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-black my-2"></div>

          {/* Customer */}
          <div className="mb-2">
            <div className="flex justify-between">
              <span>Pelanggan:</span>
              <span className="font-bold text-right">{payment.users?.nama}</span>
            </div>
            {vehicle && (
              <div className="flex justify-between">
                <span>Kendaraan:</span>
                <span className="font-bold text-right">{vehicle.nomor_polisi}</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-black my-2"></div>

          {/* Items */}
          <div className="mb-2">
            <div className="font-bold mb-1 uppercase text-center">{isDeposit ? 'Deposit / Uang Muka' : 'Pelunasan Servis'}</div>
            
            {/* Spareparts */}
            {spareparts.length > 0 && (
              <div className="mt-2">
                <div className="font-bold mb-1 border-b border-black inline-block">SPAREPART</div>
                {spareparts.map((item: any, idx: number) => (
                  <div key={idx} className="mb-1">
                    <div>{item.nama}</div>
                    <div className="flex justify-between pl-2">
                      <span>{item.qty || 1} x {(item.harga || 0).toLocaleString("id-ID")}</span>
                      <span>{((item.qty || 1) * (item.harga || 0)).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Jasa */}
            {jasas.length > 0 && (
              <div className="mt-2">
                <div className="font-bold mb-1 border-b border-black inline-block">JASA / LAYANAN</div>
                {jasas.map((item: any, idx: number) => (
                  <div key={idx} className="mb-1">
                    <div>{item.nama}</div>
                    <div className="flex justify-end">
                      <span>{(item.harga || 0).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* If there's no detailed items, just show the job description */}
            {spareparts.length === 0 && jasas.length === 0 && (
              <div className="mb-1">
                <div>{payment.services?.pekerjaan || "Servis Kendaraan"}</div>
                <div className="flex justify-end">
                  <span>{payment.total.toLocaleString("id-ID")}</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-black my-2"></div>

          {/* Totals */}
          <div className="mb-4 space-y-1">
            <div className="flex justify-between text-sm font-bold">
              <span>TOTAL</span>
              <span>Rp {payment.total.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span className="uppercase">{payment.metode || 'TUNAI'}</span>
              <span>Rp {payment.total.toLocaleString("id-ID")}</span>
            </div>
            {/* Usually thermal receipts show kembalian, but we don't store it in DB. Assume Uang Pas or just don't show. */}
          </div>

          <div className="border-t border-black my-2"></div>
          <div className="border-t border-black my-1"></div>

          {/* Footer */}
          <div className="text-center text-[10px] mt-4 space-y-1">
            <p className="font-bold">TERIMA KASIH</p>
            <p>Atas Kepercayaan Anda</p>
            <p className="mt-2">Barang yang sudah dibeli</p>
            <p>tidak dapat ditukar/dikembalikan.</p>
            <p className="mt-2">Kritik & Saran: 0812-3456-7890</p>
          </div>

          <div className="text-center mt-6">
            <svg className="mx-auto" width="150" height="40" viewBox="0 0 150 40">
              {/* Dummy barcode representation */}
              <rect x="0" y="0" width="2" height="40" fill="black" />
              <rect x="5" y="0" width="4" height="40" fill="black" />
              <rect x="12" y="0" width="2" height="40" fill="black" />
              <rect x="18" y="0" width="6" height="40" fill="black" />
              <rect x="27" y="0" width="1" height="40" fill="black" />
              <rect x="31" y="0" width="4" height="40" fill="black" />
              <rect x="38" y="0" width="2" height="40" fill="black" />
              <rect x="42" y="0" width="7" height="40" fill="black" />
              <rect x="52" y="0" width="2" height="40" fill="black" />
              <rect x="58" y="0" width="3" height="40" fill="black" />
              <rect x="65" y="0" width="5" height="40" fill="black" />
              <rect x="73" y="0" width="1" height="40" fill="black" />
              <rect x="77" y="0" width="6" height="40" fill="black" />
              <rect x="85" y="0" width="2" height="40" fill="black" />
              <rect x="90" y="0" width="4" height="40" fill="black" />
              <rect x="97" y="0" width="3" height="40" fill="black" />
              <rect x="103" y="0" width="1" height="40" fill="black" />
              <rect x="107" y="0" width="5" height="40" fill="black" />
              <rect x="115" y="0" width="2" height="40" fill="black" />
              <rect x="120" y="0" width="6" height="40" fill="black" />
              <rect x="129" y="0" width="2" height="40" fill="black" />
              <rect x="134" y="0" width="4" height="40" fill="black" />
              <rect x="141" y="0" width="1" height="40" fill="black" />
              <rect x="145" y="0" width="5" height="40" fill="black" />
            </svg>
            <p className="text-[8px] mt-1">{payment.id.substring(0, 18)}</p>
          </div>

        </div>
      </div>
    </>
  );
}
