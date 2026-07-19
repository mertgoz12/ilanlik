import type { Metadata } from "next";
import Link from "next/link";
import { Crown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ListingCard } from "@/components/listing-card";
import {
  ListingPlaceholderCard,
  PLACEHOLDER_CATEGORY_SLUGS,
} from "@/components/listing-placeholder-card";

export const metadata: Metadata = {
  title: "Öne Çıkan İlanlar - İlanlio",
  description: "Vitrindeki öne çıkan ilan alanı. İlanını buraya taşı, daha çok alıcıya ulaş.",
};

// Izgarayı görsel olarak dolu tutmak için hedeflenen toplam kart sayısı;
// gerçek öne çıkan ilanlar bunun altındaysa fark kadar "İlan Bekleniyor"
// premium placeholder eklenir (sahte ürün/fiyat yok).
const GRID_TARGET = 24;

export default async function OneCikanIlanlarPage() {
  const [featured, session] = await Promise.all([
    prisma.listing.findMany({
      where: { isFeatured: true, status: "active", optionStatus: { not: "opsiyonlandi" } },
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        category: true,
        _count: { select: { images: true } },
      },
      take: 48,
    }),
    getSession(),
  ]);

  const favoritedIds = session
    ? new Set(
        (
          await prisma.favorite.findMany({
            where: { userId: session.id, listingId: { in: featured.map((l) => l.id) } },
            select: { listingId: true },
          })
        ).map((f) => f.listingId),
      )
    : new Set<string>();

  const placeholderCount = Math.max(0, GRID_TARGET - featured.length);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-700 to-brand-900 p-5 shadow-soft-lg ring-1 ring-accent/40 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-dark text-white shadow-soft">
            <Crown className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Öne Çıkan İlanlar
              </h1>
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-900">
                Premium
              </span>
            </div>
            <p className="mt-1 max-w-xl text-sm text-brand-100">
              Vitrindeki en çok görüntülenen ayrıcalıklı alan. Yayında olan her 3 ilanın için 1
              ilanını ücretsiz öne çıkar, aramaların en üstünde yer al ve daha çok alıcıya ulaş.
            </p>
          </div>
        </div>
        <Link
          href="/ilan-ver"
          className="mt-4 inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-brand-900 shadow-soft transition-colors hover:bg-accent-dark hover:text-white"
        >
          İlanını Öne Çıkar
        </Link>
      </section>

      <div className="mt-5 grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]">
        {featured.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            currentUserId={session?.id ?? null}
            isFavorited={favoritedIds.has(listing.id)}
            showFeaturedBadge
          />
        ))}
        {Array.from({ length: placeholderCount }).map((_, i) => (
          <ListingPlaceholderCard
            key={`featured-all-${i}`}
            categorySlug={PLACEHOLDER_CATEGORY_SLUGS[i % PLACEHOLDER_CATEGORY_SLUGS.length]}
            premium
          />
        ))}
      </div>
    </div>
  );
}
