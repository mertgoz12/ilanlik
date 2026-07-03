import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { FeaturedCategories } from "@/components/featured-categories";
import { PopularCategoriesPanel } from "@/components/popular-categories-panel";
import { TrustStrip } from "@/components/trust-strip";
import { TrustBanner } from "@/components/home/trust-banner";
import { HeroSlider } from "@/components/home/hero-slider";
import { QuickPostCard } from "@/components/home/quick-post-card";
import { SafetyTipsCard } from "@/components/home/safety-tips-card";
import { BlogTipsCard } from "@/components/home/blog-tips-card";
import { HowItWorksCard } from "@/components/home/how-it-works-card";
import { WhyIlanlioCard } from "@/components/home/why-ilanlio-card";
import { SignupPromoCard } from "@/components/home/signup-promo-card";
// StatsCard ("Bugün ilanlio'da") şimdilik gizli - sayılar (ilan/kullanıcı
// sayısı) henüz anlamlı bir ölçek kazanmadı. Kod silinmedi; sayılar
// artınca tek satır ile (import + JSX) geri eklenebilir.
// import { StatsCard } from "@/components/home/stats-card";
import { BrandGrid } from "@/components/brand-grid";
import { ListingCard } from "@/components/listing-card";
import { ListingPlaceholderCard, PLACEHOLDER_CATEGORY_SLUGS } from "@/components/listing-placeholder-card";
import { ListingFilters } from "@/components/listing-filters";
import { Pagination } from "@/components/pagination";
import { CategorySidebar } from "@/components/category-sidebar";
import { SidebarShell } from "@/components/sidebar-shell";
import { ComingSoonBadge } from "@/components/coming-soon";
import { Crown } from "lucide-react";
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
// Bir kategori sayfasında ızgarayı görsel olarak dolu tutmak için hedeflenen
// toplam kart sayısı. Gerçek ilan sayısı bunun altındaysa aradaki fark kadar
// "İlan Bekleniyor" placeholder kartı eklenir; kategori bu sayıya ulaşınca
// (gerçek ilan doldukça) placeholder gösterilmez (bkz. listing-placeholder-card.tsx).
const CATEGORY_PLACEHOLDER_TARGET = 12;
// Ana sayfa vitrininde "Yeni Eklenen İlanlar" ızgarasını dolu göstermek için
// gerçek ilanların ardına eklenen "İlan Bekleniyor" placeholder sayısı. Görsel
// çeşitlilik için aşağıdaki kategori temaları (ikon/renk) sırayla döndürülür;
// her kart o kategoride ilan vermeye yönlendirir.
const HOME_PLACEHOLDER_COUNT = 54;
// Sayfanın en üstündeki premium "Öne Çıkan İlanlar" vitrinindeki placeholder
// kart sayısı. Gerçek öne çıkan ilan yeterli değilken (bkz. showSeparateFeatured)
// bu prestijli/dikkat çekici blok "İlan Bekleniyor" kartlarıyla doldurulur.
const FEATURED_PLACEHOLDER_COUNT = 12;
// "Öne Çıkan İlanlar" başlığı ayrı bir bölüm olarak ancak bu kadar (veya
// daha fazla) öne çıkarılmış ilan varsa gösterilir; aksi halde sayfa az
// ilanla yarım/boş durmasın diye tüm ilanlar tek "Yeni Eklenen İlanlar"
// bölümünde birleştirilir (bkz. showSeparateFeatured).
const MIN_FEATURED_FOR_SECTION = 4;

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
    listingPool,
    featuredCount,
    vehicleComparablePool,
    genericComparablePool,
    heroSlides,
  ] = await Promise.all([
    categoryComingSoon
      ? Promise.resolve([])
      : prisma.listing.findMany({
          where,
          orderBy,
          include: {
            images: { orderBy: { order: "asc" }, take: 1 },
            category: true,
            _count: { select: { images: true } },
          },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        }),
    categoryComingSoon ? 0 : prisma.listing.count({ where }),
    showVitrin
      ? prisma.listing.findMany({
          where: { status: "active", optionStatus: { not: "opsiyonlandi" }, ...excludeComingSoon },
          orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
          take: FEATURED_COUNT + RECENT_COUNT,
          include: {
            images: { orderBy: { order: "asc" }, take: 1 },
            category: true,
            _count: { select: { images: true } },
          },
        })
      : Promise.resolve([]),
    showVitrin
      ? prisma.listing.count({ where: { isFeatured: true, status: "active", optionStatus: { not: "opsiyonlandi" }, ...excludeComingSoon } })
      : 0,
    // KATMAN 1 (kural tabanlı fiyat aralığı) için emsal ilan havuzları - sadece aktif ilanlar.
    prisma.listing.findMany({
      where: { brand: { not: null }, model: { not: null }, year: { not: null }, km: { not: null }, status: "active" },
      select: { id: true, brand: true, model: true, year: true, km: true, price: true },
    }),
    prisma.listing.findMany({
      where: { brand: null, status: "active" },
      select: { id: true, categoryId: true, title: true, price: true },
    }),
    // Ana sayfa üst slider'ı - yalnızca vitrin görünümünde ve sadece aktif
    // slaytlar (admin panelinden yönetilir, bkz. /admin/banner).
    showVitrin
      ? prisma.heroSlide.findMany({ where: { isActive: true }, orderBy: { order: "asc" } })
      : Promise.resolve([]),
  ]);

  // Yeterince öne çıkarılmış ilan varsa "Öne Çıkan İlanlar" ayrı gösterilir;
  // yoksa hepsi "Yeni Eklenen İlanlar" altında birleştirilir (bkz. yukarıdaki not).
  const showSeparateFeatured = featuredCount >= MIN_FEATURED_FOR_SECTION;
  const featuredListings = showSeparateFeatured
    ? listingPool.filter((l) => l.isFeatured).slice(0, FEATURED_COUNT)
    : [];
  const recentListings = showSeparateFeatured
    ? listingPool.filter((l) => !l.isFeatured).slice(0, RECENT_COUNT)
    : listingPool.slice(0, RECENT_COUNT);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // "İlan Bekleniyor" placeholder kartları: yalnızca DÜZ kategori gezinmesinde
  // (arama/filtre yokken) gösterilir - filtrelenmiş "0 sonuç" ekranını sahte
  // doluluğa boğmamak için. Yalnızca ilk sayfada ve kategori toplamı hedefin
  // altındayken; fark kadar placeholder eklenir (dinamik: ilan doldukça azalır).
  const isPlainCategoryBrowse =
    !!sp.kategori &&
    !categoryComingSoon &&
    !sp.q &&
    !sp.brand &&
    !sp.model &&
    !sp.il &&
    !sp.ilce &&
    !sp.fuelType &&
    !sp.minYear &&
    !sp.maxYear &&
    !sp.minPrice &&
    !sp.maxPrice;
  const placeholderCount =
    isPlainCategoryBrowse && page === 1 && total < CATEGORY_PLACEHOLDER_TARGET
      ? CATEGORY_PLACEHOLDER_TARGET - listings.length
      : 0;

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
    bodyType?: string | null;
    color?: string | null;
    enginePower?: string | null;
    engineVolume?: string | null;
    drivetrain?: string | null;
    _count: { images: number };
  }): RuleAnalysisResult {
    const input = { ...listing, photoCount: listing._count.images };
    if (listing.brand !== null) {
      const result = computeRuleAnalysis(input, vehicleComparables, settings.deprecation);
      if (result) return result;
    }
    return computeGenericRuleAnalysis(input, genericComparables);
  }

  const listingsHeading = categoryName ?? "Son Eklenen İlanlar";

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        {/* Üst banner şeridi: tüm içerik genişliğini (sol kategori menüsünden
            sağ "Hızlı İlan Ver" kutusuna kadar) kaplayan ince yatay şerit.
            Mobilde gizli (hidden md:block) - dar ekranda düzeni bozuyordu;
            yalnızca tablet/masaüstünde gösterilir. */}
        {showVitrin && heroSlides.length > 0 && (
          <div className="mb-4 hidden md:block">
            <HeroSlider slides={heroSlides} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[224px_minmax(0,1fr)] xl:grid-cols-[224px_minmax(0,1fr)_256px]">
          <SidebarShell>
            <CategorySidebar activeSlug={sp.kategori} />
          </SidebarShell>

          <div className="min-w-0">
            {showVitrin ? (
              <>
                {/* Sayfanın en üstündeki en dikkat çekici alan: premium "Öne
                    Çıkan İlanlar" vitrini. Gerçek öne çıkan ilan yeterli değilken
                    (bkz. showSeparateFeatured) prestijli "İlan Bekleniyor"
                    kartlarıyla dolar - burada SAHTE ilan yok, sadece placeholder. */}
                {!showSeparateFeatured && (
                  <section className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand-700 to-brand-900 p-4 shadow-soft-lg ring-1 ring-accent/40 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-x-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-dark text-white shadow-soft">
                          <Crown className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold tracking-tight text-white">
                              Öne Çıkan İlanlar
                            </h2>
                            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-900">
                              Premium
                            </span>
                          </div>
                          <p className="mt-0.5 hidden text-xs text-brand-100 sm:block">
                            En çok görüntülenen, vitrindeki ayrıcalıklı alan. İlanını buraya taşı, öne çık.
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/one-cikan-ilanlar"
                        className="shrink-0 text-xs font-semibold text-accent transition-colors hover:text-white sm:text-sm"
                      >
                        Tümünü Gör ›
                      </Link>
                    </div>
                    {/* Yatay kayan slayt: kartlar tek sıra halinde yana kaydırılır. */}
                    <div className="mt-4 -mx-1 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-1 pb-1 scrollbar-hide">
                      {Array.from({ length: FEATURED_PLACEHOLDER_COUNT }).map((_, i) => (
                        <div key={`featured-placeholder-${i}`} className="w-[144px] shrink-0 snap-start sm:w-[156px]">
                          <ListingPlaceholderCard
                            categorySlug={PLACEHOLDER_CATEGORY_SLUGS[i % PLACEHOLDER_CATEGORY_SLUGS.length]}
                            premium
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <TrustBanner />

                {featuredListings.length > 0 && (
                  <section className="mt-5">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">
                      Öne Çıkan İlanlar
                    </h2>
                    <div className="mt-2.5 grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(130px,1fr))]">
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

                {(recentListings.length > 0 || HOME_PLACEHOLDER_COUNT > 0) && (
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
                    <div className="mt-2.5 grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(130px,1fr))]">
                      {recentListings.map((listing) => (
                        <ListingCard
                          key={listing.id}
                          listing={listing}
                          ruleAnalysis={ruleAnalysisFor(listing)}
                          currentUserId={session?.id ?? null}
                          isFavorited={favoritedIds.has(listing.id)}
                        />
                      ))}
                      {/* Gerçek ilanların ardına, ızgarayı doldurmak için çeşitli
                          kategori temalarında "İlan Bekleniyor" kartları (sahte
                          ürün/fiyat yok, bkz. listing-placeholder-card.tsx). */}
                      {Array.from({ length: HOME_PLACEHOLDER_COUNT }).map((_, i) => (
                        <ListingPlaceholderCard
                          key={`home-placeholder-${i}`}
                          categorySlug={PLACEHOLDER_CATEGORY_SLUGS[i % PLACEHOLDER_CATEGORY_SLUGS.length]}
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

                {listings.length === 0 && placeholderCount === 0 ? (
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
                  <div className="mt-3 grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(130px,1fr))]">
                    {listings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        ruleAnalysis={ruleAnalysisFor(listing)}
                        currentUserId={session?.id ?? null}
                        isFavorited={favoritedIds.has(listing.id)}
                      />
                    ))}
                    {Array.from({ length: placeholderCount }).map((_, i) => (
                      <ListingPlaceholderCard key={`placeholder-${i}`} categorySlug={sp.kategori!} />
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
            <aside className="grid grid-cols-1 content-start gap-4 self-start sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4 xl:col-span-1 xl:grid-cols-1">
              <QuickPostCard />
              <SafetyTipsCard />
              <BlogTipsCard />
              <HowItWorksCard />
              <WhyIlanlioCard />
              {!session && <SignupPromoCard />}
            </aside>
          )}
        </div>
      </div>

      <TrustStrip />
    </div>
  );
}
