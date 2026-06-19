"use client";

import { useEffect, useState } from "react";
import { BellIcon } from "@/components/icons";

function getGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 6) return "İyi geceler";
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
}

export function AdminTopbar({ adminName }: { adminName: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f172a] via-[#0f3d2e] to-[#0f172a] px-5 py-4 text-white shadow-soft-lg sm:px-6">
      <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-300/80">
            {now ? getGreeting(now) : "Yönetim Paneli"}
          </p>
          <p className="mt-0.5 truncate text-lg font-semibold">{adminName}</p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-white/10 text-emerald-200 sm:flex">
            <BellIcon className="h-4.5 w-4.5" />
          </span>
          {now && (
            <div className="text-right">
              <p className="text-sm font-semibold tabular-nums">
                {now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-xs text-white/60">
                {now.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
