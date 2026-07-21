import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";

// GET /api/mobile/sellers/following - takip edilen (favori) satıcılar.
export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  const follows = await prisma.sellerFollow.findMany({
    where: { followerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          _count: { select: { listings: { where: { status: "active" } } } },
        },
      },
    },
  });

  const sellers = follows.map((f) => ({
    id: f.seller.id,
    name: f.seller.name,
    avatarUrl: f.seller.avatarUrl,
    listingCount: f.seller._count.listings,
  }));

  return apiJson({ sellers });
}
