import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { FeaturedCategories } from "@/components/featured-categories";
import { PopularCategoriesPanel } from "@/components/popular-categories-panel";
import { TrustStrip } from "@/components/trust-strip";
import { TrustBanner } from "@/components/home/trust-banner";
import { QuickPostCard } from "@/components/home/quick-post-card";
import { SafetyTipsCard } from "@/components/home/safety-tips-card";
import { StatsCard } from "@/components/home/stats-card";
import { StorePromoCard } from "@/components/home/store-promo-card";
import { BrandGrid } from "@/components/brand-grid";
import { ListingCard } from "@/components/listing-card";
import { ListingFilters } from "@/components/listing-filters";
import { Pagination } from "@/components/pagination";
import { CategorySidebar } from "@/components/category-sidebar";
import { SidebarShell } from "@/components/sidebar-shell";
import { ComingSoonBadge } from "@/components/coming-soon";
import { SearchIcon, ClockIcon } from "@/components/icons";
import { getSession } from "@/lib/session";
import {
  collectSlugs,
  findCategory,
  isComingSoonSlug,
  isVasitaEmlakActive,
  COMING_SOON_SLUGS,
} from "@/lib/categories";
import { buildListingWhere } from "@/lib/listing-query";
import { getEffectiveSettings } from "@/lib/analysis-config";
import { expireStaleOptions } from "@/lib/listing-options";
import {
  computeGenericRuleAnalysis,
  computeRuleAnalysis,
  toComparable,
  toGenericComparable,
  type ComparableListing,
  type RuleAnalysisResult,
} from "@/lib/rule-analysis";

const PAGE_SIZE = 12;
const FEATURED_COUNT = 12;
const RECENT_COUNT = 12;

type SearchParams = Record<string, string | undefined>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  // Cron/arka plan görevi olmadığı için süresi dolan opsiyonlar okuma
  // anında tembel olarak süpürülür (bkz. src/lib/listing-options.ts).
  await expireStaleOptions();

  const where = await buildListingWhere(sp);

  let categoryName: string | null = null;
  if (sp.kategori) {
    const node = findCategory(sp.kategori);
    if (node) categoryName = node.name;
  }

  let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: "desc" };
  switch (sp.sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "km-asc":
      orderBy = { km: "asc" };
      break;
    case "year-desc":
      orderBy = { year: "desc" };
      break;
  }

  const showVitrin =
    page === 1 &&
    !sp.kategori &&
    !sp.q &&
    !sp.brand &&
    !sp.model &&
    !sp.il &&
    !sp.ilce &&
    !sp.fuelType &&
    !sp.minYear &&
    !sp.maxYear &&
    !sp.minPrice &&
    !sp.maxPrice &&
    !sp.tum;

  const vasitaEmlakActive = isVasitaEmlakActive();
  const categoryComingSoon = !!sp.kategori && isComingSoonSlug(sp.kategori);

  // Vasıta ve Emlak "çok yakında" kapalıyken vitrin/son eklenenler bölümleri
  // bu kategorilerdeki (varsa eski demo) ilanları göstermez.
  let excludedCategoryIds: string[] = [];
  if (!vasitaEmlakActive) {
    const comingSoonSlugs = COMING_SOON_SLUGS.flatMap((slug) => {
      const node = findCategory(slug);
      return node ? collectSlugs(node) : [slug];
    });
    const excludedCats = await prisma.category.findMany({
      where: { slug: { in: comingSoonSlugs } },
      select: { id: true },
    });
    excludedCategoryIds = excludedCats.map((c) => c.id);
  }
  const excludeComingSoon = excludedCategoryIds.length > 0 ? { categoryId: { notIn: excludedCategoryIds } } : {};

  const [
    listings,
    total,
    featuredListings,
    recentListings,
    vehicleComparablePool,
    genericComparablePool,
  ] = await Promise.all([
    categoryComingSoon
      ? Promise.resolve([])
      : prisma.listing.findMany({
          where,
          orderBy,
          include: { images: { orderBy: { order: "asc" }, take: 1 }, category: true },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        }),
    categoryComingSoon ? 0 : prisma.listing.count({ where }),
    showVitrin
      ? prisma.listing.findMany({
          where: { isFeatured: true, status: "active", optionStatus: { not: "opsiyonlandi" }, ...excludeComingSoon },
          orderBy: { createdAt: "desc" },
          take: FEATURED_COUNT,
          include: { images: { orderBy: { order: "asc" }, take: 1 }, category: true },
        })
      : Promise.resolve([]),
    showVitrin
      ? prisma.listing.findMany({
          where: { isFeatured: false, status: "active", optionStatus: { not: "opsiyonlandi" }, ...excludeComingSoon },
          orderBy: { createdAt: "desc" },
          take: RECENT_COUNT,
          include: { images: { orderBy: { order: "asc" }, take: 1 }, category: true },
        })
      : Promise.resolve([]),
    // KATMAN 1 (kural tabanlı fiyat aralığı) için emsal ilan havuzları - sadece aktif ilanlar.
    prisma.listing.findMany({
      where: { brand: { not: null }, model: { not: null }, year: { not: null }, km: { not: null }, status: "active" },
      select: { id: true, brand: true, model: true, year: true, km: true, price: true },
    }),
    prisma.listing.findMany({
      where: { brand: null, status: "active" },
      select: { id: true, categoryId: true, title: true, price: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const session = await getSession();
  const allListingIds = [...listings, ...featuredListings, ...recentListings].map((l) => l.id);
  const favoritedIds = session
    ? new Set(
        (
          await prisma.favorite.findMany({
            where: { userId: session.id, listingId: { in: allListingIds } },
            select: { listingId: true },
          })
        ).map((f) => f.listingId),
      )
    : new Set<string>();

  const vehicleComparables = vehicleComparablePool.map(toComparable).filter((c): c is ComparableListing => c !== null);
  const genericComparables = genericComparablePool.map(toGenericComparable);
  const settings = await getEffectiveSettings();

  function ruleAnalysisFor(listing: {
    id: string;
    categoryId: string;
    title: string;
    brand: string | null;
    model: string | null;
    year: number | null;
    km: number | null;
    price: number;
    description: string | null;
    damageInfo: string | null;
    tramerAmount: number | null;
  }): RuleAnalysisResult {
    if (listing.brand !== null) {
      const result = computeRuleAnalysis(listing, vehicleComparables, settings.deprecation);
      if (result) return result;
    }
    return computeGenericRuleAnalysis(listing, genericComparables);
  }

  const listingsHeading = categoryName ?? "Son Eklenen İlanlar";

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[224px_minmax(0,1fr)] xl:grid-cols-[224px_minmax(0,1fr)_280px]">
          <SidebarShell>
            <CategorySidebar activeSlug={sp.kategori} />
          </SidebarShell>

          <div className="min-w-0">
            {showVitrin ? (
              <>
                <TrustBanner />

                {featuredListings.length > 0 && (
                  <section className="mt-5">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">
                      Öne Çıkan İlanlar
                    </h2>
                    <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                      {featuredListings.map((listing) => (
                        <ListingCard
                          key={listing.id}
                          listing={listing}
                          ruleAnalysis={ruleAnalysisFor(listing)}
                          currentUserId={session?.id ?? null}
                          isFavorited={favoritedIds.has(listing.id)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                <FeaturedCategories />

                {vasitaEmlakActive && <BrandGrid />}

                {recentListings.length > 0 && (
                  <section className="mt-5">
                    <div className="flex items-end justify-between gap-3">
                      <h2 className="text-lg font-bold tracking-tight text-foreground">
                        Yeni Eklenen İlanlar
                      </h2>
                      <Link
                        href="/?tum=1"
                        className="shrink-0 text-xs font-semibold text-brand hover:text-accent-dark sm:text-sm"
                      >
                        Tümünü Gör ›
                      </Link>
                    </div>
                    <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                      {recentListings.map((listing) => (
                        <ListingCard
                          key={listing.id}
                          listing={listing}
                          ruleAnalysis={ruleAnalysisFor(listing)}
                          currentUserId={session?.id ?? null}
                          isFavorited={favoritedIds.has(listing.id)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                <PopularCategoriesPanel />
              </>
            ) : categoryComingSoon ? (
              <div className="mt-6 flex flex-col items-center justify-center rounded-lg bg-white py-20 text-center shadow-soft">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-light text-brand">
                  <ClockIcon className="h-7 w-7" />
                </span>
                <h2 className="mt-4 text-xl font-bold text-foreground">{categoryName}</h2>
                <div className="mt-2">
                  <ComingSoonBadge />
                </div>
                <p className="mt-3 max-w-sm text-sm text-slate-500">
                  Bu kategori çok yakında açılacak. Şimdilik ikinci el / sıfır ürün
                  kategorilerimize göz atabilirsiniz.
                </p>
                <Link
                  href="/"
                  className="mt-5 text-sm font-semibold text-brand hover:text-accent-dark"
                >
                  Ana sayfaya dön
                </Link>
              </div>
            ) : (
              <>
                <ListingFilters searchParams={sp} isLoggedIn={!!session} />

                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-foreground">
                      {listingsHeading}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      <span className="font-semibold text-foreground">{total}</span> ilan bulundu
                    </p>
                  </div>
                </div>

                {listings.length === 0 ? (
                  <div className="mt-4 flex flex-col items-center justify-center rounded-lg bg-white py-16 text-center shadow-soft">
                    <SearchIcon className="h-10 w-10 text-slate-300" />
                    <p className="mt-4 text-sm font-medium text-slate-600">
                      Aramanıza uygun ilan bulunamadı.
                    </p>
                    <Link
                      href="/"
                      className="mt-2 text-sm font-semibold text-brand hover:text-accent-dark"
                    >
                      Filtreleri temizle
                    </Link>
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {listings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        ruleAnalysis={ruleAnalysisFor(listing)}
                        currentUserId={session?.id ?? null}
                        isFavorited={favoritedIds.has(listing.id)}
                      />
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <Pagination page={page} totalPages={totalPages} searchParams={sp} />
                )}
              </>
            )}
          </div>

          {showVitrin && (
            <aside className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4 xl:col-span-1 xl:grid-cols-1">
              <QuickPostCard />
              <SafetyTipsCard />
              <StatsCard />
              <StorePromoCard />
            </aside>
          )}
        </div>
      </div>

      <TrustStrip />
    </div>
  );
}
