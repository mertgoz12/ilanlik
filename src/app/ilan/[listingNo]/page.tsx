import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { formatDate, formatKm, formatPrice } from "@/lib/format";
import { type DamagePartStatus } from "@/lib/car-data";
import { parseAiAnalysis } from "@/lib/ai-analysis";
import { getEffectiveSettings } from "@/lib/analysis-config";
import { expireStaleOptions, getOptionSettings } from "@/lib/listing-options";
import {
  computeGenericRuleAnalysis,
  computeRuleAnalysis,
  toComparable,
  toGenericComparable,
  RULE_FIYAT_DURUMU_LABELS,
  RULE_FIYAT_DURUMU_STYLES,
  type ComparableListing,
  type RuleAnalysisResult,
} from "@/lib/rule-analysis";
import { ImageGallery } from "@/components/image-gallery";
import { CarDiagram } from "@/components/car-diagram";
import { AiReportCard } from "@/components/ai-report-card";
import { EquipmentGrid } from "@/components/equipment-grid";
import { SellerCard } from "@/components/seller-card";
import { SpecTable, type SpecEntry } from "@/components/spec-table";
import { VehicleTrimSpecs } from "@/components/vehicle-trim-specs";
import { ListingCard } from "@/components/listing-card";
import { ListingTabs, type ListingTab } from "@/components/listing-tabs";
import { OptionPanel } from "@/components/option-panel";
import { LocationIcon } from "@/components/icons";

const NOT_SPECIFIED = "Belirtilmemiş";

function specValue(value: string | null | undefined): string {
  return value && value.trim() ? value : NOT_SPECIFIED;
}

const SIMILAR_COUNT = 4;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ listingNo: string }>;
}): Promise<Metadata> {
  const { listingNo } = await params;

  const listing = await prisma.listing.findUnique({
    where: { listingNo },
    select: { title: true, description: true, price: true, il: true, ilce: true, status: true },
  });

  if (!listing || listing.status !== "active") {
    return { title: "İlan Bulunamadı - İlanlio" };
  }

  const description = listing.description?.trim()
    ? listing.description.trim().slice(0, 160)
    : `${listing.title} - ${formatPrice(listing.price)} - ${listing.il}, ${listing.ilce}`;

  return {
    title: `${listing.title} - İlanlio`,
    description,
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ listingNo: string }>;
}) {
  const { listingNo } = await params;

  // Cron/arka plan görevi olmadığı için süresi dolan opsiyonlar okuma
  // anında tembel olarak süpürülür (bkz. src/lib/listing-options.ts).
  await expireStaleOptions();

  const listing = await prisma.listing.findUnique({
    where: { listingNo },
    include: {
      images: { orderBy: { order: "asc" } },
      category: { include: { parent: true } },
      user: { select: { id: true, name: true, phone: true, createdAt: true, avatarUrl: true } },
      optionHolder: { select: { id: true, name: true } },
    },
  });

  if (!listing) notFound();

  const session = await getSession();

  // Yayında (active) olmayan ilanlar normalde "yokmuş" gibi davranır; ancak
  // onay akışında admin (onay/red için) ve ilan sahibi (kendi taslağını/red
  // edilen ilanını görebilmek için) önizleyebilmelidir.
  if (listing.status !== "active") {
    const canPreview = session?.role === "admin" || session?.id === listing.userId;
    if (!canPreview) notFound();
  }

  // Opsiyonlu bir ilan sadece opsiyonlayan alıcı, satıcı ve admin tarafından
  // görülebilir - diğerleri için ilan "yokmuş" gibi davranılır.
  if (listing.optionStatus === "opsiyonlandi") {
    const canView =
      session?.id === listing.optionHolderId || session?.id === listing.userId || session?.role === "admin";
    if (!canView) notFound();
  }

  // Basit görüntülenme sayacı: ilan gerçekten gösterilebilir durumdaysa
  // (yukarıdaki kontrolleri geçtiyse) her sayfa açılışında +1. Tekilleştirme
  // (aynı ziyaretçinin tekrar açması) bilinçli olarak yapılmıyor - basit
  // tutulması istendi. Değer veritabanında tutulur ama arayüzde gösterilmez.
  await prisma.listing.update({
    where: { id: listing.id },
    data: { views: { increment: 1 } },
  });

  const optionSettings = await getOptionSettings();

  const isFollowing = session
    ? Boolean(
        await prisma.sellerFollow.findUnique({
          where: { followerId_sellerId: { followerId: session.id, sellerId: listing.user.id } },
        }),
      )
    : false;

  const isVehicle = listing.brand !== null && listing.damageStatus !== null;

  const specEntries: SpecEntry[] = isVehicle
    ? [
        { label: "İlan No", value: listing.listingNo },
        { label: "İlan Tarihi", value: formatDate(listing.createdAt) },
        { label: "Marka", value: listing.brand! },
        { label: "Seri", value: specValue(listing.series) },
        { label: "Model", value: listing.model! },
        { label: "Yıl", value: String(listing.year) },
        { label: "Yakıt Tipi", value: listing.fuelType! },
        { label: "Vites", value: listing.transmission! },
        { label: "Araç Durumu", value: specValue(listing.vehicleCondition) },
        { label: "KM", value: formatKm(listing.km!) },
        { label: "Kasa Tipi", value: specValue(listing.bodyType) },
        { label: "Motor Gücü", value: specValue(listing.enginePower) },
        { label: "Motor Hacmi", value: specValue(listing.engineVolume) },
        { label: "Çekiş", value: specValue(listing.drivetrain) },
        { label: "Kapı", value: specValue(listing.doorCount) },
        { label: "Renk", value: specValue(listing.color) },
        { label: "Garanti", value: specValue(listing.warranty) },
        { label: "Ağır Hasar Kayıtlı", value: listing.damageStatus === "agir-hasarli" ? "Evet" : "Hayır" },
        { label: "Plaka / Uyruk", value: specValue(listing.plateOrigin) },
        { label: "Kimden", value: specValue(listing.fromWho) },
        { label: "Takas", value: specValue(listing.exchange) },
      ]
    : [];

  const damageInfo = isVehicle
    ? (JSON.parse(listing.damageInfo ?? "{}") as Record<string, DamagePartStatus>)
    : {};

  const equipment = isVehicle ? (JSON.parse(listing.equipment ?? "[]") as string[]) : [];

  const analysis = parseAiAnalysis(listing.aiAnalysis);

  const priceMin = listing.price * 0.8;
  const priceMax = listing.price * 1.2;

  const [similarListings, vehicleComparablePool, genericComparablePool] = await Promise.all([
    prisma.listing.findMany({
      where: {
        id: { not: listing.id },
        status: "active",
        optionStatus: { not: "opsiyonlandi" },
        ...(isVehicle && listing.brand
          ? { OR: [{ brand: listing.brand }, { price: { gte: priceMin, lte: priceMax } }] }
          : { categoryId: listing.categoryId, price: { gte: priceMin, lte: priceMax } }),
      },
      orderBy: { createdAt: "desc" },
      take: SIMILAR_COUNT,
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        category: true,
        _count: { select: { images: true } },
      },
    }),
    // KATMAN 1 (kural tabanlı fiyat aralığı) için emsal ilanlar - yapay zeka
    // kullanılmaz. Vasıta: aynı marka/model.
    isVehicle
      ? prisma.listing.findMany({
          where: {
            id: { not: listing.id },
            brand: listing.brand,
            model: listing.model,
            year: { not: null },
            km: { not: null },
            status: "active",
          },
          select: { id: true, brand: true, model: true, year: true, km: true, price: true },
        })
      : Promise.resolve([]),
    // Diğer kategoriler: aynı kategorideki diğer aktif ilanlar.
    !isVehicle
      ? prisma.listing.findMany({
          where: { id: { not: listing.id }, categoryId: listing.categoryId, status: "active" },
          select: { id: true, categoryId: true, title: true, price: true },
        })
      : Promise.resolve([]),
  ]);

  const favoritedSimilarIds = session
    ? new Set(
        (
          await prisma.favorite.findMany({
            where: { userId: session.id, listingId: { in: similarListings.map((s) => s.id) } },
            select: { listingId: true },
          })
        ).map((f) => f.listingId),
      )
    : new Set<string>();

  const settings = await getEffectiveSettings();

  // computeRuleAnalysis araç verisi eksikse (beklenmeyen durum) null
  // dönebilir; bu durumda da genel analize düşülür, sayfa hiç kırılmaz.
  const ruleAnalysis: RuleAnalysisResult =
    (isVehicle
      ? computeRuleAnalysis(
          {
            id: listing.id,
            brand: listing.brand,
            model: listing.model,
            year: listing.year,
            km: listing.km,
            price: listing.price,
            description: listing.description,
            damageInfo: listing.damageInfo,
            tramerAmount: listing.tramerAmount,
            photoCount: listing.images.length,
            bodyType: listing.bodyType,
            color: listing.color,
            enginePower: listing.enginePower,
            engineVolume: listing.engineVolume,
            drivetrain: listing.drivetrain,
          },
          vehicleComparablePool.map(toComparable).filter((c): c is ComparableListing => c !== null),
          settings.deprecation,
        )
      : null) ??
    computeGenericRuleAnalysis(
      {
        id: listing.id,
        categoryId: listing.categoryId,
        title: listing.title,
        price: listing.price,
        description: listing.description,
        photoCount: listing.images.length,
      },
      genericComparablePool.map(toGenericComparable),
    );

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${listing.il} ${listing.ilce}`)}`;

  const tabs: ListingTab[] = [
    {
      id: "detay",
      label: "İlan Detayları",
      content: (
        <div className="space-y-6">
          {isVehicle && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">Araç Özellikleri / Donanım</h2>
              <EquipmentGrid selected={equipment} />
            </div>
          )}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Açıklama</h2>
            {listing.description ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {listing.description}
              </p>
            ) : (
              <p className="text-sm text-slate-500">Satıcı bir açıklama eklememiş.</p>
            )}
            {/* Açıklamanın altında gösterilen "test" etiketi - yalnızca görsel,
                veritabanındaki ilan içeriğini değiştirmez. Bu sayfa zaten sadece
                aktif ilanlar için render edilir (bkz. status kontrolü yukarıda). */}
            <p className="mt-3 text-sm text-slate-600">test</p>
          </div>
        </div>
      ),
    },
  ];

  if (isVehicle) {
    tabs.push({
      id: "teknik",
      label: "Teknik Özellikler",
      content: (
        <div className="space-y-4">
          <SpecTable entries={specEntries} />
          <VehicleTrimSpecs rawSpecsJson={listing.vehicleTrimRawSpecs} />
        </div>
      ),
    });
  }

  tabs.push({
    id: "konum",
    label: "Konum",
    content: (
      <div className="space-y-3">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(`${listing.il} ${listing.ilce} Türkiye`)}&output=embed&hl=tr&z=13`}
            className="h-64 w-full sm:h-80"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`${listing.il}, ${listing.ilce} konumu`}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <LocationIcon className="h-4 w-4 text-slate-400" />
            {listing.il}, {listing.ilce}
          </span>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-brand transition-colors hover:border-accent hover:bg-accent-light"
          >
            Google Maps'te Aç
          </a>
        </div>
      </div>
    ),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 pb-36 pt-8 sm:px-6 md:pb-8 lg:px-8">
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-emerald-700">
          İlanlar
        </Link>
        {listing.category.parent && (
          <>
            <span className="mx-1.5">/</span>
            <Link
              href={`/?kategori=${listing.category.parent.slug}`}
              className="hover:text-emerald-700"
            >
              {listing.category.parent.name}
            </Link>
          </>
        )}
        <span className="mx-1.5">/</span>
        <Link href={`/?kategori=${listing.category.slug}`} className="text-slate-700 hover:text-emerald-700">
          {listing.category.name}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ImageGallery images={listing.images} title={listing.title} />
          <div className="mt-6">
            <ListingTabs tabs={tabs} />
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-lg bg-white p-4 shadow-soft sm:p-6">
            <h1 className="break-words text-xl font-bold text-foreground sm:text-2xl">{listing.title}</h1>
            <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-700 sm:text-4xl">
              {formatPrice(listing.price)}
            </p>
            <span
              className={`mt-3 inline-flex items-center rounded-md border px-2.5 py-1 text-sm font-semibold ${RULE_FIYAT_DURUMU_STYLES[ruleAnalysis.fiyat_analizi.fiyat_durumu]}`}
            >
              {RULE_FIYAT_DURUMU_LABELS[ruleAnalysis.fiyat_analizi.fiyat_durumu]}
            </span>
            {!isVehicle && listing.condition && (
              <span className="ml-2 mt-3 inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm font-semibold text-slate-600">
                {listing.condition}
              </span>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-slate-100 pt-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <LocationIcon className="h-4 w-4" />
                {listing.il}, {listing.ilce}
              </span>
              <span className="text-slate-300">·</span>
              <span>{formatDate(listing.createdAt)}</span>
              <span className="text-slate-300">·</span>
              <span>İlan No: {listing.listingNo}</span>
            </div>
          </section>

          <SellerCard
            name={listing.user.name}
            avatarUrl={listing.user.avatarUrl}
            createdAt={listing.user.createdAt}
            phone={listing.user.phone}
            listingId={listing.id}
            listingNo={listing.listingNo}
            listingTitle={listing.title}
            listingPrice={listing.price}
            listingImageUrl={listing.images[0]?.url ?? null}
            sellerId={listing.user.id}
            currentUserId={session?.id ?? null}
            isFollowing={isFollowing}
            isNegotiable={listing.isNegotiable}
          />

          <OptionPanel
            listingId={listing.id}
            listingNo={listing.listingNo}
            currentUserId={session?.id ?? null}
            sellerId={listing.user.id}
            optionStatus={listing.optionStatus}
            optionHolderId={listing.optionHolderId}
            optionHolderName={listing.optionHolder?.name ?? null}
            optionEndAt={listing.optionEndAt}
            durationOptions={optionSettings.durationsHours}
          />
        </div>
      </div>

      {isVehicle && (
        <section className="mt-8 rounded-lg bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Hasar / Boya Durumu</h2>
          {listing.tramerAmount && listing.tramerAmount > 0 && (
            <p className="mb-4 text-sm text-slate-600">
              TRAMER hasar kaydı tutarı:{" "}
              <span className="font-semibold">{formatPrice(listing.tramerAmount)}</span>
            </p>
          )}
          <CarDiagram values={damageInfo} />
        </section>
      )}

      <div className="mt-8">
        <AiReportCard
          rule={ruleAnalysis}
          ai={analysis}
          price={listing.price}
          listingNo={listing.listingNo}
          pricingMode={settings.aiReportPricingMode}
        />
      </div>

      {similarListings.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Benzer İlanlar</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {similarListings.map((similar) => (
              <ListingCard
                key={similar.id}
                listing={similar}
                currentUserId={session?.id ?? null}
                isFavorited={favoritedSimilarIds.has(similar.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
