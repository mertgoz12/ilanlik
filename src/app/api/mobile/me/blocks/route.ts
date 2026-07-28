import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";

// GET /api/mobile/me/blocks -> engellediğim kullanıcılar (Ayarlar > Engellenenler).
export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  const rows = await prisma.userBlock.findMany({
    where: { blockerId: user.id },
    orderBy: { createdAt: "desc" },
    select: { blocked: { select: { id: true, name: true, avatarUrl: true } } },
  });

  return apiJson({ blocks: rows.map((r) => r.blocked) });
}
