import { NextRequest } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { buildListingWhere } from "@/lib/listing-query";
import { apiJson } from "@/lib/mobile-api";
import { analyzeListing, loadAnalysisContext } from "@/lib/mobile-analysis";

// GET /api/mobile/listings
// Ana sayfa / arama için ilan listesi. Web ile AYNI filtre mantığını
// (buildListingWhere) ve öne çıkan-önce sıralamasını yeniden kullanır.
// Query: kategori, q, sort, il, ilce, minPrice, maxPrice, tarih, page
const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const sp = Object.fromEntries(request.nextUrl.searchParams) as Record<string, string | undefined>;
  const page = Math.max(1, Number(sp.page) || 1);

  const where = await buildListingWhere(sp);

  // Öne çıkan ilanlar her sıralamada en üstte (web /page.tsx ile aynı davranış).
  let secondary: Prisma.ListingOrderByWithRelationInput = { createdAt: "desc" };
  switch (sp.sort) {
    case "price-asc":
      secondary = { price: "asc" };
      break;
    case "price-desc":
      secondary = { price: "desc" };
      break;
    case "km-asc":
      secondary = { km: "asc" };
      break;
    case "year-desc":
      secondary = { year: "desc" };
      break;
  }
  const orderBy: Prisma.ListingOrderByWithRelationInput[] = [{ isFeatured: "desc" }, secondary];

  const [rows, total, analysisCtx] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        category: { select: { name: true, slug: true } },
        _count: { select: { images: true } },
      },
    }),
    prisma.listing.count({ where }),
    loadAnalysisContext(),
  ]);

  const listings = rows.map((l) => {
    // Güven puanı + fiyat durumu web ile birebir aynı hesaplanır.
    const ra = analyzeListing({ ...l, photoCount: l._count.images }, analysisCtx);
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
    };
  });

  return apiJson({
    listings,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  });
}
