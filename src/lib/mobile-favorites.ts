import { prisma } from "./prisma";

// Verilen ilan id'leri arasından kullanıcının favorilediklerinin kümesi.
export async function getFavoritedIds(userId: string, listingIds: string[]): Promise<Set<string>> {
  if (listingIds.length === 0) return new Set();
  const rows = await prisma.favorite.findMany({
    where: { userId, listingId: { in: listingIds } },
    select: { listingId: true },
  });
  return new Set(rows.map((r) => r.listingId));
}

// Web toggleFavoriteAction ile aynı mantık (çerez yerine Bearer).
export async function toggleFavorite(userId: string, listingId: string): Promise<{ favorited: boolean }> {
  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId, listingId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return { favorited: false };
  }
  await prisma.favorite.create({ data: { userId, listingId } });
  return { favorited: true };
}
