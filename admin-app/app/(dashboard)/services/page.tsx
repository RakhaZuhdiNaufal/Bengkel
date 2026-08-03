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

  // Data master dari inventory
  const [inventory, setInventory] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    fetchServices();
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const { data } = await supabase.from("spareparts").select("*").gt("stok", 0).order("nama", { ascending: true });
    if (data) setInventory(data);
  };

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

  // LOGIKA ANTREAN (MAX 4 BAY)
  // Hanya berlaku untuk status 'proses'
  const prosesServices = filteredServices.filter(s => s.status === "proses");
  const activeBays = prosesServices.slice(0, 4);
  const waitingQueue = prosesServices.slice(4);
  
  // Untuk status selain 'proses' (misal selesai/dibatalkan), tampilkan semua
  const otherServices = filteredServices.filter(s => s.status !== "proses");

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
    
    // Jika ganti barang dari dropdown, update juga harga modal & jual otomatis
    if (field === "nama") {
      const selectedItem = inventory.find(inv => inv.nama === value);
      if (selectedItem) {
        updated[index].id_inventory = selectedItem.id;
        updated[index].nama = selectedItem.nama;
        updated[index].harga_modal = selectedItem.harga_modal;
        updated[index].harga_jual = selectedItem.harga_jual;
      } else {
        // Jika pilih opsi kosong atau custom
        updated[index].nama = value;
      }
    } else {
      updated[index][field] = value;
    }
    
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

    // Jika ditandai selesai, potong stok di inventaris dan buatkan tagihan di tabel payments
    if (markAsSelesai) {
      // 1. Kurangi stok inventory
      for (const sp of spareparts) {
        if (sp.id_inventory) {
          // Ambil stok saat ini (idealnya pakai RPC agar aman, tapi untuk MVP via update biasa)
          const invItem = inventory.find(i => i.id === sp.id_inventory);
          if (invItem) {
            await supabase.from("spareparts")
              .update({ stok: Math.max(0, invItem.stok - Number(sp.qty)) })
              .eq("id", sp.id_inventory);
          }
        }
      }

      // 2. Cek pembayaran sebelumnya (DP atau Lunas)
      let totalSudahDibayar = 0;
      const { data: existingPayments } = await supabase
        .from("payments")
        .select("total")
        .eq("service_id", selectedService.id)
        .not("status", "in", '("gagal","refund")');

      if (existingPayments) {
        totalSudahDibayar = existingPayments.reduce((sum, p) => sum + Number(p.total), 0);
      }

      const sisaTagihan = finalTotal - totalSudahDibayar;

      // 3. Buat tagihan baru HANYA jika masih ada sisa
      if (sisaTagihan > 0) {
        const { error: paymentError } = await supabase
          .from("payments")
          .insert({
            service_id: selectedService.id,
            user_id: (selectedService as any).user_id,
            nomor_invoice: selectedService.nomor_invoice,
            total: sisaTagihan,
            status: "pending",
            metode: "tunai"
          });
          
        if (paymentError) {
          alert("Servis selesai, tapi gagal membuat tagihan: " + paymentError.message);
        }
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
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Cari invoice, pelanggan, atau plat nomor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-[#E07A5F] focus:outline-none transition"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#E07A5F] focus:outline-none transition min-w-[150px]"
        >
          <option value="all">Semua Status</option>
          <option value="proses">Dalam Antrean / Proses</option>
          <option value="selesai">Selesai</option>
          <option value="dibatalkan">Dibatalkan</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/50">Memuat data servis...</div>
      ) : (
        <div className="space-y-10">
          {/* TAMPILAN JIKA FILTER = PROSES (Atau All yang memiliki proses) */}
          {(filterStatus === "proses" || filterStatus === "all") && (
            <>
              {/* 4 BAY UTAMA */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-white">Sedang Dikerjakan (Bay Aktif)</h2>
                  <span className="bg-[#E07A5F]/20 text-[#E07A5F] px-3 py-1 rounded-full text-xs font-bold border border-[#E07A5F]/30">
                    {activeBays.length} / 4 Slot
                  </span>
                </div>
                
                {activeBays.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-10 text-center text-white/40">
                    Tidak ada kendaraan yang sedang dikerjakan.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeBays.map((service, index) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-white/30 transition-colors relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 bg-[#E07A5F] text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                          BAY {index + 1}
                        </div>
                        
                        <div className="flex justify-between items-start mb-4 pt-2">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">{service.vehicles?.merk} {service.vehicles?.tipe}</h3>
                            <p className="text-[#E07A5F] font-mono font-semibold">{service.vehicles?.nomor_polisi}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-6 text-sm">
                          <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-white/50">Pelanggan</span>
                            <span className="text-white">{service.users?.nama}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-white/50">Pekerjaan</span>
                            <span className="text-white text-right max-w-[200px] truncate">{service.pekerjaan}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/50">Mekanik</span>
                            <span className="text-white">{service.mekanik || "-"}</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => openEditModal(service)}
                          className="w-full bg-[#E07A5F] hover:bg-[#d0694e] text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                        >
                          <Wrench className="w-4 h-4" /> Kerjakan & Selesaikan
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* ANTREAN MENUNGGU */}
              <div>
                <div className="flex items-center gap-3 mb-4 mt-8">
                  <h2 className="text-xl font-bold text-white/70">Daftar Antrean (Menunggu Slot)</h2>
                  <span className="bg-white/10 text-white/50 px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                    {waitingQueue.length} Kendaraan
                  </span>
                </div>
                
                {waitingQueue.length === 0 ? (
                  <div className="bg-transparent border border-white/5 border-dashed rounded-2xl p-6 text-center text-white/30 text-sm">
                    Antrean kosong.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {waitingQueue.map((service, index) => (
                      <div key={service.id} className="bg-[#121212] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 opacity-80">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 font-black text-lg">
                            #{index + 1}
                          </div>
                          <div>
                            <h4 className="text-white font-bold">{service.vehicles?.merk} {service.vehicles?.tipe} <span className="text-[#E07A5F] ml-2 text-sm">{service.vehicles?.nomor_polisi}</span></h4>
                            <p className="text-white/50 text-xs mt-1">Pelanggan: {service.users?.nama} | Pekerjaan: {service.pekerjaan}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => openEditModal(service)}
                          className="bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold py-2 px-4 rounded-lg transition border border-white/10"
                        >
                          Edit Data
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAMPILAN JIKA FILTER = SELESAI / DIBATALKAN */}
          {(filterStatus !== "proses") && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {otherServices.length === 0 ? (
                <div className="col-span-full text-center py-10 text-white/40">Tidak ada data.</div>
              ) : (
                otherServices.map((service) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-white/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] text-white/50 font-bold tracking-wider uppercase mb-1 block">
                          {service.nomor_invoice}
                        </span>
                        <h3 className="text-xl font-bold text-white mb-1">{service.vehicles?.merk} {service.vehicles?.tipe}</h3>
                        <p className="text-[#E07A5F] font-mono font-semibold">{service.vehicles?.nomor_polisi}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        service.status === 'selesai' ? "bg-green-500/20 text-green-500 border border-green-500/30" : 
                        "bg-red-500/20 text-red-500 border border-red-500/30"
                      }`}>
                        {service.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-6 text-sm">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/50">Pelanggan</span>
                        <span className="text-white">{service.users?.nama}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/50">Total Biaya</span>
                        <span className="text-white font-bold">Rp {service.total.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => openEditModal(service)}
                      className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
                    >
                      <FileText className="w-4 h-4" /> Lihat Detail
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      )}

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
                            <label className="block text-xs text-white/40 mb-1">Pilih Barang dari Inventaris</label>
                            <select 
                              value={item.nama} onChange={(e) => updateSparepart(index, "nama", e.target.value)}
                              disabled={selectedService.status === 'selesai'}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#E07A5F] outline-none disabled:opacity-50 cursor-pointer"
                            >
                              <option value="">-- Ketik manual atau pilih --</option>
                              {inventory.map(inv => (
                                <option key={inv.id} value={inv.nama}>
                                  {inv.nama} (Stok: {inv.stok})
                                </option>
                              ))}
                            </select>
                            
                            {/* Input manual fallback jika barang tidak ada di inventory */}
                            {(!item.nama || !inventory.find(inv => inv.nama === item.nama)) && (
                              <input 
                                type="text" 
                                value={item.nama} 
                                onChange={(e) => updateSparepart(index, "nama", e.target.value)}
                                disabled={selectedService.status === 'selesai'}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#E07A5F] outline-none disabled:opacity-50 mt-2"
                                placeholder="Nama barang custom..."
                              />
                            )}
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
