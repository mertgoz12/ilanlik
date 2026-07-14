import Link from "next/link";
import { ClockIcon } from "@/components/icons";
import { CATEGORY_THEME_CLASSES, getCategoryVisual } from "@/lib/category-visuals";

// Placeholder ("İlan Bekleniyor") ızgaralarında görsel çeşitlilik için sırayla
// döndürülen kategori temaları (ikon/renk). Ana sayfa vitrini, "Öne Çıkan
// İlanlar" bölümü ve /one-cikan-ilanlar sayfası ortak kullanır.
export const PLACEHOLDER_CATEGORY_SLUGS = [
  "cep-telefonu",
  "dizustu-bilgisayar",
  "koltuk-kanepe",
  "spor-ayakkabi",
  "bisiklet",
  "gitar",
  "buzdolabi",
  "oyun-konsolu",
  "canta",
  "saat",
  "kulaklik",
  "kahve-makinesi",
  "televizyon",
  "fotograf-makinesi",
  "klima",
  "camasir-makinesi",
  "kadin-giyim",
  "erkek-giyim",
];

// Kategori/vitrin ızgaralarında gerçek ilan sayısı azken boş alanı dolduran
// "İlan Bekleniyor" placeholder kartı. DÜRÜSTLÜK KURALI: bu kartta SAHTE ürün
// adı, fiyat veya fotoğraf YOKTUR — sadece tema ikonu, skeleton animasyonu ve
// "İlan Bekleniyor" etiketi gösterilir. Tıklanınca /ilan-ver'e yönlendirir.
//
// `premium=true` → "Öne Çıkan İlanlar" bölümündeki varyant. Diğer kartlarla
// tutarlı stil; ince altın yüzük ring ile normal placeholder'dan ayrılır.
type ListingPlaceholderCardProps = {
  categorySlug: string;
  premium?: boolean;
};

export function ListingPlaceholderCard({ categorySlug, premium = false }: ListingPlaceholderCardProps) {
  const { icon: CategoryIcon, theme } = getCategoryVisual(categorySlug);
  const t = CATEGORY_THEME_CLASSES[theme];

  return (
    <Link
      href={`/ilan-ver?kategori=${encodeURIComponent(categorySlug)}`}
      aria-label="Bu kategoride ilan ver, ilk sen ol"
      className={`group flex flex-col overflow-hidden rounded-lg bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-lg ${
        premium ? "shadow-soft ring-1 ring-accent/25" : "shadow-soft"
      }`}
    >
      {/* Görsel alan: skeleton pulse + bulanık ikon */}
      <div className={`relative aspect-[4/3] w-full overflow-hidden ${t.wash} animate-pulse`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <CategoryIcon className="h-16 w-16 text-slate-400/20 blur-[2px]" />
        </div>
        {/* Tarama / shimmer çizgisi */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-scan-line absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent via-white/60 to-transparent" />
        </div>
        {/* "İlan Bekleniyor" etiketi */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/75 px-2.5 py-1 text-[11px] font-semibold text-slate-500 shadow-sm backdrop-blur-sm">
            <ClockIcon className="h-3 w-3" />
            İlan Bekleniyor
          </span>
        </div>
      </div>

      {/* Gövde: iskelet çubuklar, hover'da davet metni */}
      <div className="flex flex-1 flex-col gap-2 p-2 sm:p-2.5">
        <div className="h-2.5 w-4/5 rounded-full bg-slate-100" />
        <div className="h-2.5 w-2/5 rounded-full bg-slate-100" />
        <p className="mt-auto pt-1 text-[11px] font-semibold text-brand opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          İlk ilanı sen ver →
        </p>
      </div>
    </Link>
  );
}
