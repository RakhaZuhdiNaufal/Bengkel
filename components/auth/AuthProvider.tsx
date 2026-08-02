"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types/database";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (data) {
        setProfile(data as UserProfile);
      } else {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser && authUser.id === userId) {
          const fallbackProfile: UserProfile = {
            id: authUser.id,
            nama:
              authUser.user_metadata?.full_name ||
              authUser.user_metadata?.nama ||
              authUser.email?.split("@")[0] ||
              "Pengguna",
            email: authUser.email || "",
            nomor_hp: authUser.user_metadata?.nomor_hp || "",
            role: "customer",
            foto: authUser.user_metadata?.avatar_url || null,
            status: "aktif",
            nomor_pelanggan: "AC-" + Math.floor(10000 + Math.random() * 90000),
            notify_email: true,
            notify_reminder: true,
            notify_promo: false,
            created_at: authUser.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          // Coba simpan ke database public.users jika belum ada
          try {
            await supabase.from("users").upsert(fallbackProfile, { onConflict: "id" });
          } catch (e) {
            console.error("Auto-insert user profile error:", e);
          }
          setProfile(fallbackProfile);
        } else {
          setProfile(null);
        }
      }
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await fetchProfile(user.id);
  }, [fetchProfile, user]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { user: current },
      } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(current);
      if (current) await fetchProfile(current.id);
      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) await fetchProfile(nextUser.id);
      else setProfile(null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, supabase]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`profile:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") setProfile(null);
          else setProfile(payload.new as UserProfile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user]);

  const signOut = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("autocraft_last_activity");
    }
    await supabase.auth.signOut({ scope: "global" });
    setUser(null);
    setProfile(null);
  }, [supabase]);

  // Sistem Session Expired 5 Menit jika tidak ada aktivitas / keluar tab terlalu lama
  useEffect(() => {
    if (!user) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("autocraft_last_activity");
      }
      return;
    }

    const TIMEOUT_MS = 5 * 60 * 1000; // 5 menit

    const updateActivity = () => {
      if (typeof window !== "undefined") {
        localStorage.setItem("autocraft_last_activity", Date.now().toString());
      }
    };

    const checkTimeout = async () => {
      if (typeof window === "undefined") return;
      const last = localStorage.getItem("autocraft_last_activity");
      if (last) {
        const diff = Date.now() - parseInt(last, 10);
        if (diff > TIMEOUT_MS) {
          console.warn("[Session] Sesi kadaluarsa (lebih dari 5 menit tanpa aktivitas).");
          await signOut();
          return;
        }
      } else {
        updateActivity();
      }
    };

    // Cek aktivitas awal
    const lastActivity = localStorage.getItem("autocraft_last_activity");
    if (!lastActivity) {
      updateActivity();
    } else {
      checkTimeout();
    }

    const handleUserInteraction = () => {
      const last = localStorage.getItem("autocraft_last_activity");
      if (last && Date.now() - parseInt(last, 10) > TIMEOUT_MS) {
        signOut();
      } else {
        updateActivity();
      }
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((evt) =>
      window.addEventListener(evt, handleUserInteraction, { passive: true })
    );

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkTimeout();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const interval = setInterval(checkTimeout, 10000);

    return () => {
      events.forEach((evt) =>
        window.removeEventListener(evt, handleUserInteraction)
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [user, signOut]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      refreshProfile,
      signOut,
      isStaff: profile?.role === "admin" || profile?.role === "kasir",
      isAdmin: profile?.role === "admin",
    }),
    [user, profile, loading, refreshProfile, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
