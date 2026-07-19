import Link from "next/link";
import { LocationSelect } from "./location-select";
import { SearchIcon, CheckIcon, ChevronDownIcon } from "./icons";

// İlan tarihi hızlı filtresi - değer = son N gün (bkz. buildListingWhere sp.tarih).
const DATE_OPTIONS = [
  { value: "1", label: "Son 24 saat" },
  { value: "2", label: "Son 2 gün içinde" },
  { value: "7", label: "Son 7 gün içinde" },
  { value: "15", label: "Son 15 gün içinde" },
  { value: "30", label: "Son 30 gün içinde" },
];

// Kategori/arama sonuç sayfalarında sol kolonda gösterilen sahibinden tarzı
// dikey filtre kutusu. GET formu; uyguladığında kategori/görünüm/sıralama
// bağlamını korur. Adres, fiyat, ilan tarihi ve kelime/ilan no ile arama.
export function FilterPanel({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  // Filtre dışı bağlam parametreleri (uygula'da kaybolmasınlar diye gizli input).
  const preserved: [string, string][] = (["kategori", "sort", "gorunum"] as const)
    .filter((key) => searchParams[key])
    .map((key) => [key, searchParams[key] as string]);

  const hasActiveFilters = Boolean(
    searchParams.il ||
      searchParams.ilce ||
      searchParams.minPrice ||
      searchParams.maxPrice ||
      searchParams.tarih ||
      searchParams.q,
  );

  // "Filtreleri temizle" yalnızca filtreleri sıfırlar; kategori bağlamı kalır.
  const clearHref = (() => {
    const params = new URLSearchParams();
    for (const [key, value] of preserved) params.set(key, value);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  })();

  return (
    <form method="get">
      <h2 className="mb-2 px-2 text-[13px] font-bold text-foreground">Filtrele</h2>

      {preserved.map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}

      <div className="space-y-4 px-2">
        {/* Adres */}
        <div className="space-y-2">
          <span className="block text-[12px] font-bold text-foreground">Adres</span>
          <div className="[&_label]:!mb-1 [&_label]:!text-[11px] [&_label]:!font-medium [&_label]:!text-slate-500 [&_select]:!rounded-lg [&_select]:!border-slate-200 [&_select]:!bg-slate-50 [&_select]:!px-3 [&_select]:!py-2 [&_select]:!text-[13px] [&_select]:!shadow-none space-y-2">
            <LocationSelect defaultIl={searchParams.il} defaultIlce={searchParams.ilce} />
          </div>
        </div>

        {/* Fiyat */}
        <div className="space-y-2">
          <span className="block text-[12px] font-bold text-foreground">Fiyat</span>
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

        {/* İlan Tarihi */}
        <details className="group border-t border-slate-100 pt-3" open>
          <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-bold text-foreground [&::-webkit-details-marker]:hidden">
            İlan Tarihi
            <ChevronDownIcon className="h-4 w-4 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="mt-2 space-y-1.5">
            {DATE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="radio"
                  name="tarih"
                  value={opt.value}
                  defaultChecked={searchParams.tarih === opt.value}
                  className="peer sr-only"
                />
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 bg-white transition-colors peer-checked:border-brand peer-checked:bg-brand">
                  <CheckIcon className="h-3 w-3 text-white opacity-0 peer-checked:opacity-100" />
                </span>
                <span className="text-[13px] text-slate-600 peer-checked:font-semibold peer-checked:text-foreground">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </details>

        {/* Kelime / ilan no ile ara */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <span className="block text-[12px] font-bold text-foreground">Kelime ile Ara</span>
          <input
            name="q"
            type="text"
            defaultValue={searchParams.q ?? ""}
            placeholder="Kelime veya ilan numarası girin"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-foreground placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10"
          />
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2.5 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-brand/90"
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
