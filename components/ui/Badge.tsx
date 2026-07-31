"use client";

import { clsx } from "./clsx";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "accent";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/10 text-white/80 border-white/10",
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    danger: "bg-red-500/15 text-red-300 border-red-500/30",
    info: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    accent: "bg-[#E07A5F]/20 text-[#E07A5F] border-[#E07A5F]/40",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): "neutral" | "success" | "warning" | "danger" | "info" | "accent" {
  const s = status.toLowerCase();
  if (["aktif", "lunas", "selesai", "diterima"].includes(s)) return "success";
  if (["menunggu", "pending", "diproses", "proses"].includes(s)) return "warning";
  if (["ditolak", "dibatalkan", "gagal", "nonaktif", "suspended", "refund"].includes(s))
    return "danger";
  if (["admin", "kasir"].includes(s)) return "info";
  return "accent";
}
