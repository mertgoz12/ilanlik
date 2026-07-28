import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";

// POST /api/mobile/sellers/:id/block  -> engelle/engeli kaldır (toggle).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  const { id } = await params;
  if (id === user.id) return apiError("Kendinizi engelleyemezsiniz.");

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!target) return apiError("Kullanıcı bulunamadı.", 404);

  const existing = await prisma.userBlock.findUnique({
    where: { blockerId_blockedId: { blockerId: user.id, blockedId: id } },
    select: { id: true },
  });

  if (existing) {
    await prisma.userBlock.delete({ where: { id: existing.id } });
    return apiJson({ blocked: false });
  }

  await prisma.userBlock.create({ data: { blockerId: user.id, blockedId: id } });
  return apiJson({ blocked: true });
}
