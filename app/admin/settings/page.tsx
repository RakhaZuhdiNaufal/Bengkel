"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

export default function AdminSettingsPage() {
  const { profile, isAdmin, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [phone, setPhone] = useState(profile?.nomor_hp ?? "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    setError("");
    const { error: err } = await supabase
      .from("users")
      .update({ nomor_hp: phone })
      .eq("id", profile.id);
    setSaving(false);
    if (err) setError(err.message);
    else {
      setMessage("Pengaturan disimpan.");
      await refreshProfile();
    }
  };

  const changePassword = async () => {
    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) setError(err.message);
    else {
      setMessage("Password diganti.");
      setPassword("");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pengaturan</h1>
        <p className="text-sm text-white/50">Akun staff · keamanan</p>
      </div>

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

      <section className="space-y-4 rounded-2xl border border-white/10 bg-[#121212] p-6">
        <Input label="Nama" value={profile?.nama ?? ""} disabled />
        <Input label="Email" value={profile?.email ?? ""} disabled />
        <Input label="Role" value={profile?.role ?? ""} disabled />
        <Input label="Nomor HP" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Button onClick={save} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-[#121212] p-6">
        <Input
          label="Password baru"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex flex-wrap gap-3">
          <Button onClick={changePassword}>Ganti Password</Button>
          <Button
            variant="danger"
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
          >
            Logout semua perangkat
          </Button>
        </div>
        {isAdmin && (
          <p className="text-xs text-white/40">
            Sebagai admin Anda dapat mengelola role user di menu Customer.
          </p>
        )}
      </section>
    </div>
  );
}
