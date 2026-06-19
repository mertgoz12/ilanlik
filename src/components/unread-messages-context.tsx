"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type UnreadMessagesContextValue = {
  count: number;
  /** Bir konuşma okundu olarak işaretlendiğinde rozet sayısını anında düşürür. */
  markRead: (n: number) => void;
};

const UnreadMessagesContext = createContext<UnreadMessagesContextValue | null>(null);

export function UnreadMessagesProvider({
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

  function markRead(n: number) {
    if (n <= 0) return;
    setCount((current) => Math.max(0, current - n));
  }

  return <UnreadMessagesContext.Provider value={{ count, markRead }}>{children}</UnreadMessagesContext.Provider>;
}

export function useUnreadMessages() {
  const ctx = useContext(UnreadMessagesContext);
  if (!ctx) throw new Error("useUnreadMessages must be used within UnreadMessagesProvider");
  return ctx;
}
