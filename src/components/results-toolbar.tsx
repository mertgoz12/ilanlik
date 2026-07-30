"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
  sort: string;
  saveQuery: string;
  isLoggedIn: boolean;
};

// Kategori/arama sonuç sayfasının üst şeridi: sol tarafta ilan sayısı, sağ
// tarafta "Aramayı Kaydet" ve "İlanları Sırala". (İlanlar her zaman ızgara/kart
// görünümünde; liste görünümü kaldırıldı.)
export function ResultsToolbar({ total, sort, saveQuery, isLoggedIn }: ResultsToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function withParam(key: string, value: string): string {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.delete("page");
    return `?${params.toString()}`;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-soft sm:px-4">
      <p className="text-[15px] font-bold text-foreground">
        {total.toLocaleString("tr-TR")} <span className="text-sm font-medium text-slate-400">ilan</span>
      </p>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
