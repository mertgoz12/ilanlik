"use client";

import { useRef } from "react";
import Link from "next/link";
import { isVasitaEmlakActive } from "@/lib/categories";
import { CATEGORY_THEME_CLASSES, getCategoryVisual } from "@/lib/category-visuals";
import { ChevronRightIcon } from "./icons";

// Vasıta aktif olduğunda kullanılacak eski hero kategorileri - kod silinmedi,
// bayrak açıldığında geri döner (bkz. ARAC_EMLAK_AKTIF).
const VASITA_CATEGORIES = [
  { name: "Otomobil", slug: "otomobil" },
  { name: "SUV", slug: "arazi-suv-pickup" },
  { name: "Motosiklet", slug: "motosiklet" },
  { name: "Ticari", slug: "ticari-araclar" },
  { name: "Elektrikli", slug: "elektrikli-araclar" },
];

// İlk yayın sürümünde vitrin ikinci el/sıfır ürünlere odaklı - gerçek
// kategori ağacındaki (categories.ts) isim/slug'larla eşleşir.
const IKINCI_EL_CATEGORIES = [
  { name: "Elektronik", slug: "elektronik" },
  { name: "Cep Telefonu", slug: "cep-telefonu" },
  { name: "Bilgisayar", slug: "bilgisayar" },
  { name: "Ev & Yaşam", slug: "ev-yasam" },
  { name: "Moda & Giyim", slug: "giyim-aksesuar" },
  { name: "Hobi & Eğlence", slug: "hobi-oyuncak" },
  { name: "Spor & Outdoor", slug: "spor" },
  { name: "Yedek Parça", slug: "yedek-parca-aksesuar-donanim-tuning" },
];

export function FeaturedCategories() {
  const categories = isVasitaEmlakActive() ? VASITA_CATEGORIES : IKINCI_EL_CATEGORIES;
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 260, behavior: "smooth" });
  }

  return (
    <section className="mt-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
          Kategorilere Göz At
        </h2>
        <Link
          href="/site-haritasi"
          className="shrink-0 text-xs font-semibold text-brand hover:text-accent-dark sm:text-sm"
        >
          Tüm Kategoriler ›
        </Link>
      </div>

      <div className="relative mt-2.5">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-1 pr-2 scrollbar-hide"
        >
          {categories.map(({ name, slug }) => {
            const { icon: Icon, theme } = getCategoryVisual(slug);
            const t = CATEGORY_THEME_CLASSES[theme];
            return (
              <Link
                key={slug}
                href={`/?kategori=${slug}`}
                className="group flex w-[104px] shrink-0 flex-col items-center gap-2 rounded-xl border border-slate-100 bg-white p-3 text-center shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-soft-lg sm:w-[120px]"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-soft transition-transform duration-200 group-hover:scale-110 sm:h-11 sm:w-11 ${t.badge}`}
                >
                  <Icon className="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5" />
                </span>
                <span className="text-[11px] font-bold leading-tight text-foreground sm:text-xs">
                  {name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Yatay kaydırmada sonraki kart yarım kesik göründüğünde "bozuk"
            durmasın diye sağ kenar yumuşak bir beyaz geçişle maskelenir -
            ok butonu bu geçişin üzerinde durur. */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-12 bg-gradient-to-l from-white via-white/80 to-transparent sm:block" />

        <button
          type="button"
          onClick={scrollRight}
          aria-label="Sağa kaydır"
          className="absolute right-0 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-500 shadow-soft-lg ring-1 ring-slate-100 transition-colors hover:text-brand sm:flex"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
