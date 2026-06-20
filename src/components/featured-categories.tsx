import Link from "next/link";
import { Bike, Car, Gamepad2, Laptop, Mountain, Shirt, Smartphone, Truck, Tv, Zap } from "lucide-react";
import { isVasitaEmlakActive } from "@/lib/categories";

type ThemeKey = "indigo" | "sky" | "violet" | "rose" | "emerald";

// Tailwind sınıfları derleme anında statik olarak taranabildiği için (renk
// adı çalışma zamanında string birleştirmeyle üretilemez), her tema burada
// tam sınıf metniyle tanımlanır - aşağıdaki nesne sadece bir lookup'tır.
const THEME: Record<ThemeKey, { wash: string; badge: string; glow: string }> = {
  indigo: {
    wash: "from-white to-indigo-50",
    badge: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    glow: "bg-indigo-400/25",
  },
  sky: {
    wash: "from-white to-sky-50",
    badge: "bg-gradient-to-br from-sky-500 to-sky-600",
    glow: "bg-sky-400/25",
  },
  violet: {
    wash: "from-white to-violet-50",
    badge: "bg-gradient-to-br from-violet-500 to-violet-600",
    glow: "bg-violet-400/25",
  },
  rose: {
    wash: "from-white to-rose-50",
    badge: "bg-gradient-to-br from-rose-500 to-rose-600",
    glow: "bg-rose-400/25",
  },
  emerald: {
    wash: "from-white to-emerald-50",
    badge: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    glow: "bg-emerald-400/25",
  },
};

// Vasıta aktif olduğunda kullanılacak eski hero kategorileri - kod silinmedi,
// bayrak açıldığında geri döner (bkz. ARAC_EMLAK_AKTIF).
const VASITA_CATEGORIES = [
  { name: "Otomobil", slug: "otomobil", icon: Car, theme: "indigo" as ThemeKey },
  { name: "SUV", slug: "arazi-suv-pickup", icon: Mountain, theme: "emerald" as ThemeKey },
  { name: "Motosiklet", slug: "motosiklet", icon: Bike, theme: "rose" as ThemeKey },
  { name: "Ticari", slug: "ticari-araclar", icon: Truck, theme: "sky" as ThemeKey },
  { name: "Elektrikli", slug: "elektrikli-araclar", icon: Zap, theme: "violet" as ThemeKey },
];

// İlk yayın sürümünde vitrin ikinci el/sıfır ürünlere odaklı.
const IKINCI_EL_CATEGORIES = [
  { name: "Cep Telefonu", slug: "cep-telefonu", icon: Smartphone, theme: "indigo" as ThemeKey },
  { name: "Bilgisayar", slug: "bilgisayar", icon: Laptop, theme: "sky" as ThemeKey },
  { name: "Ev Elektroniği", slug: "ev-elektronigi", icon: Tv, theme: "violet" as ThemeKey },
  { name: "Giyim & Aksesuar", slug: "giyim-aksesuar", icon: Shirt, theme: "rose" as ThemeKey },
  { name: "Oyun & Hobi", slug: "oyun-hobi", icon: Gamepad2, theme: "emerald" as ThemeKey },
];

export function FeaturedCategories() {
  const categories = isVasitaEmlakActive() ? VASITA_CATEGORIES : IKINCI_EL_CATEGORIES;

  return (
    <section className="border-b border-slate-200/70 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">Kategorilere Göz At</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {categories.map(({ name, slug, icon: Icon, theme }) => {
            const t = THEME[theme];
            return (
              <Link
                key={slug}
                href={`/?kategori=${slug}`}
                className={`group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br ${t.wash} p-5 text-center shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg`}
              >
                <span
                  className={`absolute -right-7 -top-7 h-24 w-24 rounded-full blur-2xl transition-transform duration-300 group-hover:scale-125 ${t.glow}`}
                />
                <span
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-soft transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110 sm:h-16 sm:w-16 ${t.badge}`}
                >
                  <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                </span>
                <span className="relative text-sm font-bold text-foreground sm:text-base">{name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
