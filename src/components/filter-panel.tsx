import Link from "next/link";
import { LocationSelect } from "./location-select";
import { SearchIcon } from "./icons";

// Kategori/arama sonuç sayfalarında sol kolonda (kategori menüsünün altında)
// gösterilen sahibinden tarzı dikey filtre kutusu. GET formu; uyguladığında
// mevcut kategori/arama/görünüm/sıralama parametrelerini korur.
export function FilterPanel({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  // Filtre dışı bağlam parametreleri (uygula'da kaybolmasınlar diye gizli input).
  const preserved: [string, string][] = (["kategori", "q", "sort", "gorunum"] as const)
    .filter((key) => searchParams[key])
    .map((key) => [key, searchParams[key] as string]);

  const hasActiveFilters = Boolean(
    searchParams.il || searchParams.ilce || searchParams.minPrice || searchParams.maxPrice,
  );

  // "Temizle" yalnızca konum/fiyat filtrelerini sıfırlar; kategori/arama kalır.
  const clearHref = (() => {
    const params = new URLSearchParams();
    for (const [key, value] of preserved) params.set(key, value);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  })();

  return (
    <form method="get">
      <h2 className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        Filtrele
      </h2>

      {preserved.map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}

      <div className="space-y-3 px-2">
        <div className="space-y-2">
          <span className="block text-[11px] font-semibold text-slate-500">Adres</span>
          <div className="[&_select]:!rounded-lg [&_select]:!border-slate-200 [&_select]:!bg-slate-50 [&_select]:!px-3 [&_select]:!py-2 [&_select]:!text-[13px] [&_select]:!shadow-none space-y-2">
            <LocationSelect
              defaultIl={searchParams.il}
              defaultIlce={searchParams.ilce}
              hideLabel
            />
          </div>
        </div>

        <div className="space-y-2">
          <span className="block text-[11px] font-semibold text-slate-500">Fiyat (₺)</span>
          <div className="flex items-center gap-2">
            <input
              name="minPrice"
              type="number"
              min={0}
              defaultValue={searchParams.minPrice ?? ""}
              placeholder="Min"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-foreground placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10"
            />
            <span className="text-slate-300">–</span>
            <input
              name="maxPrice"
              type="number"
              min={0}
              defaultValue={searchParams.maxPrice ?? ""}
              placeholder="Max"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-foreground placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10"
            />
          </div>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-brand/90"
        >
          <SearchIcon className="h-4 w-4" />
          Filtrele
        </button>

        {hasActiveFilters && (
          <Link
            href={clearHref}
            className="block text-center text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-700"
          >
            Filtreleri temizle
          </Link>
        )}
      </div>
    </form>
  );
}
