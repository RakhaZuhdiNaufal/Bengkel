"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Trash2, Package, AlertTriangle } from "lucide-react";

type Sparepart = {
  id: string;
  nama: string;
  kategori: string;
  harga_modal: number;
  harga_jual: number;
  stok: number;
};

export default function InventoryPage() {
  const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Sparepart | null>(null);
  
  // Form State
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [hargaModal, setHargaModal] = useState("");
  const [hargaJual, setHargaJual] = useState("");
  const [stok, setStok] = useState("");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("spareparts")
      .select("*")
      .order("nama", { ascending: true });

    if (data) setSpareparts(data);
    setLoading(false);
  };

  const filteredItems = spareparts.filter((item) => 
    item.nama.toLowerCase().includes(search.toLowerCase()) ||
    item.kategori?.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingItem(null);
    setNama("");
    setKategori("");
    setHargaModal("");
    setHargaJual("");
    setStok("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: Sparepart) => {
    setEditingItem(item);
    setNama(item.nama);
    setKategori(item.kategori || "");
    setHargaModal(item.harga_modal.toString());
    setHargaJual(item.harga_jual.toString());
    setStok(item.stok.toString());
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus barang ini dari inventaris?")) return;
    
    await supabase.from("spareparts").delete().eq("id", id);
    fetchInventory();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const payload = {
      nama,
      kategori,
      harga_modal: Number(hargaModal),
      harga_jual: Number(hargaJual),
      stok: Number(stok)
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
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-white/5 rounded-full text-xs">{item.kategori || "Umum"}</span>
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
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Hapus Barang"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
              
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">Nama Barang</label>
                  <input type="text" required value={nama} onChange={(e) => setNama(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">Kategori (Opsional)</label>
                  <input type="text" value={kategori} onChange={(e) => setKategori(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F]"
                  />
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
      </AnimatePresence>

    </motion.div>
  );
}
