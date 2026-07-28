import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { loadAnalysisContext } from "@/lib/mobile-analysis";
import { LISTING_SUMMARY_INCLUDE, toListingSummary } from "@/lib/mobile-dto";
import { getFavoritedIds } from "@/lib/mobile-favorites";

// GET /api/mobile/sellers/:id - satıcı profili + aktif ilanları (mağaza sayfası).
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const seller = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, avatarUrl: true, createdAt: true },
  });
  if (!seller) return apiError("Satıcı bulunamadı.", 404);

  const where = { userId: id, status: "active", optionStatus: { not: "opsiyonlandi" } } as const;

  const [rows, listingCount, ctx, user] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 50,
      include: LISTING_SUMMARY_INCLUDE,
    }),
    prisma.listing.count({ where }),
    loadAnalysisContext(),
    getMobileUser(request),
  ]);

  const favoritedIds = user ? await getFavoritedIds(user.id, rows.map((l) => l.id)) : new Set<string>();
  const listings = rows.map((l) => toListingSummary(l, ctx, favoritedIds.has(l.id)));

  // Oturum varsa bu satıcıyı takip ediyor mu / engellemiş mi?
  let isFollowing = false;
  let isBlocked = false;
  if (user && user.id !== id) {
    const [follow, block] = await Promise.all([
      prisma.sellerFollow.findUnique({
        where: { followerId_sellerId: { followerId: user.id, sellerId: id } },
        select: { id: true },
      }),
      prisma.userBlock.findUnique({
        where: { blockerId_blockedId: { blockerId: user.id, blockedId: id } },
        select: { id: true },
      }),
    ]);
    isFollowing = !!follow;
    isBlocked = !!block;
  }

  return apiJson({
    seller: {
      id: seller.id,
      name: seller.name,
      avatarUrl: seller.avatarUrl,
      memberSince: seller.createdAt.toISOString(),
      listingCount,
      isFollowing,
      isBlocked,
      isSelf: user?.id === id,
    },
    listings,
  });
}
