"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CheckCircle, Search, FileSignature } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

type Payment = {
  id: string;
  nomor_invoice: string;
  total: number;
  metode: string;
  status: string;
  created_at: string;
  paid_at: string;
  users: { nama: string; nomor_hp: string };
  services: { pekerjaan: string; sparepart: any[]; jasa: any[]; vehicles?: { merk: string; tipe: string; nomor_polisi: string } };
  bookings: { vehicles?: { merk: string; tipe: string; nomor_polisi: string } };
  is_setor: boolean;
  setor_at: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("tunai");
  const [uangDiterima, setUangDiterima] = useState("");
  const [saving, setSaving] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        users (nama, nomor_hp),
        services (pekerjaan, sparepart, jasa, vehicles (merk, tipe, nomor_polisi)),
        bookings (vehicles (merk, tipe, nomor_polisi))
      `)
      .order("created_at", { ascending: false });

    if (data) setPayments(data as any);
    setLoading(false);
  };

  const filteredPayments = payments.filter((p) => {
    const searchLower = search.toLowerCase();
    const vehicle = p.bookings?.vehicles || p.services?.vehicles;
    const matchesSearch = 
      p.nomor_invoice?.toLowerCase().includes(searchLower) ||
      p.users?.nama?.toLowerCase().includes(searchLower) ||
      vehicle?.nomor_polisi?.toLowerCase().includes(searchLower);
      
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const openProcessModal = (payment: Payment) => {
    setSelectedPayment(payment);
    // Jika dari online booking DP, asumsikan default transfer (karena bayar online)
    setPaymentMethod(payment.metode === 'dp' ? 'transfer' : (payment.metode || "tunai"));
    setUangDiterima("");
    setIsProcessModalOpen(true);
  };

  const handleUangDiterimaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setUangDiterima(val);
  };

  const setUangPas = () => {
    if (selectedPayment) {
      setUangDiterima(selectedPayment.total.toString());
    }
  };

  let subtotal = 0;
  let deposit = 0;
  if (selectedPayment && selectedPayment.metode !== 'dp' && selectedPayment.services) {
    const sparepartsTotal = (selectedPayment.services.sparepart || []).reduce((sum: number, item: any) => sum + (Number(item.harga_jual) * Number(item.qty)), 0);
    const jasaTotal = (selectedPayment.services.jasa || []).reduce((sum: number, item: any) => sum + Number(item.harga), 0);
    subtotal = sparepartsTotal + jasaTotal;
    deposit = subtotal - selectedPayment.total;
  }
  const kembalian = Number(uangDiterima) - (selectedPayment?.total || 0);
  
  // Validasi Tombol Submit
  const isSubmitDisabled = saving || (paymentMethod === 'tunai' && Number(uangDiterima) < (selectedPayment?.total || 0));

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    setSaving(true);
    
    const { error } = await supabase
      .from("payments")
      .update({ 
        metode: paymentMethod, 
        status: "lunas",
        paid_at: new Date().toISOString()
      })
      .eq("id", selectedPayment.id);
      
    if (error) {
      alert("Gagal memproses pembayaran: " + error.message);
      setSaving(false);
      return;
    }

    // Integrasi: Kurangi Stok Barang Otomatis
    if (selectedPayment.services && selectedPayment.services.sparepart) {
      const parts = selectedPayment.services.sparepart;
      for (const part of parts) {
        if (part.id) {
          const { data: currentItem } = await supabase
            .from("spareparts")
            .select("stok")
            .eq("id", part.id)
            .single();
            
          if (currentItem) {
            const qtyUsed = Number(part.qty) || 1;
            const newStok = Math.max(0, currentItem.stok - qtyUsed);
            await supabase
              .from("spareparts")
              .update({ stok: newStok })
              .eq("id", part.id);
          }
        }
      }
    }

    setIsProcessModalOpen(false);
    fetchPayments();
    setSaving(false);
  };

  const uangDiLaci = payments
    .filter(p => p.status === 'lunas' && p.is_setor === false)
    .reduce((sum, p) => sum + p.total, 0);

  const handleTutupShiftClick = () => {
    if (uangDiLaci === 0) return alert("Tidak ada pendapatan baru untuk disetor.");
    setIsShiftModalOpen(true);
  };

  const confirmTutupShift = async () => {
    setLoading(true);
    setSaving(true);
    const { error } = await supabase
      .from("payments")
      .update({ is_setor: true, setor_at: new Date().toISOString() })
      .eq("status", "lunas")
      .eq("is_setor", false)
      .is("setor_at", null); // Safe fallback
      
    if (error) {
      alert("Gagal tutup shift: " + error.message);
    } else {
      setIsShiftModalOpen(false);
      fetchPayments();
    }
    setLoading(false);
    setSaving(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">Tagihan & Pembayaran Kasir</h1>
          <p className="text-gray-500 mt-1 text-sm">Selesaikan transaksi pelanggan dan cetak struk (Invoice) resmi.</p>
        </div>
        <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 p-3 rounded-lg w-full sm:w-auto">
          <div>
            <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-0.5">Uang di Laci</div>
            <div className="text-xl font-black text-blue-900">Rp {uangDiLaci.toLocaleString("id-ID")}</div>
          </div>
          <button 
            onClick={handleTutupShiftClick}
            disabled={uangDiLaci === 0 || loading || saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded shadow-sm font-bold text-xs transition-colors h-full"
          >
            Tutup Shift & Setor
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-300 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari invoice, nama pelanggan, atau plat nomor kendaraan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#4A6B8A] focus:ring-1 focus:ring-[#4A6B8A] transition-all"
          />
        </div>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#4A6B8A] transition-all cursor-pointer font-medium"
        >
          <option value="all">Semua Status Tagihan</option>
          <option value="pending">Menunggu Pembayaran (Pending)</option>
          <option value="lunas">Selesai (Lunas)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 border-collapse">
            <thead className="bg-[#4A6B8A] text-white font-semibold border-b border-[#39546D]">
              <tr>
                <th className="px-5 py-3.5 border-r border-[#5B7F9E]">Nomor Invoice</th>
                <th className="px-5 py-3.5 border-r border-[#5B7F9E]">Pelanggan & Kendaraan</th>
                <th className="px-5 py-3.5 border-r border-[#5B7F9E]">Rincian Servis</th>
                <th className="px-5 py-3.5 border-r border-[#5B7F9E] text-right">Total Tagihan</th>
                <th className="px-5 py-3.5 border-r border-[#5B7F9E] text-center">Status</th>
                <th className="px-5 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">Memuat data pembayaran...</td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">Tidak ada data tagihan.</td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const vehicle = payment.bookings?.vehicles || payment.services?.vehicles;
                  
                  return (
                  <tr key={payment.id} className="hover:bg-blue-50 even:bg-[#F8FAFC] odd:bg-white transition-colors">
                    <td className="px-5 py-3 border-r border-gray-200 align-top">
                      <div className="font-mono text-[#39546D] font-bold flex items-center gap-2">
                        {payment.nomor_invoice}
                        {payment.metode === 'dp' && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase tracking-wider border border-blue-200">DP</span>}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1 font-medium">{dayjs(payment.created_at).format('DD MMM YYYY, HH:mm')}</div>
                    </td>
                    <td className="px-5 py-3 border-r border-gray-200 align-top">
                      <div className="font-bold text-gray-800">{payment.users?.nama}</div>
                      <div className="text-gray-500 text-xs mb-1.5">{payment.users?.nomor_hp || "-"}</div>
                      {vehicle && (
                        <div className="inline-flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md text-[11px] border border-gray-300 shadow-sm">
                          <span className="text-gray-600">{vehicle.merk} {vehicle.tipe}</span>
                          <span className="text-gray-800 font-bold border-l border-gray-300 pl-1.5">{vehicle.nomor_polisi}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 border-r border-gray-200 align-top">
                      <div className="font-bold text-gray-700 text-xs uppercase tracking-wide mb-1">
                        {payment.metode === 'dp' ? 'Uang Muka / Deposit' : 'Pelunasan Akhir'}
                      </div>
                      <div className="line-clamp-1 text-gray-800 text-sm font-medium">{payment.services?.pekerjaan || "Servis Reguler"}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {payment.services?.sparepart?.length || 0} Sparepart, {payment.services?.jasa?.length || 0} Jasa
                      </div>
                    </td>
                    <td className="px-5 py-3 border-r border-gray-200 text-right align-top">
                      <div className="font-black text-gray-900 whitespace-nowrap text-base">
                        Rp {payment.total.toLocaleString("id-ID")}
                      </div>
                    </td>
                    <td className="px-5 py-3 border-r border-gray-200 text-center align-top">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border ${
                        payment.status === 'lunas' ? 'bg-green-100 text-green-700 border-green-300' :
                        'bg-orange-100 text-orange-700 border-orange-300'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center align-middle">
                      {payment.status === 'pending' ? (
                        <button 
                          onClick={() => openProcessModal(payment)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm font-semibold text-xs transition-colors whitespace-nowrap inline-flex items-center justify-center gap-2 w-full"
                        >
                          <Wallet className="w-3.5 h-3.5" /> Bayar
                        </button>
                      ) : (
                        <button 
                          onClick={() => window.open(`/print/${payment.id}`, '_blank')}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded shadow-sm font-semibold text-xs transition-colors whitespace-nowrap inline-flex items-center justify-center gap-2 w-full" 
                          title="Cetak Struk"
                        >
                          <FileSignature className="w-3.5 h-3.5" /> Cetak
                        </button>
                      )}
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Payment Modal */}
      <AnimatePresence>
        {isProcessModalOpen && selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsProcessModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white border border-gray-300 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">Proses Pembayaran</h2>
                <p className="text-gray-500 text-xs mt-1">{selectedPayment.users?.nama}</p>
              </div>
              
              <form onSubmit={handleCompletePayment} className="p-6 space-y-5">
                
                <div className="bg-[#F8FAFC] p-4 rounded-lg border border-gray-200 relative shadow-inner">
                  {selectedPayment.metode === 'dp' ? (
                    <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider border border-blue-200">
                      PEMBAYARAN DEPOSIT
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 bg-[#4A6B8A] text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider shadow-sm">
                      PELUNASAN AKHIR
                    </div>
                  )}
                  
                  {selectedPayment.metode !== 'dp' && deposit > 0 && (
                    <div className="space-y-1 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal Servis & Sparepart</span>
                        <span className="text-gray-800 font-mono font-medium">Rp {subtotal.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Deposit Telah Dibayar</span>
                        <span className="text-red-500 font-mono font-medium">- Rp {deposit.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold">
                      {selectedPayment.metode === 'dp' ? 'Total Tagihan' : 'Sisa Tagihan'}
                    </div>
                    <div className="text-3xl font-black text-[#39546D]">
                      Rp {selectedPayment.total.toLocaleString("id-ID")}
                    </div>
                    <div className="font-mono text-xs text-gray-400 mt-1.5">{selectedPayment.nomor_invoice}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Metode Pembayaran
                  </label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      if (e.target.value !== 'tunai') setUangDiterima("");
                    }}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#4A6B8A] focus:ring-1 focus:ring-[#4A6B8A] transition-colors cursor-pointer shadow-sm"
                  >
                    <option value="tunai">Tunai (Cash)</option>
                    <option value="transfer">Transfer Bank</option>
                    <option value="qris">QRIS E-Wallet</option>
                    <option value="kartu">Kartu Debit / Kredit</option>
                  </select>
                </div>

                {paymentMethod === 'tunai' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Uang Diterima
                        </label>
                        <button type="button" onClick={setUangPas} className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded font-bold border border-gray-300 transition-colors shadow-sm">
                          [Uang Pas]
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono font-bold">Rp</span>
                        <input 
                          type="text" 
                          placeholder="0"
                          value={uangDiterima ? Number(uangDiterima).toLocaleString("id-ID") : ""}
                          onChange={handleUangDiterimaChange}
                          className="w-full bg-white border border-gray-300 rounded-lg pl-12 pr-4 py-2.5 text-gray-900 font-mono font-bold focus:outline-none focus:border-[#4A6B8A] focus:ring-1 focus:ring-[#4A6B8A] transition-colors shadow-sm text-lg"
                        />
                      </div>
                    </div>
                    
                    {Number(uangDiterima) > 0 && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm font-semibold text-gray-600">Kembalian:</span>
                        <span className={`font-mono font-bold text-lg ${kembalian < 0 ? 'text-red-500' : 'text-green-600'}`}>
                          Rp {kembalian.toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 flex gap-3 justify-end border-t border-gray-200 mt-2">
                  <button 
                    type="button"
                    onClick={() => setIsProcessModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="px-5 py-2.5 rounded-lg text-sm font-bold bg-[#4A6B8A] hover:bg-[#39546D] shadow text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? "Memproses..." : <><CheckCircle className="w-4 h-4" /> Tandai Lunas</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tutup Shift Modal */}
      <AnimatePresence>
        {isShiftModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsShiftModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white border border-gray-300 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-gray-200 bg-blue-50 text-center">
                <div className="mx-auto bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 border border-blue-200">
                  <Wallet className="w-6 h-6 text-blue-700" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Tutup Shift & Setor</h2>
                <p className="text-gray-500 text-xs mt-1">Konfirmasi penyetoran uang fisik ke Admin/Owner.</p>
              </div>
              
              <div className="p-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center mb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Disetorkan</p>
                  <p className="text-3xl font-black text-blue-700">Rp {uangDiLaci.toLocaleString("id-ID")}</p>
                </div>
                
                <p className="text-sm text-gray-600 text-center mb-6">
                  Apakah Anda sudah mencocokkan jumlah uang di laci dengan angka di atas?
                </p>

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsShiftModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={confirmTutupShift}
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 shadow text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {saving ? "Menyetor..." : "Ya, Setor Sekarang"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
