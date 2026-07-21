import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";

// POST /api/mobile/sellers/:id/follow - satıcıyı takip et/bırak (favori satıcılar).
// Web toggleSellerFollowAction ile aynı.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);
  const { id } = await params;

  if (user.id === id) return apiError("Kendinizi takip edemezsiniz.");

  const existing = await prisma.sellerFollow.findUnique({
    where: { followerId_sellerId: { followerId: user.id, sellerId: id } },
  });
  if (existing) {
    await prisma.sellerFollow.delete({ where: { id: existing.id } });
    return apiJson({ following: false });
  }

  const seller = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!seller) return apiError("Satıcı bulunamadı.", 404);

  await prisma.sellerFollow.create({ data: { followerId: user.id, sellerId: id } });
  return apiJson({ following: true });
}
