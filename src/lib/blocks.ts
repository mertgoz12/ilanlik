import { prisma } from "./prisma";

// Kullanıcının iki yönlü engel ilişkilerinden gizlenmesi gereken kullanıcı
// id'leri: hem engellediği kişiler hem de onu engelleyenler. Aramalarda bu
// kullanıcıların ilanları gizlenir.
export async function getHiddenUserIds(userId: string): Promise<string[]> {
  const rows = await prisma.userBlock.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });
  const ids = new Set<string>();
  for (const r of rows) ids.add(r.blockerId === userId ? r.blockedId : r.blockerId);
  return [...ids];
}

// İki kullanıcı arasında (herhangi bir yönde) engel var mı? Mesajlaşma engeli.
export async function isBlockedBetween(a: string, b: string): Promise<boolean> {
  const row = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: a, blockedId: b },
        { blockerId: b, blockedId: a },
      ],
    },
    select: { id: true },
  });
  return !!row;
}
