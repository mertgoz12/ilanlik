"use client";

import { useEffect, useRef } from "react";
import { useNotifications } from "@/components/notifications-context";
import { markNotificationsReadAction } from "./actions";

// Sayfa açılınca okunmamışları okundu işaretler ve navbar zil sayacını anında
// sıfırlar. Yalnızca okunmamış varsa çalışır.
export function MarkNotificationsRead({ hasUnread }: { hasUnread: boolean }) {
  const { markAllRead } = useNotifications();
  const ran = useRef(false);

  useEffect(() => {
    if (!hasUnread || ran.current) return;
    ran.current = true;
    markAllRead();
    void markNotificationsReadAction();
  }, [hasUnread, markAllRead]);

  return null;
}
