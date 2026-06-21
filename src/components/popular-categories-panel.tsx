import Link from "next/link";
import { getPopularSearchesAction } from "@/lib/actions/search-suggestions";

// Sayfa az ilanla bile dolu görünsün diye - bu panel ilan sayısından
// bağımsız olarak her zaman kategori taksonomisinden beslenir, dolayısıyla
// hiçbir zaman boş kalmaz (bkz. search-suggestions.ts'teki aynı sorgu, arama
// kutusu boşken gösterilen "popüler kategoriler" ile aynı kaynak).
export async function PopularCategoriesPanel() {
  const { categories } = await getPopularSearchesAction();
  if (categories.length === 0) return null;

  return (
    <section className="mt-5 rounded-lg bg-white p-3 shadow-soft sm:p-4">
      <h2 className="text-sm font-bold text-foreground sm:text-base">Popüler Kategoriler</h2>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/?kategori=${category.slug}`}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-accent hover:bg-accent-light hover:text-brand"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
