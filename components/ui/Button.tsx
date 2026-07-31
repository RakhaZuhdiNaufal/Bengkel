"use client";

import { clsx } from "./clsx";

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}) {
  const variants = {
    primary:
      "bg-[#E07A5F] hover:bg-[#d0694e] text-white shadow-lg shadow-[#E07A5F]/15",
    secondary: "bg-white/10 hover:bg-white/15 text-white",
    ghost: "bg-transparent hover:bg-white/5 text-white/80",
    danger: "bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30",
    outline: "bg-transparent border border-white/15 hover:border-white/30 text-white",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-sm",
  };

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
