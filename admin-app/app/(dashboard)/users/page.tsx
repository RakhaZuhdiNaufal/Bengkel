"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Edit2, ShieldAlert, CheckCircle2, Ban, UserCog, Wrench } from "lucide-react";

type User = {
  id: string;
  nama: string;
  email: string;
  nomor_hp: string;
  role: string;
  status: string;
  created_at: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);

  // Form Tambah Pengguna
  const [addNama, setAddNama] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState("kasir");
  const [addError, setAddError] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setUsers(data);
    setLoading(false);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.nama.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditStatus(user.status);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    setSaving(true);
    
    const { error } = await supabase
      .from("users")
      .update({ role: editRole, status: editStatus })
      .eq("id", selectedUser.id);
      
    if (!error) {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: editRole, status: editStatus } : u));
      setIsEditModalOpen(false);
    } else {
      alert("Gagal memperbarui pengguna: " + error.message);
    }
    setSaving(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAddError("");

    try {
      // 1. Buat akun di Supabase Auth via API route
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addEmail, password: addPassword, nama: addNama }),
      });

      const dataRes = await res.json();

      if (!res.ok) {
        throw new Error(dataRes.error || "Gagal membuat akun.");
      }

      // 2. Karena trigger telah membuat profil dengan role 'customer', 
      // admin harus mengupdate role-nya secara manual (Karena admin punya akses bypass RLS update)
      const newUserId = dataRes.data.id;
      
      const { error: updateError } = await supabase
        .from("users")
        .update({ role: addRole })
        .eq("id", newUserId);

      if (updateError) {
        throw new Error("Akun terbuat, tapi gagal mengatur peran: " + updateError.message);
      }

      // Berhasil
      setIsAddModalOpen(false);
      setAddNama("");
      setAddEmail("");
      setAddPassword("");
      setAddRole("kasir");
      fetchUsers(); // Refresh tabel

    } catch (err: any) {
      setAddError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Pengguna</h1>
          <p className="text-white/60 mt-1">Manajemen data pelanggan, kasir, dan admin.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-[#E07A5F] hover:bg-[#d0694e] text-white font-semibold rounded-xl shadow-lg transition-colors inline-flex items-center gap-2"
        >
          <span>+ Tambah Pengguna</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-[#1A1A1A] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input 
            type="text" 
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition-colors"
          />
        </div>
        <select 
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition-colors cursor-pointer"
        >
          <option className="bg-[#121212]" value="all">Semua Peran</option>
          <option className="bg-[#121212]" value="customer">Customer</option>
          <option className="bg-[#121212]" value="kasir">Kasir</option>
          <option className="bg-[#121212]" value="mekanik">Mekanik</option>
          <option className="bg-[#121212]" value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-black/50 text-white/60 font-semibold border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Peran</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/40">Memuat data pengguna...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/40">Tidak ada pengguna yang ditemukan.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{user.nama}</div>
                      <div className="text-xs text-white/40 mt-0.5">{user.id.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{user.email}</div>
                      <div className="text-white/60">{user.nomor_hp || "-"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        user.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        user.role === 'mekanik' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        user.role === 'kasir' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {user.role === 'admin' && <ShieldAlert className="w-3 h-3" />}
                        {user.role === 'mekanik' && <Wrench className="w-3 h-3" />}
                        {user.role === 'kasir' && <UserCog className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        user.status === 'aktif' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        user.status === 'suspended' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      }`}>
                        {user.status === 'aktif' ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="p-2 bg-white/5 hover:bg-[#E07A5F]/20 hover:text-[#E07A5F] rounded-lg transition-colors inline-flex"
                        title="Edit Pengguna"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedUser && (
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
              className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Edit Pengguna</h2>
                <p className="text-white/60 text-sm mt-1">{selectedUser.nama} ({selectedUser.email})</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2 uppercase tracking-wider">
                    Peran (Role)
                  </label>
                  <select 
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition-colors cursor-pointer"
                  >
                    <option className="bg-[#121212]" value="customer">Customer (Pelanggan Biasa)</option>
                    <option className="bg-[#121212]" value="kasir">Kasir (Akses Transaksi)</option>
                    <option className="bg-[#121212]" value="mekanik">Mekanik (Akses Servis)</option>
                    <option className="bg-[#121212]" value="admin">Admin (Akses Penuh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2 uppercase tracking-wider">
                    Status Akun
                  </label>
                  <select 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition-colors cursor-pointer"
                  >
                    <option className="bg-[#121212]" value="aktif">Aktif</option>
                    <option className="bg-[#121212]" value="nonaktif">Nonaktif</option>
                    <option className="bg-[#121212]" value="suspended">Suspended (Blokir)</option>
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-3 justify-end bg-black/20">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#E07A5F] hover:bg-[#d0694e] text-white transition-colors disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Tambah Pengguna Baru</h2>
                <p className="text-white/60 text-sm mt-1">Buat akun untuk staf atau pelanggan offline.</p>
              </div>
              
              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                {addError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-xs font-semibold">
                    {addError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    NAMA LENGKAP
                  </label>
                  <input 
                    type="text"
                    required
                    value={addNama}
                    onChange={(e) => setAddNama(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    ALAMAT EMAIL
                  </label>
                  <input 
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    KATA SANDI
                  </label>
                  <input 
                    type="password"
                    required
                    minLength={6}
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-2">
                    PERAN (ROLE)
                  </label>
                  <select 
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E07A5F] transition-colors cursor-pointer"
                  >
                    <option className="bg-[#121212]" value="kasir">Kasir (Akses Transaksi)</option>
                    <option className="bg-[#121212]" value="mekanik">Mekanik (Akses Servis)</option>
                    <option className="bg-[#121212]" value="admin">Admin (Akses Penuh)</option>
                    <option className="bg-[#121212]" value="customer">Pelanggan Offline</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3 justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#E07A5F] hover:bg-[#d0694e] text-white transition-colors disabled:opacity-50"
                  >
                    {saving ? "Memproses..." : "Buat Akun"}
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
