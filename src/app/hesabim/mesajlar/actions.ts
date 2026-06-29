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

// ---------------------------------------------------------------------------
// İlan detay sayfasındaki sohbet kutusu (masaüstü widget) + mobil yönlendirme
// ---------------------------------------------------------------------------

export type ChatWidgetMessage = {
  id: string;
  body: string;
  // İstemciye serileştirilebilmesi için tarih ISO string olarak taşınır.
  createdAt: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;
};

export type ListingThreadState = {
  conversationId: string | null;
  messages: ChatWidgetMessage[];
  // Karşı taraftan gelip bu çağrıda okundu olarak işaretlenen mesaj sayısı
  // (widget, navbar okunmamış rozetini bu kadar düşürür).
  markedRead: number;
};

function serializeMessages(
  messages: {
    id: string;
    body: string;
    createdAt: Date;
    senderId: string;
    sender: { name: string; avatarUrl: string | null };
  }[],
): ChatWidgetMessage[] {
  return messages.map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    senderId: m.senderId,
    senderName: m.sender.name,
    senderAvatarUrl: m.sender.avatarUrl,
  }));
}

// Widget açılışı + periyodik yenileme: alıcının bu ilan için satıcıyla olan
// konuşmasını ve mesajlarını getirir. Konuşma yoksa OLUŞTURMAZ (sadece
// kullanıcı ilk mesajı gönderince oluşur). Karşı taraftan gelen okunmamışları
// okundu olarak işaretler.
export async function fetchListingThread(listingId: string): Promise<ListingThreadState> {
  const session = await requireUser();
  if (!listingId) return { conversationId: null, messages: [], markedRead: 0 };

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { userId: true },
  });
  if (!listing || listing.userId === session.id) {
    return { conversationId: null, messages: [], markedRead: 0 };
  }

  const conversation = await prisma.conversation.findUnique({
    where: {
      listingId_buyerId_sellerId: { listingId, buyerId: session.id, sellerId: listing.userId },
    },
    select: { id: true },
  });
  if (!conversation) return { conversationId: null, messages: [], markedRead: 0 };

  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { name: true, avatarUrl: true } } },
  });

  const markedRead = await prisma.message.count({
    where: { conversationId: conversation.id, senderId: { not: session.id }, readAt: null },
  });
  if (markedRead > 0) {
    await prisma.message.updateMany({
      where: { conversationId: conversation.id, senderId: { not: session.id }, readAt: null },
      data: { readAt: new Date() },
    });
  }

  return { conversationId: conversation.id, messages: serializeMessages(messages), markedRead };
}

export type SendListingMessageState = {
  error?: string;
  conversationId?: string;
  // Her başarılı gönderimde değişen damga - istemci yeni gönderimi ayırt eder.
  sentAt?: number;
};

// Widget'tan mesaj gönderimi (useActionState): konuşma yoksa oluşturur, mesajı
// kaydeder ve oluşan konuşma id'sini döndürür. Yönlendirme yapmaz (sayfada kalır).
export async function sendListingMessageAction(
  _prevState: SendListingMessageState,
  formData: FormData,
): Promise<SendListingMessageState> {
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
      listingId_buyerId_sellerId: { listingId, buyerId: session.id, sellerId: listing.userId },
    },
    update: { updatedAt: new Date() },
    create: { listingId, buyerId: session.id, sellerId: listing.userId },
  });

  await prisma.message.create({
    data: { conversationId: conversation.id, senderId: session.id, body },
  });

  revalidatePath("/hesabim/mesajlar");
  return { conversationId: conversation.id, sentAt: Date.now() };
}

// Mobil "Mesaj Gönder": konuşmayı bul/oluştur ve tam ekran sohbet sayfasına
// yönlendir (mobilde widget yerine tam ekran daha iyi).
export async function openListingConversationAction(formData: FormData): Promise<void> {
  const session = await requireUser();
  const listingId = String(formData.get("listingId") ?? "");
  if (!listingId) redirect("/hesabim/mesajlar");

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { userId: true },
  });
  if (!listing || listing.userId === session.id) redirect("/hesabim/mesajlar");

  const conversation = await prisma.conversation.upsert({
    where: {
      listingId_buyerId_sellerId: { listingId, buyerId: session.id, sellerId: listing.userId },
    },
    update: {},
    create: { listingId, buyerId: session.id, sellerId: listing.userId },
  });

  redirect(`/hesabim/mesajlar?c=${conversation.id}`);
}
