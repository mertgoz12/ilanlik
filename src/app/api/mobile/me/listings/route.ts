import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { getFeatureAllowance } from "@/lib/featuring";

// GET /api/mobile/me/listings - kullanıcının ilanları (tüm durumlar) + öne
// çıkarma hak özeti. "İlanlarım" ekranı için.
export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  const [rows, allowance, convCounts] = await Promise.all([
    prisma.listing.findMany({
      where: { userId: user.id, status: { not: "silindi" } },
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
    }),
    getFeatureAllowance(user.id),
    prisma.conversation.groupBy({
      by: ["listingId"],
      where: { sellerId: user.id },
      _count: { _all: true },
    }),
  ]);

  const msgByListing = new Map(convCounts.map((c) => [c.listingId, c._count._all]));

  const listings = rows.map((l) => ({
    id: l.id,
    listingNo: l.listingNo,
    title: l.title,
    price: l.price,
    il: l.il,
    ilce: l.ilce,
    imageUrl: l.images[0]?.url ?? null,
    status: l.status,
    isFeatured: l.isFeatured,
    views: l.views,
    createdAt: l.createdAt.toISOString(),
    messageCount: msgByListing.get(l.id) ?? 0,
    rejectionReason: l.rejectionReason,
  }));

  return apiJson({ allowance, listings });
}
