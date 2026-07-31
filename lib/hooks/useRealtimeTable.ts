"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type TableName =
  | "users"
  | "vehicles"
  | "bookings"
  | "services"
  | "payments"
  | "notifications";

interface Options<T> {
  table: TableName;
  filter?: string;
  enabled?: boolean;
  onInsert?: (row: T) => void;
  onUpdate?: (row: T) => void;
  onDelete?: (old: T) => void;
  onAny?: () => void;
}

export function useRealtimeTable<T extends { id: string }>({
  table,
  filter,
  enabled = true,
  onInsert,
  onUpdate,
  onDelete,
  onAny,
}: Options<T>) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const supabase = createClient();
    const channelName = `rt:${table}:${filter ?? "all"}:${Math.random()
      .toString(36)
      .slice(2)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.eventType === "INSERT") onInsert?.(payload.new as T);
          if (payload.eventType === "UPDATE") onUpdate?.(payload.new as T);
          if (payload.eventType === "DELETE") onDelete?.(payload.old as T);
          onAny?.();
        }
      )
      .subscribe((status) => {
        setReady(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, enabled, onInsert, onUpdate, onDelete, onAny]);

  return { ready };
}
