"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Camera, KeyRound, LogOut, Shield, User } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, loading, signOut, refreshProfile, isStaff } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyReminder, setNotifyReminder] = useState(true);
  const [notifyPromo, setNotifyPromo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/settings");
    if (!loading && isStaff) router.replace("/admin/settings");
  }, [loading, user, isStaff, router]);

  useEffect(() => {
    if (!profile) return;
    setPhone(profile.nomor_hp ?? "");
    setNotifyEmail(profile.notify_email);
    setNotifyReminder(profile.notify_reminder);
    setNotifyPromo(profile.notify_promo);
  }, [profile]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setError("");
    setMessage("");
    const { error: err } = await supabase
      .from("users")
      .update({
        nomor_hp: phone,
        notify_email: notifyEmail,
        notify_reminder: notifyReminder,
        notify_promo: notifyPromo,
      })
      .eq("id", user.id);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    await refreshProfile();
    setMessage("Pengaturan berhasil disimpan.");
  };

  const uploadFoto = async (file: File) => {
    if (!user) return;
    setUploading(true);
    setError("");
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setUploading(false);
      setError(upErr.message);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
    const { error: dbErr } = await supabase
      .from("users")
      .update({ foto: publicUrl })
      .eq("id", user.id);
    setUploading(false);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    await refreshProfile();
    setMessage("Foto profil diperbarui.");
  };

  const changePassword = async () => {
    setError("");
    setMessage("");
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    setSaving(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setPassword("");
    setConfirm("");
    setMessage("Password berhasil diganti.");
  };

  const logoutAll = async () => {
    await supabase.auth.signOut({ scope: "global" });
    await signOut();
    router.push("/login");
  };

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white/60">
        Memuat pengaturan...
      </div>
    );
  }

  const Switch = ({
    checked,
    onChange,
    label,
    desc,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    desc: string;
  }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#1A1A1A] p-4 text-left transition hover:border-white/15"
    >
      <div>
        <p className="font-semibold text-white">{label}</p>
        <p className="mt-1 text-xs text-white/45">{desc}</p>
      </div>
      <span
        className={`relative h-7 w-12 rounded-full transition ${
          checked ? "bg-[#E07A5F]" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
  );

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#121212]/90 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/akun" className="text-sm font-semibold text-white/70 hover:text-white">
            ← Kembali ke Profile
          </Link>
          <span className="text-sm font-bold text-white">Settings</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        {(message || error) && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-red-500/40 bg-red-500/10 text-red-300"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            {error || message}
          </div>
        )}

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] border border-white/10 bg-[#121212] p-6 sm:p-8"
        >
          <div className="mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-[#E07A5F]" />
            <h2 className="text-xl font-bold text-white">Profil</h2>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <Avatar src={profile.foto} name={profile.nama} size={80} />
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadFoto(f);
                }}
              />
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5">
                <Camera className="h-4 w-4" />
                {uploading ? "Mengunggah..." : "Ubah Foto Profil"}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nama" value={profile.nama} disabled />
            <Input label="Nomor Pelanggan" value={profile.nomor_pelanggan ?? ""} disabled />
            <Input label="Email" value={profile.email} disabled />
            <Input label="Role" value={profile.role} disabled />
            <div className="sm:col-span-2">
              <Input
                label="Nomor HP"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-[28px] border border-white/10 bg-[#121212] p-6 sm:p-8"
        >
          <div className="mb-6 flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#E07A5F]" />
            <h2 className="text-xl font-bold text-white">Notifikasi</h2>
          </div>
          <div className="space-y-3">
            <Switch
              checked={notifyEmail}
              onChange={setNotifyEmail}
              label="Email Notifikasi"
              desc="Terima update penting melalui email"
            />
            <Switch
              checked={notifyReminder}
              onChange={setNotifyReminder}
              label="Reminder Servis"
              desc="Pengingat jadwal dan perawatan berkala"
            />
            <Switch
              checked={notifyPromo}
              onChange={setNotifyPromo}
              label="Promo Bengkel"
              desc="Info promo dan penawaran spesial"
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={saveProfile} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[28px] border border-white/10 bg-[#121212] p-6 sm:p-8"
        >
          <div className="mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#E07A5F]" />
            <h2 className="text-xl font-bold text-white">Keamanan</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <KeyRound className="h-4 w-4" /> Ganti Password
            </div>
            <Input
              label="Password Baru"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Konfirmasi Password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button onClick={changePassword} disabled={saving}>
                Simpan Password
              </Button>
              <Button variant="danger" onClick={logoutAll}>
                <LogOut className="h-4 w-4" /> Logout dari semua perangkat
              </Button>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
