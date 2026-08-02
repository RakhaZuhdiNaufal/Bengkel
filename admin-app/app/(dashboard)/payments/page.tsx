"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CheckCircle, Search, FileSignature } from "lucide-react";

type Payment = {
  id: string;
  nomor_invoice: string;
  total: number;
  metode: string;
  status: string;
  paid_at: string;
  users: { nama: string; nomor_hp: string };
  services: { pekerjaan: string; sparepart: any[]; jasa: any[] };
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("tunai");
  const [saving, setSaving] = useState(false);

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
        services (pekerjaan, sparepart, jasa)
      `)
      .order("created_at", { ascending: false });

    if (data) setPayments(data as any);
    setLoading(false);
  };

  const filteredPayments = payments.filter((p) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      p.nomor_invoice?.toLowerCase().includes(searchLower) ||
      p.users?.nama?.toLowerCase().includes(searchLower);
      
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const openProcessModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setPaymentMethod(payment.metode || "tunai");
    setIsProcessModalOpen(true);
  };

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

    setIsProcessModalOpen(false);
    fetchPayments();
    setSaving(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kasir & Pembayaran</h1>
          <p className="text-white/60 mt-1">Selesaikan tagihan pelanggan untuk servis yang sudah berstatus Selesai.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-[#1A1A1A] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input 
            type="text" 
            placeholder="Cari invoice atau nama pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition-colors"
          />
        </div>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition-colors cursor-pointer"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Menunggu Pembayaran (Pending)</option>
          <option value="lunas">Lunas</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-black/50 text-white/60 font-semibold border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Nomor Invoice</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Rincian Servis</th>
                <th className="px-6 py-4 text-right">Total Tagihan</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">Memuat data pembayaran...</td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">Tidak ada data tagihan.</td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-[#E07A5F] font-bold">{payment.nomor_invoice}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{payment.users?.nama}</div>
                      <div className="text-white/60 text-xs">{payment.users?.nomor_hp || "-"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="line-clamp-1">{payment.services?.pekerjaan || "Servis Reguler"}</div>
                      <div className="text-xs text-white/40">
                        {payment.services?.sparepart?.length || 0} item, {payment.services?.jasa?.length || 0} jasa
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-black text-white whitespace-nowrap">
                        Rp {payment.total.toLocaleString("id-ID")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        payment.status === 'lunas' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payment.status === 'pending' ? (
                        <button 
                          onClick={() => openProcessModal(payment)}
                          className="px-4 py-2 bg-[#E07A5F] hover:bg-[#d0694e] text-white rounded-lg font-semibold text-xs transition-colors whitespace-nowrap inline-flex items-center gap-2"
                        >
                          <Wallet className="w-3.5 h-3.5" /> Proses Bayar
                        </button>
                      ) : (
                        <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Cetak Struk">
                          <FileSignature className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
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
              className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 bg-[#1A1A1A]">
                <h2 className="text-xl font-bold text-white">Proses Pembayaran</h2>
                <p className="text-white/60 text-sm mt-1">{selectedPayment.users?.nama}</p>
              </div>
              
              <form onSubmit={handleCompletePayment} className="p-6 space-y-6">
                
                <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center">
                  <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Total Tagihan</div>
                  <div className="text-3xl font-black text-[#E07A5F]">
                    Rp {selectedPayment.total.toLocaleString("id-ID")}
                  </div>
                  <div className="font-mono text-sm text-white/60 mt-1">{selectedPayment.nomor_invoice}</div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2 uppercase tracking-wider">
                    Metode Pembayaran
                  </label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition-colors cursor-pointer"
                  >
                    <option value="tunai">Tunai (Cash)</option>
                    <option value="transfer">Transfer Bank</option>
                    <option value="qris">QRIS E-Wallet</option>
                    <option value="kartu">Kartu Debit / Kredit</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3 justify-end border-t border-white/10">
                  <button 
                    type="button"
                    onClick={() => setIsProcessModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? "Memproses..." : <><CheckCircle className="w-4 h-4" /> Tandai Lunas</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
