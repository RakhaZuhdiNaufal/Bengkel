"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MekanikDashboardRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/mekanik/bookings");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-gray-500 animate-pulse font-medium">Mengarahkan ke Pesanan Masuk...</p>
    </div>
  );
}
