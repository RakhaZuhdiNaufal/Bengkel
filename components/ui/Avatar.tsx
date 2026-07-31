"use client";

import Image from "next/image";
import { initials } from "@/lib/format";
import { clsx } from "./clsx";

export function Avatar({
  src,
  name,
  size = 64,
  className,
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-full bg-[#2a2a2a] ring-2 ring-white/10",
        className
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt={name} fill className="object-cover" unoptimized />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#3a3a3a] to-[#1f4b7a] text-sm font-bold text-white">
          {initials(name || "AC")}
        </div>
      )}
    </div>
  );
}
