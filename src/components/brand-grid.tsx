import Link from "next/link";
import { BrandBadge, POPULAR_BRANDS } from "./brand-badge";

export function BrandGrid() {
  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Markaya Göre Ara</h2>
        <Link href="/" className="text-sm font-semibold text-brand transition-colors hover:text-accent-dark">
          Tümünü gör
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-6">
        {POPULAR_BRANDS.map((brand) => (
          <Link
            key={brand.name}
            href={`/?brand=${encodeURIComponent(brand.name)}`}
            className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-center shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-soft-lg sm:p-4"
          >
            <BrandBadge abbr={brand.abbr} />
            <span className="truncate text-xs font-semibold text-slate-600 transition-colors group-hover:text-brand sm:text-sm">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
