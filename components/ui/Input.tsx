"use client";

import { clsx } from "./clsx";

export function Input({
  label,
  hint,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
          {label}
        </span>
      )}
      <input
        className={clsx(
          "w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#E07A5F] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      {hint && <span className="text-[11px] text-white/40">{hint}</span>}
    </label>
  );
}

export function Select({
  label,
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
          {label}
        </span>
      )}
      <select
        className={clsx(
          "w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm text-white outline-none transition focus:border-[#E07A5F]",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Textarea({
  label,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
          {label}
        </span>
      )}
      <textarea
        className={clsx(
          "w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#E07A5F]",
          className
        )}
        {...props}
      />
    </label>
  );
}
