"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type NotificationsContextValue = {
  count: number;
  /** Bildirimler sayfası açılıp tümü okunduğunda rozeti anında sıfırlar. */
  markAllRead: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({
  initialCount,
  children,
}: {
  initialCount: number;
  children: ReactNode;
}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  function markAllRead() {
    setCount(0);
  }

  return (
    <NotificationsContext.Provider value={{ count, markAllRead }}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
