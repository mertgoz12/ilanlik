import { analyzeListing, type AnalysisContext } from "./mobile-analysis";

// Mobil ilan kartı DTO'su (liste + favoriler ortak). Güven puanı/fiyat durumu
// AYNI analizle hesaplanır (bkz. mobile-analysis).
type ListingRow = {
  id: string;
  listingNo: string;
  title: string;
  price: number;
  il: string;
  ilce: string;
  isFeatured: boolean;
  categoryId: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  km: number | null;
  fuelType: string | null;
  description: string | null;
  damageInfo: string | null;
  tramerAmount: number | null;
  bodyType?: string | null;
  color?: string | null;
  enginePower?: string | null;
  engineVolume?: string | null;
  drivetrain?: string | null;
  createdAt: Date;
  images: { url: string }[];
  category: { name: string; slug: string };
  _count: { images: number };
};

export function toListingSummary(l: ListingRow, ctx: AnalysisContext, isFavorited: boolean) {
  const ra = analyzeListing({ ...l, photoCount: l._count.images }, ctx);
  return {
    id: l.id,
    listingNo: l.listingNo,
    title: l.title,
    price: l.price,
    il: l.il,
    ilce: l.ilce,
    isFeatured: l.isFeatured,
    imageUrl: l.images[0]?.url ?? null,
    categoryName: l.category.name,
    categorySlug: l.category.slug,
    brand: l.brand,
    year: l.year,
    km: l.km,
    fuelType: l.fuelType,
    createdAt: l.createdAt.toISOString(),
    trustScore: ra.tutarlilik_analizi.guven_puani,
    priceStatus: ra.fiyat_analizi.fiyat_durumu,
    isFavorited,
  };
}

// Liste sorgularında ortak include (kart için gerekli alanlar + görsel + sayaç).
export const LISTING_SUMMARY_INCLUDE = {
  images: { orderBy: { order: "asc" as const }, take: 1 },
  category: { select: { name: true, slug: true } },
  _count: { select: { images: true } },
};
