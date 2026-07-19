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

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-soft sm:px-4">
      <p className="text-sm font-semibold text-foreground">
        {total.toLocaleString("tr-TR")} <span className="font-normal text-slate-500">ilan</span>
      </p>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Görünüm geçişi */}
        <div className="flex items-center rounded-lg border border-slate-200 p-0.5">
          <button
            type="button"
            onClick={() => router.push(withParam("gorunum", "liste"))}
            aria-label="Liste görünümü"
            aria-pressed={view === "liste"}
            className={`flex h-7 w-8 items-center justify-center rounded-md transition-colors ${
              view === "liste" ? "bg-accent text-brand" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => router.push(withParam("gorunum", "izgara"))}
            aria-label="Izgara görünümü"
            aria-pressed={view === "izgara"}
            className={`flex h-7 w-8 items-center justify-center rounded-md transition-colors ${
              view === "izgara" ? "bg-accent text-brand" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>

        <span className="hidden h-5 w-px bg-slate-200 sm:block" />

        <SaveSearchButton query={saveQuery} isLoggedIn={isLoggedIn} />

        <span className="hidden h-5 w-px bg-slate-200 sm:block" />

        <div className="flex items-center gap-1.5">
          <span className="hidden text-xs font-medium text-slate-500 sm:inline">İlanları Sırala</span>
          <select
            value={sort}
            onChange={(event) => router.push(withParam("sort", event.target.value))}
            aria-label="İlanları sırala"
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[13px] font-medium text-slate-700 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
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
