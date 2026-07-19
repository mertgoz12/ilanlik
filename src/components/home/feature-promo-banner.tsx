import Link from "next/link";
import { Crown, ArrowRight } from "lucide-react";
import { LISTINGS_PER_FEATURE } from "@/lib/featuring";

// Ana sayfa promosyon şeridi: "her 3 ilan için 1 ücretsiz öne çıkarma" kuralını
// duyurur ve ilan vermeye yönlendirir (bkz. src/lib/featuring.ts).
export function FeaturePromoBanner() {
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-brand via-brand-700 to-brand-900 p-4 shadow-soft ring-1 ring-accent/30 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-dark text-white shadow-soft">
            <Crown className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h2 className="flex flex-wrap items-center gap-2 text-base font-bold text-white sm:text-lg">
              {LISTINGS_PER_FEATURE} İlan Ver, 1 İlanını Ücretsiz Öne Çıkar!
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-900">
                Ücretsiz
              </span>
            </h2>
            <p className="mt-0.5 text-sm text-brand-100">
              Yayında olan her {LISTINGS_PER_FEATURE} ilanın için 1 ilanını vitrine taşı, aramaların
              en üstünde yer al ve daha çok alıcıya ulaş.
            </p>
          </div>
        </div>
        <Link
          href="/ilan-ver"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-brand-900 shadow-soft transition-colors hover:bg-accent-dark hover:text-white"
        >
          Ücretsiz İlan Ver
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
