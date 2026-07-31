"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Redirect legacy /akun → /profile */
export default function AkunRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/profile");
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center text-white/60">
      Mengalihkan ke Profile...
    </div>
  );
}
