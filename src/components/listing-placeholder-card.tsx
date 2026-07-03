import Link from "next/link";
import { Crown } from "lucide-react";
import { ClockIcon } from "@/components/icons";
import { CATEGORY_THEME_CLASSES, getCategoryVisual } from "@/lib/category-visuals";

// Kategori/vitrin ızgaralarında gerçek ilan sayısı azken boş alanı dolduran
// "İlan Bekleniyor" placeholder kartı. DÜRÜSTLÜK KURALI: bu kartta SAHTE ürün
// adı, fiyat veya fotoğraf YOKTUR - sadece bulanık tema, tarama animasyonu ve
// net "İlan Bekleniyor" etiketi gösterilir. Tıklanınca kullanıcıyı, kategori
// önceden seçili gelecek şekilde /ilan-ver'e yönlendirir.
//
// `premium=true` → ana sayfadaki "Öne Çıkan İlanlar" vitrini için altın/parlak
// varyant (bkz. page.tsx). Görsel olarak daha dikkat çekicidir ama içeriği yine
// tamamen placeholder'dır.
type ListingPlaceholderCardProps = {
  // Görsel tema (ikon/renk) ve /ilan-ver ön-seçimi için kategori slug'ı.
  categorySlug: string;
  premium?: boolean;
};

export function ListingPlaceholderCard({ categorySlug, premium = false }: ListingPlaceholderCardProps) {
  const { icon: CategoryIcon, theme } = getCategoryVisual(categorySlug);
  const t = CATEGORY_THEME_CLASSES[theme];

  return (
    <Link
      href={`/ilan-ver?kategori=${encodeURIComponent(categorySlug)}`}
      aria-label={premium ? "Öne çıkan ilan alanı - ilan ver" : "Bu kategoride ilan ver, ilk sen ol"}
      className={`group relative flex flex-col overflow-hidden rounded-lg bg-white transition-all duration-200 hover:-translate-y-1 ${
        premium
          ? "shadow-soft-lg ring-2 ring-accent/60 hover:shadow-soft-lg hover:ring-accent"
          : "shadow-soft hover:shadow-soft-lg"
      }`}
    >
      <div
        className={`relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br ${
          premium ? "from-accent-light via-white to-amber-50" : t.wash
        }`}
      >
        {/* Soluk glow - "boş ama dolacak" hissi; premium'da altın tonlu */}
        <div
          className={`absolute -inset-6 opacity-40 blur-2xl ${premium ? "bg-accent/30" : t.glow}`}
        />
        {/* Bulanık kategori ikonu: sahte ürün fotoğrafı DEĞİL, sadece desen */}
        <div className="absolute inset-0 flex items-center justify-center">
          <CategoryIcon
            className={`h-20 w-20 blur-[3px] ${premium ? "text-accent/25" : "text-slate-400/25"}`}
          />
        </div>
        {/* Tarama / skeleton animasyon çizgisi (bkz. globals.css scan-line) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className={`animate-scan-line absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-transparent to-transparent ${
              premium ? "via-accent/40" : "via-white/70"
            }`}
          />
        </div>
        {/* Premium rozeti - "Öne Çıkan" */}
        {premium && (
          <span className="absolute left-1 top-1 inline-flex items-center gap-0.5 rounded-md bg-gradient-to-br from-accent to-accent-dark px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
            <Crown className="h-2.5 w-2.5" />
            Öne Çıkan
          </span>
        )}
        {/* Net etiket - kullanıcıya durumu açıkça söyler */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-sm backdrop-blur-sm ${
              premium
                ? "border-accent/40 bg-white/80 text-accent-dark"
                : "border-white/60 bg-white/70 text-brand"
            }`}
          >
            <ClockIcon className="h-3 w-3" />
            İlan Bekleniyor
          </span>
        </div>
      </div>

      {/* Gövde: SAHTE başlık/fiyat yok. Soluk iskelet çubukları kart yüksekliğini
          gerçek kartlarla hizalar; hover'da davet metni belirir. */}
      <div className="flex flex-1 flex-col gap-2 p-2 sm:p-2.5">
        <div className={`h-2.5 w-4/5 rounded-full ${premium ? "bg-accent-light" : "bg-slate-100"}`} />
        <div className={`h-2.5 w-2/5 rounded-full ${premium ? "bg-accent-light" : "bg-slate-100"}`} />
        <p
          className={`mt-auto flex items-center gap-0.5 pt-1 text-[11px] font-semibold opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
            premium ? "text-accent-dark" : "text-brand"
          }`}
        >
          {premium ? "İlanın burada öne çıksın →" : "İlk ilanı sen ver →"}
        </p>
      </div>
    </Link>
  );
}
