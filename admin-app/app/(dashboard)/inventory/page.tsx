"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Trash2, Package, AlertTriangle, PlusCircle, TrendingUp } from "lucide-react";

type Sparepart = {
  id: string;
  sku: string | null;
  nama: string;
  kategori: string;
  merk: string | null;
  tipe_model: string | null;
  harga_modal: number;
  harga_jual: number;
  stok: number;
  satuan: string;
  kompatibilitas: string[];
  last_restocked_at?: string;
};

export default function InventoryPage() {
  const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
  const [topSelling, setTopSelling] = useState<{nama: string, qty: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Sparepart | null>(null);
  
  // Restock State
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockingItem, setRestockingItem] = useState<Sparepart | null>(null);
  const [restockAmount, setRestockAmount] = useState("");

  // Form State
  const [sku, setSku] = useState("");
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [merk, setMerk] = useState("");
  const [tipeModel, setTipeModel] = useState("");
  const [hargaModal, setHargaModal] = useState("");
  const [hargaJual, setHargaJual] = useState("");
  const [stok, setStok] = useState("");
  const [satuan, setSatuan] = useState("Pcs");
  const [kompatibilitas, setKompatibilitas] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const [sparepartsRes, paymentsRes] = await Promise.all([
      supabase.from("spareparts").select("*").order("nama", { ascending: true }),
      supabase.from("payments").select("services (sparepart)").eq("status", "lunas")
    ]);

    if (sparepartsRes.data) setSpareparts(sparepartsRes.data);
    
    if (paymentsRes.data) {
      const usage: Record<string, number> = {};
      paymentsRes.data.forEach((p: any) => {
        const servicesArr = Array.isArray(p.services) ? p.services : [p.services];
        servicesArr.forEach((s: any) => {
          const parts = s?.sparepart || [];
          parts.forEach((part: any) => {
            if (part.nama) {
              usage[part.nama] = (usage[part.nama] || 0) + (Number(part.qty) || 1);
            }
          });
        });
      });
      
      const sortedUsage = Object.entries(usage)
        .map(([nama, qty]) => ({ nama, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);
        
      setTopSelling(sortedUsage);
    }
    
    setLoading(false);
  };

  const filteredItems = spareparts.filter((item) => 
    item.nama.toLowerCase().includes(search.toLowerCase()) ||
    item.kategori?.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingItem(null);
    setSku("");
    setNama("");
    setKategori("");
    setMerk("");
    setTipeModel("");
    setHargaModal("");
    setHargaJual("");
    setStok("");
    setSatuan("Pcs");
    setKompatibilitas("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: Sparepart) => {
    setEditingItem(item);
    setSku(item.sku || "");
    setNama(item.nama);
    setKategori(item.kategori || "");
    setMerk(item.merk || "");
    setTipeModel(item.tipe_model || "");
    setHargaModal(item.harga_modal.toString());
    setHargaJual(item.harga_jual.toString());
    setStok(item.stok.toString());
    setSatuan(item.satuan || "Pcs");
    setKompatibilitas((item.kompatibilitas || []).join(", "));
    setIsModalOpen(true);
  };

  const openRestockModal = (item: Sparepart) => {
    setRestockingItem(item);
    setRestockAmount("");
    setIsRestockModalOpen(true);
  };

  const handleRestockSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockingItem) return;
    setSaving(true);
    
    const amount = Number(restockAmount);
    if (amount > 0) {
      const newStock = restockingItem.stok + amount;
      await supabase.from("spareparts").update({ 
        stok: newStock,
        last_restocked_at: new Date().toISOString()
      }).eq("id", restockingItem.id);
      fetchInventory();
    }
    
    setIsRestockModalOpen(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus barang ini dari inventaris?")) return;
    
    await supabase.from("spareparts").delete().eq("id", id);
    fetchInventory();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const kompArray = kompatibilitas.split(",").map(k => k.trim()).filter(k => k !== "");
    const payload = {
      sku: sku || null,
      nama,
      kategori,
      merk: merk || null,
      tipe_model: tipeModel || null,
      harga_modal: Number(hargaModal),
      harga_jual: Number(hargaJual),
      stok: Number(stok),
      satuan: satuan || "Pcs",
      kompatibilitas: kompArray
    };

    if (editingItem) {
      await supabase.from("spareparts").update(payload).eq("id", editingItem.id);
    } else {
      await supabase.from("spareparts").insert([payload]);
    }

    setIsModalOpen(false);
    fetchInventory();
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
          <h1 className="text-3xl font-bold tracking-tight">Inventaris Sparepart</h1>
          <p className="text-white/60 mt-1">Kelola stok dan harga barang bengkel Anda.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-5 py-2.5 bg-[#E07A5F] hover:bg-[#d0694e] text-white font-semibold rounded-xl shadow-lg transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> <span>Tambah Barang</span>
        </button>
      </div>

      {/* Laporan Stok Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Low Stock */}
        <div className="bg-[#1A1A1A] border border-red-500/20 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <h3 className="text-white/60 text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" /> Barang Mau Habis
          </h3>
          <div className="space-y-3 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
            {spareparts.filter(s => s.stok <= 5).length === 0 ? (
              <p className="text-white/40 text-xs">Semua stok aman.</p>
            ) : (
              spareparts.filter(s => s.stok <= 5).map(s => (
                <div key={s.id} className="flex justify-between items-center text-sm">
                  <span className="text-white truncate pr-2">{s.nama}</span>
                  <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded text-xs">{s.stok} left</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recently Restocked */}
        <div className="bg-[#1A1A1A] border border-blue-500/20 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <h3 className="text-white/60 text-sm font-semibold mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-400" /> Baru Di-restock
          </h3>
          <div className="space-y-3 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
            {spareparts.filter(s => s.last_restocked_at).sort((a, b) => new Date(b.last_restocked_at!).getTime() - new Date(a.last_restocked_at!).getTime()).slice(0, 5).length === 0 ? (
              <p className="text-white/40 text-xs">Belum ada aktivitas restock.</p>
            ) : (
              spareparts.filter(s => s.last_restocked_at).sort((a, b) => new Date(b.last_restocked_at!).getTime() - new Date(a.last_restocked_at!).getTime()).slice(0, 5).map(s => (
                <div key={s.id} className="flex flex-col text-sm">
                  <span className="text-white truncate">{s.nama}</span>
                  <span className="text-blue-400/80 text-[10px] mt-0.5">{new Date(s.last_restocked_at!).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Selling */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A1A1A] border border-[#E07A5F]/20 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E07A5F]"></div>
          <h3 className="text-white/60 text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#E07A5F]" /> Paling Banyak Digunakan
          </h3>
          <div className="space-y-3 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
            {topSelling.length === 0 ? (
              <p className="text-white/40 text-xs">Belum ada data penjualan.</p>
            ) : (
              topSelling.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-white truncate pr-2">{item.nama}</span>
                  <span className="text-[#E07A5F] font-bold text-xs">{item.qty}x dipakai</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input 
          type="text" 
          placeholder="Cari nama barang atau kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-black/50 text-white/60 font-semibold border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Nama Barang</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4 text-right">Harga Modal</th>
                <th className="px-6 py-4 text-right">Harga Jual</th>
                <th className="px-6 py-4 text-center">Stok</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">Memuat data inventaris...</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">Tidak ada barang ditemukan.</td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => openEditModal(item)}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#E07A5F]" /> {item.nama}
                      </div>
                      {(item.merk || item.tipe_model) && (
                        <div className="text-xs text-white/50 mt-1 ml-6">{item.merk} {item.tipe_model}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-white/5 rounded-full text-xs">{item.kategori || "Umum"}</span>
                      {item.sku && <div className="text-[10px] text-white/40 mt-1 ml-1">{item.sku}</div>}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-white/60">
                      Rp {item.harga_modal.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-green-400">
                      Rp {item.harga_jual.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold ${
                        item.stok <= 5 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/10 text-green-400'
                      }`}>
                        {item.stok <= 5 && <AlertTriangle className="w-3.5 h-3.5" />}
                        {item.stok}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openRestockModal(item)}
                          className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Restock Barang"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Hapus Barang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 bg-[#1A1A1A]">
                <h2 className="text-xl font-bold text-white">{editingItem ? "Edit Barang" : "Tambah Barang Baru"}</h2>
              </div>
              
              <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-2">SKU (Opsional)</label>
                    <input type="text" value={sku} onChange={(e) => setSku(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-2">Kategori (Wajib)</label>
                    <input type="text" required value={kategori} onChange={(e) => setKategori(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">Nama Barang</label>
                  <input type="text" required value={nama} onChange={(e) => setNama(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-2">Merk (Opsional)</label>
                    <input type="text" value={merk} onChange={(e) => setMerk(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-2">Tipe/Model (Opsional)</label>
                    <input type="text" value={tipeModel} onChange={(e) => setTipeModel(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-2">Harga Modal</label>
                    <input type="number" required min="0" value={hargaModal} onChange={(e) => setHargaModal(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-2">Harga Jual</label>
                    <input type="number" required min="0" value={hargaJual} onChange={(e) => setHargaJual(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">Stok Saat Ini</label>
                  <input type="number" required min="0" value={stok} onChange={(e) => setStok(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>
                <div className="pt-4 flex gap-3 justify-end border-t border-white/10">
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:bg-white/10"
                  >Batal</button>
                  <button type="submit" disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#E07A5F] hover:bg-[#d0694e] text-white disabled:opacity-50"
                  >{saving ? "Menyimpan..." : "Simpan"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal Restock */}
        {isRestockModalOpen && restockingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsRestockModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 bg-[#1A1A1A]">
                <h2 className="text-xl font-bold text-white">Restock Barang</h2>
                <p className="text-sm text-white/50 mt-1">{restockingItem.nama}</p>
              </div>
              
              <form onSubmit={handleRestockSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">Stok Masuk (Stok saat ini: {restockingItem.stok})</label>
                  <input type="number" required min="1" value={restockAmount} onChange={(e) => setRestockAmount(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F]"
                    placeholder="Contoh: 10"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsRestockModalOpen(false)} disabled={saving}
                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Batal
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#E07A5F] hover:bg-[#d0694e] text-white font-semibold shadow-lg transition-colors"
                  >
                    {saving ? "Menyimpan..." : "Simpan Stok"}
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
