import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";

// DELETE /api/mobile/conversations/:id/messages/:messageId
// Kullanıcı yalnızca KENDİ metin mesajını silebilir (teklif mesajları
// pazarlığın parçası olduğu için silinemez).
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> },
) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);
  const { id, messageId } = await params;

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { id: true, conversationId: true, senderId: true, type: true },
  });
  if (!message || message.conversationId !== id) return apiError("Mesaj bulunamadı.", 404);
  if (message.senderId !== user.id) return apiError("Yalnızca kendi mesajınızı silebilirsiniz.", 403);
  if (message.type === "offer") return apiError("Teklif mesajları silinemez.");

  await prisma.message.delete({ where: { id: messageId } });
  return apiJson({ ok: true });
}
