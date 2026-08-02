"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Plus, Trash2, CheckCircle2, FileText, Search } from "lucide-react";

type Service = {
  id: string;
  nomor_invoice: string;
  tanggal: string;
  mekanik: string;
  keluhan: string;
  pekerjaan: string;
  status: string;
  sparepart: any[];
  jasa: any[];
  total: number;
  users: { nama: string; nomor_hp: string; nomor_pelanggan: string };
  vehicles: { merk: string; tipe: string; nomor_polisi: string };
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("proses");
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [spareparts, setSpareparts] = useState<any[]>([]);
  const [jasas, setJasas] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("services")
      .select(`
        *,
        users (nama, nomor_hp, nomor_pelanggan),
        vehicles (merk, tipe, nomor_polisi)
      `)
      .order("created_at", { ascending: false });

    if (data) setServices(data as any);
    setLoading(false);
  };

  const filteredServices = services.filter((s) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      s.nomor_invoice?.toLowerCase().includes(searchLower) ||
      s.users?.nama?.toLowerCase().includes(searchLower) ||
      s.vehicles?.nomor_polisi?.toLowerCase().includes(searchLower);
      
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setSpareparts(service.sparepart || []);
    setJasas(service.jasa || []);
    setIsEditModalOpen(true);
  };

  const addSparepart = () => {
    setSpareparts([...spareparts, { nama: "", harga_modal: 0, harga_jual: 0, qty: 1 }]);
  };

  const updateSparepart = (index: number, field: string, value: any) => {
    const updated = [...spareparts];
    updated[index][field] = value;
    setSpareparts(updated);
  };

  const removeSparepart = (index: number) => {
    setSpareparts(spareparts.filter((_, i) => i !== index));
  };

  const addJasa = () => {
    setJasas([...jasas, { nama: "", harga: 0, persentase_mekanik: 40 }]);
  };

  const updateJasa = (index: number, field: string, value: any) => {
    const updated = [...jasas];
    updated[index][field] = value;
    setJasas(updated);
  };

  const removeJasa = (index: number) => {
    setJasas(jasas.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const totalSparepart = spareparts.reduce((sum, item) => sum + (Number(item.harga_jual) * Number(item.qty)), 0);
    const totalJasa = jasas.reduce((sum, item) => sum + Number(item.harga), 0);
    return totalSparepart + totalJasa;
  };

  const handleSave = async (markAsSelesai: boolean) => {
    if (!selectedService) return;
    setSaving(true);
    
    const finalTotal = calculateTotal();
    const targetStatus = markAsSelesai ? "selesai" : selectedService.status;

    const { error } = await supabase
      .from("services")
      .update({
        sparepart: spareparts,
        jasa: jasas,
        total: finalTotal,
        status: targetStatus
      })
      .eq("id", selectedService.id);

    if (error) {
      alert("Gagal menyimpan data servis: " + error.message);
      setSaving(false);
      return;
    }

    // Jika ditandai selesai, buatkan tagihan di tabel payments
    if (markAsSelesai) {
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          service_id: selectedService.id,
          user_id: (selectedService as any).user_id,
          nomor_invoice: selectedService.nomor_invoice,
          total: finalTotal,
          status: "pending"
        });
        
      if (paymentError) {
        alert("Servis selesai, tapi gagal membuat tagihan: " + paymentError.message);
      }
    }

    setIsEditModalOpen(false);
    fetchServices();
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
          <h1 className="text-3xl font-bold tracking-tight">Kelola Servis</h1>
          <p className="text-white/60 mt-1">Catat penggunaan sparepart, jasa, dan selesaikan pekerjaan.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-[#1A1A1A] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input 
            type="text" 
            placeholder="Cari invoice, nama, atau nopol..."
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
          <option value="proses">Dalam Proses</option>
          <option value="selesai">Selesai Dikerjakan</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-white/40">Memuat data servis...</div>
        ) : filteredServices.length === 0 ? (
          <div className="col-span-full py-12 text-center text-white/40">Tidak ada servis ditemukan.</div>
        ) : (
          filteredServices.map((service) => (
            <motion.div 
              key={service.id}
              layout
              className="bg-[#1A1A1A] border border-white/10 p-6 rounded-2xl hover:border-white/20 transition-all flex flex-col relative overflow-hidden"
            >
              {service.status === 'selesai' && (
                <div className="absolute -right-12 top-6 bg-green-500/20 text-green-400 border border-green-500/30 px-12 py-1 text-xs font-bold uppercase tracking-widest rotate-45">
                  SELESAI
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-mono text-[#E07A5F] font-bold">{service.nomor_invoice || "INV-PENDING"}</div>
                  <div className="text-white/60 text-xs mt-1">Mekanik: {service.mekanik || "-"}</div>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="font-semibold text-lg text-white">{service.users?.nama}</h3>
                  <p className="text-sm text-white/60">{service.vehicles?.merk} {service.vehicles?.tipe} <span className="font-mono text-white/80">({service.vehicles?.nomor_polisi})</span></p>
                </div>
                
                <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                  <div className="text-xs text-white/40 mb-1">PEKERJAAN</div>
                  <div className="text-sm text-white/80 line-clamp-2">{service.pekerjaan || service.keluhan || "-"}</div>
                </div>

                <div className="flex justify-between items-end pt-2 border-t border-white/10">
                  <div className="text-xs text-white/40">Total Sementara</div>
                  <div className="font-bold text-lg text-white">Rp {service.total.toLocaleString("id-ID")}</div>
                </div>
              </div>

              <div className="mt-6">
                <button 
                  onClick={() => openEditModal(service)}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center justify-center gap-2"
                >
                  {service.status === 'selesai' ? <FileText className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                  {service.status === 'selesai' ? "Lihat Detail" : "Kerjakan & Update"}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Edit Modal (Input Sparepart & Jasa) */}
      <AnimatePresence>
        {isEditModalOpen && selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1A1A1A]">
                <div>
                  <h2 className="text-xl font-bold text-white">Update Pekerjaan Servis</h2>
                  <p className="text-[#E07A5F] font-mono text-sm mt-1">{selectedService.nomor_invoice}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/40 uppercase tracking-widest">Total Tagihan</div>
                  <div className="text-2xl font-black text-white">Rp {calculateTotal().toLocaleString("id-ID")}</div>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-8 flex-1">
                {/* Spareparts */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-white">Penggunaan Sparepart</h3>
                    {selectedService.status !== 'selesai' && (
                      <button 
                        onClick={addSparepart}
                        className="px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Tambah Item
                      </button>
                    )}
                  </div>
                  
                  {spareparts.length === 0 ? (
                    <div className="text-sm text-white/40 italic p-4 bg-white/5 rounded-xl text-center">Belum ada sparepart.</div>
                  ) : (
                    <div className="space-y-3">
                      {spareparts.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-3 items-end bg-[#1A1A1A] p-4 rounded-xl border border-white/5">
                          <div className="flex-1 w-full">
                            <label className="block text-xs text-white/40 mb-1">Nama Barang</label>
                            <input 
                              type="text" value={item.nama} onChange={(e) => updateSparepart(index, "nama", e.target.value)}
                              disabled={selectedService.status === 'selesai'}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#E07A5F] outline-none disabled:opacity-50"
                              placeholder="Misal: Oli Mesin"
                            />
                          </div>
                          <div className="w-full sm:w-32">
                            <label className="block text-xs text-white/40 mb-1">Harga Modal</label>
                            <input 
                              type="number" value={item.harga_modal} onChange={(e) => updateSparepart(index, "harga_modal", e.target.value)}
                              disabled={selectedService.status === 'selesai'}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#E07A5F] outline-none disabled:opacity-50"
                            />
                          </div>
                          <div className="w-full sm:w-32">
                            <label className="block text-xs text-white/40 mb-1">Harga Jual</label>
                            <input 
                              type="number" value={item.harga_jual} onChange={(e) => updateSparepart(index, "harga_jual", e.target.value)}
                              disabled={selectedService.status === 'selesai'}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#E07A5F] outline-none disabled:opacity-50"
                            />
                          </div>
                          <div className="w-full sm:w-20">
                            <label className="block text-xs text-white/40 mb-1">Qty</label>
                            <input 
                              type="number" value={item.qty} min={1} onChange={(e) => updateSparepart(index, "qty", e.target.value)}
                              disabled={selectedService.status === 'selesai'}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#E07A5F] outline-none disabled:opacity-50 text-center"
                            />
                          </div>
                          {selectedService.status !== 'selesai' && (
                            <button 
                              onClick={() => removeSparepart(index)}
                              className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-px bg-white/10 w-full" />

                {/* Jasa / Layanan */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-white">Biaya Jasa & Bagi Hasil Mekanik</h3>
                    {selectedService.status !== 'selesai' && (
                      <button 
                        onClick={addJasa}
                        className="px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Tambah Jasa
                      </button>
                    )}
                  </div>
                  
                  {jasas.length === 0 ? (
                    <div className="text-sm text-white/40 italic p-4 bg-white/5 rounded-xl text-center">Belum ada jasa ditambahkan.</div>
                  ) : (
                    <div className="space-y-3">
                      {jasas.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-3 items-end bg-[#1A1A1A] p-4 rounded-xl border border-white/5">
                          <div className="flex-1 w-full">
                            <label className="block text-xs text-white/40 mb-1">Nama Jasa</label>
                            <input 
                              type="text" value={item.nama} onChange={(e) => updateJasa(index, "nama", e.target.value)}
                              disabled={selectedService.status === 'selesai'}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#E07A5F] outline-none disabled:opacity-50"
                              placeholder="Misal: Turun Mesin"
                            />
                          </div>
                          <div className="w-full sm:w-40">
                            <label className="block text-xs text-white/40 mb-1">Harga Jasa</label>
                            <input 
                              type="number" value={item.harga} onChange={(e) => updateJasa(index, "harga", e.target.value)}
                              disabled={selectedService.status === 'selesai'}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#E07A5F] outline-none disabled:opacity-50"
                            />
                          </div>
                          <div className="w-full sm:w-48">
                            <label className="block text-xs text-white/40 mb-1">Bagi Hasil Mekanik</label>
                            <select 
                              value={item.persentase_mekanik || 40} 
                              onChange={(e) => updateJasa(index, "persentase_mekanik", Number(e.target.value))}
                              disabled={selectedService.status === 'selesai'}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#E07A5F] outline-none disabled:opacity-50 cursor-pointer"
                            >
                              <option value={40}>Pekerjaan Ringan/Sedang (40%)</option>
                              <option value={60}>Pekerjaan Berat (60%)</option>
                            </select>
                          </div>
                          {selectedService.status !== 'selesai' && (
                            <button 
                              onClick={() => removeJasa(index)}
                              className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-3 justify-end bg-black/20 mt-auto">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Tutup
                </button>
                {selectedService.status !== 'selesai' && (
                  <>
                    <button 
                      onClick={() => handleSave(false)}
                      disabled={saving}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
                    >
                      {saving ? "Menyimpan..." : "Simpan Draft"}
                    </button>
                    <button 
                      onClick={() => handleSave(true)}
                      disabled={saving}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Selesai & Buat Tagihan
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
