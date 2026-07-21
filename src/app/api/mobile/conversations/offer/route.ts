import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { validateOfferAmount, type OfferRole } from "@/lib/offers";
import { CONTACT_INFO_WARNING, MESSAGE_RATE_LIMIT, RATE_LIMIT_WARNING, containsContactInfo } from "@/lib/message-filters";
import { formatPrice } from "@/lib/format";
import { createNotification } from "@/lib/notifications";

// POST /api/mobile/conversations/offer  { listingId? | conversationId?, amount, note? }
// Web submitOfferAction ile aynı: ilk teklif / karşı teklif / teklif güncelleme.
export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  let payload: { listingId?: string; conversationId?: string; amount?: number; note?: string };
  try {
    payload = await request.json();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }
  const amount = Number(payload.amount);
  const note = String(payload.note ?? "").trim().slice(0, 500);

  let conversationId: string | null = null;
  let sellerId: string;
  let buyerId: string;
  let listingId: string;
  let listingPrice: number;
  let isNegotiable: boolean;

  if (payload.conversationId) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: payload.conversationId },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        listingId: true,
        listing: { select: { price: true, isNegotiable: true } },
      },
    });
    if (!conversation || (conversation.buyerId !== user.id && conversation.sellerId !== user.id)) {
      return apiError("Bu konuşmaya erişim yetkiniz yok.", 403);
    }
    conversationId = conversation.id;
    sellerId = conversation.sellerId;
    buyerId = conversation.buyerId;
    listingId = conversation.listingId;
    listingPrice = conversation.listing.price;
    isNegotiable = conversation.listing.isNegotiable;
  } else if (payload.listingId) {
    const listing = await prisma.listing.findUnique({
      where: { id: payload.listingId },
      select: { id: true, userId: true, price: true, isNegotiable: true },
    });
    if (!listing) return apiError("İlan bulunamadı.", 404);
    if (listing.userId === user.id) return apiError("Kendi ilanınıza teklif veremezsiniz.");
    sellerId = listing.userId;
    buyerId = user.id;
    listingId = listing.id;
    listingPrice = listing.price;
    isNegotiable = listing.isNegotiable;
  } else {
    return apiError("listingId veya conversationId gerekli.");
  }

  if (!isNegotiable) return apiError("Bu ilan tekliflere kapalı.");
  const amountError = validateOfferAmount(amount, listingPrice);
  if (amountError) return apiError(amountError);
  if (note && containsContactInfo(note)) return apiError(CONTACT_INFO_WARNING);

  const since = new Date(Date.now() - MESSAGE_RATE_LIMIT.windowMs);
  const recent = await prisma.message.count({ where: { senderId: user.id, createdAt: { gte: since } } });
  if (recent >= MESSAGE_RATE_LIMIT.maxMessages) return apiError(RATE_LIMIT_WARNING, 429);

  const role: OfferRole = user.id === sellerId ? "seller" : "buyer";

  if (!conversationId) {
    const conversation = await prisma.conversation.upsert({
      where: { listingId_buyerId_sellerId: { listingId, buyerId: user.id, sellerId } },
      update: { updatedAt: new Date() },
      create: { listingId, buyerId: user.id, sellerId },
      select: { id: true },
    });
    conversationId = conversation.id;
  }

  const acceptedOffer = await prisma.offer.findFirst({
    where: { conversationId, status: "accepted" },
    select: { id: true },
  });
  if (acceptedOffer) {
    return apiError("Bu pazarlıkta kabul edilmiş bir teklif var; yeni teklif veremezsiniz.");
  }

  const prior = await prisma.offer.findFirst({
    where: { conversationId, status: "pending" },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (prior) {
    await prisma.offer.update({ where: { id: prior.id }, data: { status: "countered", resolvedAt: new Date() } });
  }

  const offer = await prisma.offer.create({
    data: { conversationId, listingId, createdById: user.id, role, amount, note: note || null, parentId: prior?.id ?? null },
  });

  const verb = prior ? (role === "seller" ? "karşı teklif" : "yeni teklif") : "teklif";
  const body = `💰 ${formatPrice(amount)} ${verb}${note ? ` — ${note}` : ""}`;
  await prisma.message.create({
    data: { conversationId, senderId: user.id, body, type: "offer", offerId: offer.id },
  });
  await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

  // Karşı tarafa teklif bildirimi.
  const recipientId = user.id === sellerId ? buyerId : sellerId;
  await createNotification({
    userId: recipientId,
    type: "new_offer",
    title: "Yeni teklif",
    body: `${formatPrice(amount)} ${prior ? "karşı teklif" : "teklif"} geldi.`,
    link: "/hesabim/mesajlar",
  });

  return apiJson({ conversationId, offerId: offer.id });
}
