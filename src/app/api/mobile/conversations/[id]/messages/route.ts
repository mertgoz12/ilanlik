import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import {
  CONTACT_INFO_WARNING,
  MAX_MESSAGE_LENGTH,
  MESSAGE_RATE_LIMIT,
  RATE_LIMIT_WARNING,
  containsContactInfo,
} from "@/lib/message-filters";

// POST /api/mobile/conversations/:id/messages  { body } -> { message }
// Web sendMessageAction ile aynı doğrulama: boş/uzunluk, iletişim bilgisi
// filtresi, gönderim hız limiti.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);
  const { id } = await params;

  let payload: { body?: string };
  try {
    payload = await request.json();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }
  const body = (payload.body ?? "").trim();

  if (!body) return apiError("Mesaj boş olamaz.");
  if (body.length > MAX_MESSAGE_LENGTH) {
    return apiError(`Mesaj en fazla ${MAX_MESSAGE_LENGTH} karakter olabilir.`);
  }
  if (containsContactInfo(body)) return apiError(CONTACT_INFO_WARNING);

  const convo = await prisma.conversation.findUnique({
    where: { id },
    select: { id: true, buyerId: true, sellerId: true },
  });
  if (!convo || (convo.buyerId !== user.id && convo.sellerId !== user.id)) {
    return apiError("Bu konuşmaya erişim yetkiniz yok.", 403);
  }

  // Hız limiti (son pencerede gönderilen mesaj sayısı).
  const since = new Date(Date.now() - MESSAGE_RATE_LIMIT.windowMs);
  const recent = await prisma.message.count({ where: { senderId: user.id, createdAt: { gte: since } } });
  if (recent >= MESSAGE_RATE_LIMIT.maxMessages) return apiError(RATE_LIMIT_WARNING, 429);

  const message = await prisma.message.create({
    data: { conversationId: id, senderId: user.id, body },
    select: { id: true, body: true, createdAt: true },
  });
  await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });

  return apiJson({
    message: { id: message.id, body: message.body, mine: true, createdAt: message.createdAt.toISOString() },
  });
}
