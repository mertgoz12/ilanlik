import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { loadAnalysisContext } from "@/lib/mobile-analysis";
import { LISTING_SUMMARY_INCLUDE, toListingSummary } from "@/lib/mobile-dto";

// GET /api/mobile/favorites - kullanıcının favori ilanları (kart DTO'su).
export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  const [favorites, ctx] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: user.id, listing: { status: "active" } },
      orderBy: { createdAt: "desc" },
      include: { listing: { include: LISTING_SUMMARY_INCLUDE } },
    }),
    loadAnalysisContext(),
  ]);

  const listings = favorites.map((f) => toListingSummary(f.listing, ctx, true));
  return apiJson({ listings });
}
