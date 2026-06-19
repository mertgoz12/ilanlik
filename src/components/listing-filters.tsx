import Link from "next/link";
import { FUEL_TYPES } from "@/lib/car-data";
import { FilterBrandModel } from "./filter-brand-model";
import { LocationSelect } from "./location-select";
import { SaveSearchButton } from "./save-search-button";
import { inputClass, labelClass, selectClass } from "./form-ui";
import { ChevronDownIcon, SearchIcon } from "./icons";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1969 }, (_, i) => currentYear - i);

const SORT_OPTIONS = [
  { value: "newest", label: "En Yeni İlanlar" },
  { value: "price-asc", label: "Fiyat: Düşükten Yükseğe" },
  { value: "price-desc", label: "Fiyat: Yüksekten Düşüğe" },
  { value: "km-asc", label: "Kilometre: Azdan Çoğa" },
  { value: "year-desc", label: "Yıl: Yeniden Eskiye" },
];

export function ListingFilters({
  searchParams,
  isLoggedIn = false,
}: {
  searchParams: Record<string, string | undefined>;
  isLoggedIn?: boolean;
}) {
  const hasFilters = Object.values(searchParams).some(Boolean);
  const queryString = new URLSearchParams(
    Object.entries(searchParams).filter(([key, value]) => Boolean(value) && key !== "page") as [string, string][],
  ).toString();

  return (
    <form method="get" className="rounded-lg bg-white p-4 shadow-soft sm:p-5">
      {searchParams.kategori && (
        <input type="hidden" name="kategori" value={searchParams.kategori} />
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={searchParams.q ?? ""}
            placeholder="Marka, model, başlık ara..."
            className={`${inputClass} pl-9`}
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
        >
          Filtrele
        </button>
      </div>

      <details className="group mt-3">
        <summary className="flex w-fit cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-700">
          Detaylı Filtre
          <ChevronDownIcon className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
        </summary>

        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterBrandModel defaultBrand={searchParams.brand} defaultModel={searchParams.model} />

          <LocationSelect defaultIl={searchParams.il} defaultIlce={searchParams.ilce} />

          <div>
            <label htmlFor="minYear" className={labelClass}>
              Min. Yıl
            </label>
            <select
              id="minYear"
              name="minYear"
              defaultValue={searchParams.minYear ?? ""}
              className={selectClass}
            >
              <option value="">Tümü</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="maxYear" className={labelClass}>
              Maks. Yıl
            </label>
            <select
              id="maxYear"
              name="maxYear"
              defaultValue={searchParams.maxYear ?? ""}
              className={selectClass}
            >
              <option value="">Tümü</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="minPrice" className={labelClass}>
              Min. Fiyat (₺)
            </label>
            <input
              id="minPrice"
              name="minPrice"
              type="number"
              min={0}
              defaultValue={searchParams.minPrice ?? ""}
              placeholder="0"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="maxPrice" className={labelClass}>
              Maks. Fiyat (₺)
            </label>
            <input
              id="maxPrice"
              name="maxPrice"
              type="number"
              min={0}
              defaultValue={searchParams.maxPrice ?? ""}
              placeholder="Sınırsız"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="fuelType" className={labelClass}>
              Yakıt Tipi
            </label>
            <select
              id="fuelType"
              name="fuelType"
              defaultValue={searchParams.fuelType ?? ""}
              className={selectClass}
            >
              <option value="">Tümü</option>
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sort" className={labelClass}>
              Sıralama
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={searchParams.sort ?? "newest"}
              className={selectClass}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
            >
              Filtreleri temizle
            </Link>
            <SaveSearchButton query={queryString} isLoggedIn={isLoggedIn} />
          </div>
        )}
      </details>
    </form>
  );
}
