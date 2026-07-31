"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Calendar,
  Car,
  CreditCard,
  FileBarChart2,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { clsx } from "@/components/ui/clsx";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/customers", label: "Customer", icon: Users },
  { href: "/admin/vehicles", label: "Kendaraan", icon: Car },
  { href: "/admin/bookings", label: "Booking", icon: Calendar },
  { href: "/admin/services", label: "Servis", icon: Wrench },
  { href: "/admin/payments", label: "Pembayaran", icon: CreditCard },
  { href: "/admin/reports", label: "Laporan", icon: FileBarChart2 },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading, isStaff, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isStaff) router.replace("/login");
  }, [loading, isStaff, router]);

  if (loading || !profile || !isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white/60">
        Memuat dashboard...
      </div>
    );
  }

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="mb-8 px-2">
        <Link href="/admin" className="font-[family-name:var(--font-display)] text-xl font-black tracking-tight text-white">
          AUTO CRAFT
        </Link>
        <p className="mt-1 text-xs text-white/40">Panel {profile.role}</p>
      </div>
      <nav className="flex-1 space-y-1">
        {nav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-[#E07A5F] text-white shadow-lg shadow-[#E07A5F]/20"
                  : "text-white/65 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 border-t border-white/10 pt-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <Avatar src={profile.foto} name={profile.nama} size={40} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{profile.nama}</p>
            <Badge tone="info">{profile.role}</Badge>
          </div>
        </div>
        <button
          onClick={async () => {
            await signOut();
            router.push("/login");
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-white/10 bg-[#0d0d0d]/95 p-5 lg:block">
        {Sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[280px] border-r border-white/10 bg-[#0d0d0d] p-5">
            {Sidebar}
          </aside>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#0a0a0b]/90 px-4 py-3 backdrop-blur-md lg:px-8">
          <button
            className="rounded-lg border border-white/10 p-2 lg:hidden"
            onClick={() => setOpen(true)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <p className="text-sm font-semibold text-white/70 lg:text-base">
            Dashboard Admin / Kasir
          </p>
          <Link href="/home" className="text-xs text-white/40 hover:text-white">
            Lihat situs
          </Link>
        </header>
        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
