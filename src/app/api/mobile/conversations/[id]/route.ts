import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";

// GET /api/mobile/conversations/:id - bir konuşmanın mesajları + üst bilgi.
// Karşı taraftan gelen okunmamış mesajlar okundu olarak işaretlenir.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);
  const { id } = await params;

  const convo = await prisma.conversation.findUnique({
    where: { id },
    include: {
      listing: {
        select: {
          listingNo: true,
          title: true,
          price: true,
          isNegotiable: true,
          images: { orderBy: { order: "asc" }, take: 1 },
        },
      },
      buyer: { select: { id: true, name: true, avatarUrl: true } },
      seller: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  if (!convo || (convo.buyerId !== user.id && convo.sellerId !== user.id)) {
    return apiError("Bu konuşmaya erişim yetkiniz yok.", 403);
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      body: true,
      senderId: true,
      createdAt: true,
      type: true,
      offer: { select: { id: true, amount: true, status: true, role: true, createdById: true, note: true } },
    },
  });
  const hasAcceptedOffer = messages.some((m) => m.offer?.status === "accepted");

  // Karşı tarafın mesajlarını okundu işaretle (yanıtı bloklamaz).
  prisma.message
    .updateMany({
      where: { conversationId: id, senderId: { not: user.id }, readAt: null },
      data: { readAt: new Date() },
    })
    .catch(() => {});

  const other = convo.buyerId === user.id ? convo.seller : convo.buyer;

  return apiJson({
    conversation: {
      id: convo.id,
      listingNo: convo.listing.listingNo,
      listingTitle: convo.listing.title,
      listingPrice: convo.listing.price,
      listingImage: convo.listing.images[0]?.url ?? null,
      otherName: other.name,
      otherAvatarUrl: other.avatarUrl,
      isNegotiable: convo.listing.isNegotiable,
      hasAcceptedOffer,
    },
    messages: messages.map((m) => ({
      id: m.id,
      body: m.body,
      mine: m.senderId === user.id,
      createdAt: m.createdAt.toISOString(),
      type: m.type,
      offer: m.offer
        ? {
            id: m.offer.id,
            amount: m.offer.amount,
            status: m.offer.status,
            role: m.offer.role,
            createdById: m.offer.createdById,
            note: m.offer.note,
            mine: m.offer.createdById === user.id,
          }
        : null,
    })),
  });
}
