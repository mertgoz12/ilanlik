import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { formatPrice } from "@/lib/format";

// POST /api/mobile/conversations/offer/respond  { offerId, decision: "accept"|"reject" }
// Web respondOfferAction ile aynı: karşı tarafın bekleyen teklifini kabul/reddet.
export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  let payload: { offerId?: string; decision?: string };
  try {
    payload = await request.json();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }
  const { offerId, decision } = payload;
  if (decision !== "accept" && decision !== "reject") return apiError("Geçersiz işlem.");
  if (!offerId) return apiError("offerId gerekli.");

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    select: {
      id: true,
      amount: true,
      status: true,
      createdById: true,
      conversation: { select: { id: true, buyerId: true, sellerId: true } },
    },
  });
  if (!offer) return apiError("Teklif bulunamadı.", 404);

  const conv = offer.conversation;
  if (user.id !== conv.buyerId && user.id !== conv.sellerId) {
    return apiError("Bu teklife erişim yetkiniz yok.", 403);
  }
  if (offer.createdById === user.id) return apiError("Kendi teklifinizi yanıtlayamazsınız.");
  if (offer.status !== "pending") return apiError("Bu teklif artık geçerli değil.");

  if (decision === "accept") {
    const alreadyAccepted = await prisma.offer.findFirst({
      where: { conversationId: conv.id, status: "accepted" },
      select: { id: true },
    });
    if (alreadyAccepted) return apiError("Bu pazarlıkta zaten kabul edilmiş bir teklif var.");
  }

  const newStatus = decision === "accept" ? "accepted" : "rejected";
  await prisma.offer.update({ where: { id: offer.id }, data: { status: newStatus, resolvedAt: new Date() } });

  const body =
    decision === "accept"
      ? `✅ Teklif kabul edildi! (${formatPrice(offer.amount)})`
      : `❌ ${formatPrice(offer.amount)} teklifi reddedildi.`;
  await prisma.message.create({ data: { conversationId: conv.id, senderId: user.id, body } });
  await prisma.conversation.update({ where: { id: conv.id }, data: { updatedAt: new Date() } });

  return apiJson({ ok: true });
}
