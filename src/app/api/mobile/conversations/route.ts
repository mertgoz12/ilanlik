import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";

// GET /api/mobile/conversations - kullanıcının konuşmaları (alıcı veya satıcı).
export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  const convos = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
    orderBy: { updatedAt: "desc" },
    include: {
      listing: {
        select: { listingNo: true, title: true, images: { orderBy: { order: "asc" }, take: 1 } },
      },
      buyer: { select: { id: true, name: true, avatarUrl: true } },
      seller: { select: { id: true, name: true, avatarUrl: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, createdAt: true, senderId: true } },
    },
  });

  // Okunmamış sayıları (karşı taraftan gelen, readAt null) tek sorguda.
  const ids = convos.map((c) => c.id);
  const unreadRows =
    ids.length > 0
      ? await prisma.message.groupBy({
          by: ["conversationId"],
          where: { conversationId: { in: ids }, senderId: { not: user.id }, readAt: null },
          _count: { _all: true },
        })
      : [];
  const unreadByConvo = new Map(unreadRows.map((r) => [r.conversationId, r._count._all]));

  const conversations = convos.map((c) => {
    const other = c.buyerId === user.id ? c.seller : c.buyer;
    const last = c.messages[0];
    return {
      id: c.id,
      listingNo: c.listing.listingNo,
      listingTitle: c.listing.title,
      listingImage: c.listing.images[0]?.url ?? null,
      otherName: other.name,
      otherAvatarUrl: other.avatarUrl,
      lastMessage: last ? { body: last.body, createdAt: last.createdAt.toISOString(), mine: last.senderId === user.id } : null,
      unread: unreadByConvo.get(c.id) ?? 0,
      updatedAt: c.updatedAt.toISOString(),
    };
  });

  return apiJson({ conversations });
}

// POST /api/mobile/conversations  { listingId }  -> { conversationId }
// İlan detayından "satıcıya mesaj gönder" akışı: alıcı = ben, satıcı = ilan sahibi.
export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  let body: { listingId?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }
  if (!body.listingId) return apiError("listingId gerekli.");

  const listing = await prisma.listing.findUnique({
    where: { id: body.listingId },
    select: { id: true, userId: true, status: true },
  });
  if (!listing || listing.status !== "active") return apiError("İlan bulunamadı.", 404);
  if (listing.userId === user.id) return apiError("Kendi ilanınıza mesaj gönderemezsiniz.", 400);

  const conversation = await prisma.conversation.upsert({
    where: {
      listingId_buyerId_sellerId: { listingId: listing.id, buyerId: user.id, sellerId: listing.userId },
    },
    update: {},
    create: { listingId: listing.id, buyerId: user.id, sellerId: listing.userId },
    select: { id: true },
  });

  return apiJson({ conversationId: conversation.id });
}
