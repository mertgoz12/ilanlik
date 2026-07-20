import { NextRequest } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { buildListingWhere } from "@/lib/listing-query";
import { apiJson, getMobileUser } from "@/lib/mobile-api";
import { loadAnalysisContext } from "@/lib/mobile-analysis";
import { LISTING_SUMMARY_INCLUDE, toListingSummary } from "@/lib/mobile-dto";
import { getFavoritedIds } from "@/lib/mobile-favorites";

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

  const [rows, total, analysisCtx, user] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: LISTING_SUMMARY_INCLUDE,
    }),
    prisma.listing.count({ where }),
    loadAnalysisContext(),
    getMobileUser(request),
  ]);

  // Oturum varsa favori durumları tek sorguda çekilir.
  const favoritedIds = user ? await getFavoritedIds(user.id, rows.map((l) => l.id)) : new Set<string>();

  const listings = rows.map((l) => toListingSummary(l, analysisCtx, favoritedIds.has(l.id)));

  return apiJson({
    listings,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  });
}
