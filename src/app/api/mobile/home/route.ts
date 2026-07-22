import { NextRequest } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { apiJson, getMobileUser } from "@/lib/mobile-api";
import { loadAnalysisContext } from "@/lib/mobile-analysis";
import { LISTING_SUMMARY_INCLUDE, toListingSummary } from "@/lib/mobile-dto";
import { getFavoritedIds } from "@/lib/mobile-favorites";

// GET /api/mobile/home?il=<opsiyonel>
// Ana sayfa bölümleri: öne çıkan, size uygun (favori kategorilerden), konuma
// yakın (aynı il). Tümü tek istekte.
const TAKE = 12;
const BASE = { status: "active", optionStatus: { not: "opsiyonlandi" } } as const;

export async function GET(request: NextRequest) {
  const il = request.nextUrl.searchParams.get("il") || undefined;
  const user = await getMobileUser(request);

  // "Size uygun": oturum + favori varsa favori kategorilerden; yoksa en yeniler.
  let recommendedWhere: Prisma.ListingWhereInput = { ...BASE, isFeatured: false };
  if (user) {
    const favs = await prisma.favorite.findMany({
      where: { userId: user.id },
      select: { listing: { select: { categoryId: true } } },
      take: 60,
    });
    const catIds = [...new Set(favs.map((f) => f.listing.categoryId))];
    if (catIds.length > 0) recommendedWhere = { ...recommendedWhere, categoryId: { in: catIds } };
  }

  const [featuredRows, recommendedRows, nearbyRows, ctx] = await Promise.all([
    prisma.listing.findMany({ where: { ...BASE, isFeatured: true }, orderBy: { createdAt: "desc" }, take: TAKE, include: LISTING_SUMMARY_INCLUDE }),
    prisma.listing.findMany({ where: recommendedWhere, orderBy: { createdAt: "desc" }, take: TAKE, include: LISTING_SUMMARY_INCLUDE }),
    il
      ? prisma.listing.findMany({ where: { ...BASE, il }, orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }], take: TAKE, include: LISTING_SUMMARY_INCLUDE })
      : Promise.resolve([]),
    loadAnalysisContext(),
  ]);

  const allIds = [...featuredRows, ...recommendedRows, ...nearbyRows].map((l) => l.id);
  const favIds = user ? await getFavoritedIds(user.id, allIds) : new Set<string>();

  return apiJson({
    featured: featuredRows.map((l) => toListingSummary(l, ctx, favIds.has(l.id))),
    recommended: recommendedRows.map((l) => toListingSummary(l, ctx, favIds.has(l.id))),
    nearby: nearbyRows.map((l) => toListingSummary(l, ctx, favIds.has(l.id))),
  });
}
