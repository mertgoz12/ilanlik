import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";

// GET /api/mobile/conversations/unread-count -> { count }
// Navbar okunmamış mesaj rozeti için hafif sayım (tüm konuşma listesini
// indirmeden). Karşı taraftan gelen, okunmamış mesajları sayar.
export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  const count = await prisma.message.count({
    where: {
      conversation: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
      senderId: { not: user.id },
      readAt: null,
    },
  });

  return apiJson({ count });
}
