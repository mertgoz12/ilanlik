"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/account-auth";
import {
  CONTACT_INFO_WARNING,
  containsContactInfo,
  MAX_MESSAGE_LENGTH,
  MESSAGE_RATE_LIMIT,
  RATE_LIMIT_WARNING,
} from "@/lib/message-filters";
import { prisma } from "@/lib/prisma";

export type MessageFormState = {
  error?: string;
  success?: boolean;
};

function validateBody(body: string): string | null {
  if (!body) return "Mesaj boş olamaz.";
  if (body.length > MAX_MESSAGE_LENGTH) return `Mesaj en fazla ${MAX_MESSAGE_LENGTH} karakter olabilir.`;
  if (containsContactInfo(body)) return CONTACT_INFO_WARNING;
  return null;
}

async function getRateLimitError(userId: string): Promise<string | null> {
  const since = new Date(Date.now() - MESSAGE_RATE_LIMIT.windowMs);
  const count = await prisma.message.count({ where: { senderId: userId, createdAt: { gte: since } } });
  if (count >= MESSAGE_RATE_LIMIT.maxMessages) return RATE_LIMIT_WARNING;
  return null;
}

// "Mesaj Gönder" (ilan detay sayfası): ilan + alıcı + satıcı için konuşmayı
// bulur/oluşturur, ilk mesajı kaydeder ve konuşmaya yönlendirir.
export async function startConversationAction(
  _prevState: MessageFormState,
  formData: FormData,
): Promise<MessageFormState> {
  const session = await requireUser();
  const listingId = String(formData.get("listingId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!listingId) return { error: "İlan bulunamadı." };

  const bodyError = validateBody(body);
  if (bodyError) return { error: bodyError };

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, userId: true },
  });
  if (!listing) return { error: "İlan bulunamadı." };
  if (listing.userId === session.id) return { error: "Kendi ilanınıza mesaj gönderemezsiniz." };

  const rateLimitError = await getRateLimitError(session.id);
  if (rateLimitError) return { error: rateLimitError };

  const conversation = await prisma.conversation.upsert({
    where: {
      listingId_buyerId_sellerId: {
        listingId,
        buyerId: session.id,
        sellerId: listing.userId,
      },
    },
    update: { updatedAt: new Date() },
    create: { listingId, buyerId: session.id, sellerId: listing.userId },
  });

  await prisma.message.create({
    data: { conversationId: conversation.id, senderId: session.id, body },
  });

  revalidatePath("/hesabim/mesajlar");
  redirect(`/hesabim/mesajlar?c=${conversation.id}`);
}

// Mesajlaşma sayfasındaki yazma alanı: konuşmaya yeni mesaj ekler. Konuşmanın
// alıcı/satıcı taraflarından biri olunduğu (sahiplik) burada yeniden doğrulanır.
export async function sendMessageAction(
  _prevState: MessageFormState,
  formData: FormData,
): Promise<MessageFormState> {
  const session = await requireUser();
  const conversationId = String(formData.get("conversationId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  const bodyError = validateBody(body);
  if (bodyError) return { error: bodyError };

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, buyerId: true, sellerId: true },
  });
  if (!conversation || (conversation.buyerId !== session.id && conversation.sellerId !== session.id)) {
    return { error: "Bu konuşmaya erişim yetkiniz yok." };
  }

  const rateLimitError = await getRateLimitError(session.id);
  if (rateLimitError) return { error: rateLimitError };

  await prisma.message.create({
    data: { conversationId, senderId: session.id, body },
  });
  await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

  revalidatePath("/hesabim/mesajlar");
  return { success: true };
}
