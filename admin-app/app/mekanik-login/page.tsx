"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Wrench, ArrowRight, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function MekanikLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email atau password salah.");
      setLoading(false);
      return;
    }

    if (data.user) {
      // Verifikasi apakah user benar-benar mekanik
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "mekanik") {
        router.replace("/mekanik/dashboard"); // Akan diarahkan ke /mekanik/dashboard oleh routing
      } else {
        await supabase.auth.signOut();
        setError("Akses ditolak. Anda bukan Mekanik.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#2A2D34] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#E07A5F]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#E07A5F]/10 rounded-full blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#E07A5F] to-[#d0694e] rounded-2xl flex items-center justify-center shadow-xl shadow-[#E07A5F]/20">
            <Wrench className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight"
        >
          Portal Mekanik
        </motion.h2>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-center text-sm text-gray-400"
        >
          Login untuk mengakses antrean servis kendaraan
        </motion.p>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-[#3A3D45] py-8 px-4 shadow-2xl shadow-black/50 sm:rounded-2xl sm:px-10 border border-gray-600/50">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center font-medium">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Email Mekanik
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl bg-[#2A2D34] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent transition-all sm:text-sm"
                  placeholder="mekanik@bengkel.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl bg-[#2A2D34] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent transition-all sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#E07A5F] hover:bg-[#d0694e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E07A5F] focus:ring-offset-[#3A3D45] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Memverifikasi..." : "Masuk ke Sistem"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
