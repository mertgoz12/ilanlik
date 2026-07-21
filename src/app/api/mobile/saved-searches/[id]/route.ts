import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { buildListingWhere, parseListingQuery } from "@/lib/listing-query";

async function getOwned(id: string, userId: string) {
  const s = await prisma.savedSearch.findUnique({ where: { id }, select: { id: true, userId: true, query: true } });
  if (!s || s.userId !== userId) return null;
  return s;
}

// DELETE /api/mobile/saved-searches/:id
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);
  const { id } = await params;
  const s = await getOwned(id, user.id);
  if (!s) return apiError("Arama bulunamadı.", 404);
  await prisma.savedSearch.delete({ where: { id } });
  return apiJson({ ok: true });
}

// POST /api/mobile/saved-searches/:id  -> "gördüm" (lastSeenCount güncelle).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);
  const { id } = await params;
  const s = await getOwned(id, user.id);
  if (!s) return apiError("Arama bulunamadı.", 404);
  const where = await buildListingWhere(parseListingQuery(s.query));
  const currentCount = await prisma.listing.count({ where });
  await prisma.savedSearch.update({ where: { id }, data: { lastSeenCount: currentCount } });
  return apiJson({ ok: true });
}
