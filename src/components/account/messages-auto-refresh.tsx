"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Gelen kutusu (konuşma seçili değilken) canlı kalsın diye sunucu verisini
// birkaç saniyede bir sessizce tazeler. Konuşma açıkken render EDİLMEZ
// (ConversationThread zaten tazeliyor) — böylece çift tazeleme olmaz.
export function MessagesAutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
