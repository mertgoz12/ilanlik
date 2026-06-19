"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export const COMING_SOON_MESSAGE = "Bu kategori çok yakında açılacak.";

// Vasıta/Emlak gibi kapalı kategoriler için: link yerine kullanılır, normal
// navigasyon yapmaz, tıklanınca kısa süreliğine bir bilgi balonu gösterir.
// Menüde "tamamen gizleme" yerine merak uyandırmak için kullanılır.
export function ComingSoonTrigger({ children, className }: { children: ReactNode; className?: string }) {
  const [show, setShow] = useState(false);

  function handleClick() {
    setShow(true);
    window.setTimeout(() => setShow(false), 2500);
  }

  return (
    <span className="relative inline-block">
      <button type="button" onClick={handleClick} className={className}>
        {children}
      </button>
      {show && (
        <span className="absolute left-1/2 top-full z-30 mt-1.5 w-52 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-center text-xs font-medium text-white shadow-soft-lg animate-fade-in-up">
          {COMING_SOON_MESSAGE}
        </span>
      )}
    </span>
  );
}

export function ComingSoonBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 ${className}`}
    >
      Çok Yakında
    </span>
  );
}
