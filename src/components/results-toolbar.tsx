"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { List, LayoutGrid } from "lucide-react";
import { SaveSearchButton } from "./save-search-button";

const SORT_OPTIONS = [
  { value: "newest", label: "En Yeni İlanlar" },
  { value: "price-asc", label: "Fiyat: Düşükten Yükseğe" },
  { value: "price-desc", label: "Fiyat: Yüksekten Düşüğe" },
  { value: "km-asc", label: "Kilometre: Azdan Çoğa" },
  { value: "year-desc", label: "Yıl: Yeniden Eskiye" },
];

type ResultsToolbarProps = {
  total: number;
  view: "liste" | "izgara";
  sort: string;
  saveQuery: string;
  isLoggedIn: boolean;
};

// Kategori/arama sonuç sayfasının üst şeridi (bkz. sahibinden tarzı düzen):
// sol tarafta ilan sayısı, sağ tarafta liste/ızgara görünüm geçişi, "Aramayı
// Kaydet" ve "İlanları Sırala" açılır menüsü.
export function ResultsToolbar({ total, view, sort, saveQuery, isLoggedIn }: ResultsToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function withParam(key: string, value: string): string {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.delete("page");
    return `?${params.toString()}`;
  }

  const toggleBtn = (active: boolean) =>
    `flex h-7 w-8 items-center justify-center rounded-md transition-all ${
      active ? "bg-white text-brand shadow-sm ring-1 ring-slate-200/70" : "text-slate-400 hover:text-slate-600"
    }`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-soft sm:px-4">
      <p className="text-[15px] font-bold text-foreground">
        {total.toLocaleString("tr-TR")} <span className="text-sm font-medium text-slate-400">ilan</span>
      </p>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Görünüm geçişi - segmentli kontrol */}
        <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => router.push(withParam("gorunum", "liste"))}
            aria-label="Liste görünümü"
            aria-pressed={view === "liste"}
            className={toggleBtn(view === "liste")}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => router.push(withParam("gorunum", "izgara"))}
            aria-label="Izgara görünümü"
            aria-pressed={view === "izgara"}
            className={toggleBtn(view === "izgara")}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>

        <span className="hidden h-5 w-px bg-slate-200 sm:block" />

        <SaveSearchButton query={saveQuery} isLoggedIn={isLoggedIn} />

        <span className="hidden h-5 w-px bg-slate-200 sm:block" />

        <div className="flex items-center gap-1.5">
          <span className="hidden text-xs font-medium text-slate-500 sm:inline">Sırala</span>
          <select
            value={sort}
            onChange={(event) => router.push(withParam("sort", event.target.value))}
            aria-label="İlanları sırala"
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-white focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
