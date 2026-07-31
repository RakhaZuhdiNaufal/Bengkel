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
  isStaff: boolean;
  isAdmin: boolean;
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
      setProfile(data ? (data as UserProfile) : null);
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
    await supabase.auth.signOut({ scope: "global" });
    setUser(null);
    setProfile(null);
  }, [supabase]);

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
