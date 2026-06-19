"use client";

import type { ReactNode } from "react";

// <summary> içine konan düzenle/sil butonlarının tıklamasının, üst <details>'i
// aç/kapa tetiklememesi için kullanılır. Server Component'ten DOM elemanına
// doğrudan onClick geçirilemez (bkz. Next.js RSC kısıtı); bu yüzden küçük bir
// Client Component'e taşındı.
export function SummaryActions({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={className} onClick={(e) => e.preventDefault()}>
      {children}
    </div>
  );
}
