import { prisma } from "@/lib/prisma";
import { apiJson, getMobileUser } from "@/lib/mobile-api";
import { loadAnalysisContext } from "@/lib/mobile-analysis";
import { LISTING_SUMMARY_INCLUDE, toListingSummary } from "@/lib/mobile-dto";
import { getFavoritedIds } from "@/lib/mobile-favorites";

// POST /api/mobile/listings/batch  { listingNos: string[] }
// Son gezilen ilanlar için: verilen ilan numaralarına ait (aktif) ilanları
// GİRİLEN SIRAYLA döner.
export async function POST(request: Request) {
  let body: { listingNos?: unknown };
  try {
    body = await request.json();
  } catch {
    return apiJson({ listings: [] });
  }
  const nos = Array.isArray(body.listingNos)
    ? body.listingNos.filter((n): n is string => typeof n === "string").slice(0, 30)
    : [];
  if (nos.length === 0) return apiJson({ listings: [] });

  const [rows, ctx, user] = await Promise.all([
    prisma.listing.findMany({
      where: { listingNo: { in: nos }, status: "active", optionStatus: { not: "opsiyonlandi" } },
      include: LISTING_SUMMARY_INCLUDE,
    }),
    loadAnalysisContext(),
    getMobileUser(request),
  ]);

  const favIds = user ? await getFavoritedIds(user.id, rows.map((l) => l.id)) : new Set<string>();
  const byNo = new Map(rows.map((l) => [l.listingNo, l]));
  const listings = nos
    .map((no) => byNo.get(no))
    .filter((l): l is NonNullable<typeof l> => !!l)
    .map((l) => toListingSummary(l, ctx, favIds.has(l.id)));

  return apiJson({ listings });
}
