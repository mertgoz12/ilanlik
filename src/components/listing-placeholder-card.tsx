import Link from "next/link";
import { ClockIcon } from "@/components/icons";
import { CATEGORY_THEME_CLASSES, getCategoryVisual } from "@/lib/category-visuals";

// Kategori sayfalarında gerçek ilan sayısı azken, ızgarayı görsel olarak
// dolduran "İlan Bekleniyor" placeholder kartı. DÜRÜSTLÜK KURALI: bu kartta
// SAHTE ürün adı, fiyat veya fotoğraf YOKTUR - sadece bulanık kategori teması,
// bir tarama animasyonu ve net "İlan Bekleniyor" etiketi gösterilir. Tıklanınca
// kullanıcıyı, kategori önceden seçili gelecek şekilde /ilan-ver'e yönlendirir
// ("ilk ilanı sen ver" daveti). Bkz. page.tsx (kategori ızgarası).
type ListingPlaceholderCardProps = {
  // Görsel tema (ikon/renk) için gösterilen kategori slug'ı.
  categorySlug: string;
};

export function ListingPlaceholderCard({ categorySlug }: ListingPlaceholderCardProps) {
  const { icon: CategoryIcon, theme } = getCategoryVisual(categorySlug);
  const t = CATEGORY_THEME_CLASSES[theme];

  return (
    <Link
      href={`/ilan-ver?kategori=${encodeURIComponent(categorySlug)}`}
      aria-label="Bu kategoride ilan ver, ilk sen ol"
      className="group relative flex flex-col overflow-hidden rounded-lg bg-white shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-lg"
    >
      <div className={`relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br ${t.wash}`}>
        {/* Soluk marka renkli glow - "boş ama yakında dolacak" hissi */}
        <div className={`absolute -inset-6 opacity-40 blur-2xl ${t.glow}`} />
        {/* Bulanık kategori ikonu: sahte ürün fotoğrafı DEĞİL, sadece desen */}
        <div className="absolute inset-0 flex items-center justify-center">
          <CategoryIcon className="h-20 w-20 text-slate-400/25 blur-[3px]" />
        </div>
        {/* Tarama / skeleton animasyon çizgisi (bkz. globals.css scan-line) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-scan-line absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-transparent via-white/70 to-transparent" />
        </div>
        {/* Net etiket - kullanıcıya durumu açıkça söyler */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/70 px-2.5 py-1 text-[11px] font-bold text-brand shadow-sm backdrop-blur-sm">
            <ClockIcon className="h-3 w-3" />
            İlan Bekleniyor
          </span>
        </div>
      </div>

      {/* Gövde: SAHTE başlık/fiyat yok. Soluk iskelet çubukları kart yüksekliğini
          gerçek kartlarla hizalar; hover'da "ilk sen ol" daveti belirir. */}
      <div className="flex flex-1 flex-col gap-2 p-2 sm:p-2.5">
        <div className="h-2.5 w-4/5 rounded-full bg-slate-100" />
        <div className="h-2.5 w-2/5 rounded-full bg-slate-100" />
        <p className="mt-auto flex items-center gap-0.5 pt-1 text-[11px] font-semibold text-brand opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          İlk ilanı sen ver →
        </p>
      </div>
    </Link>
  );
}
