import Link from "next/link";
import { isVasitaEmlakActive } from "@/lib/categories";
import { CATEGORY_THEME_CLASSES, getCategoryVisual } from "@/lib/category-visuals";

// Vasıta aktif olduğunda kullanılacak eski hero kategorileri - kod silinmedi,
// bayrak açıldığında geri döner (bkz. ARAC_EMLAK_AKTIF).
const VASITA_CATEGORIES = [
  { name: "Otomobil", slug: "otomobil" },
  { name: "SUV", slug: "arazi-suv-pickup" },
  { name: "Motosiklet", slug: "motosiklet" },
  { name: "Ticari", slug: "ticari-araclar" },
  { name: "Elektrikli", slug: "elektrikli-araclar" },
];

// İlk yayın sürümünde vitrin ikinci el/sıfır ürünlere odaklı.
const IKINCI_EL_CATEGORIES = [
  { name: "Cep Telefonu", slug: "cep-telefonu" },
  { name: "Bilgisayar", slug: "bilgisayar" },
  { name: "Ev Elektroniği", slug: "ev-elektronigi" },
  { name: "Giyim & Aksesuar", slug: "giyim-aksesuar" },
  { name: "Oyun & Hobi", slug: "oyun-hobi" },
];

export function FeaturedCategories() {
  const categories = isVasitaEmlakActive() ? VASITA_CATEGORIES : IKINCI_EL_CATEGORIES;

  return (
    <section className="mt-5">
      <h2 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
        Kategorilere Göz At
      </h2>
      <div className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
        {categories.map(({ name, slug }) => {
          const { icon: Icon, theme } = getCategoryVisual(slug);
          const t = CATEGORY_THEME_CLASSES[theme];
          return (
            <Link
              key={slug}
              href={`/?kategori=${slug}`}
              className={`group relative flex flex-col items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-br ${t.wash} p-2.5 text-center shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-lg sm:p-3`}
            >
              <span
                className={`absolute -right-5 -top-5 h-16 w-16 rounded-full blur-xl transition-transform duration-300 group-hover:scale-125 ${t.glow}`}
              />
              <span
                className={`relative flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-soft transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-110 sm:h-11 sm:w-11 ${t.badge}`}
              >
                <Icon className="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5" />
              </span>
              <span className="relative text-[11px] font-bold leading-tight text-foreground sm:text-xs">
                {name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
