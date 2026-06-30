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
import { formatPrice } from "@/lib/format";
import { validateOfferAmount, type OfferRole, type OfferView } from "@/lib/offers";
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
  // "text" | "offer" - "offer" ise offer dolu (teklif baloncuğu).
  type: string;
  offer: OfferView | null;
};

export type ListingThreadState = {
  conversationId: string | null;
  messages: ChatWidgetMessage[];
  // Karşı taraftan gelip bu çağrıda okundu olarak işaretlenen mesaj sayısı
  // (widget, navbar okunmamış rozetini bu kadar düşürür).
  markedRead: number;
};

type SerializableMessage = {
  id: string;
  body: string;
  createdAt: Date;
  senderId: string;
  type: string;
  sender: { name: string; avatarUrl: string | null };
  offer: {
    id: string;
    amount: number;
    status: string;
    role: string;
    createdById: string;
    note: string | null;
  } | null;
};

function serializeMessages(messages: SerializableMessage[]): ChatWidgetMessage[] {
  return messages.map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    senderId: m.senderId,
    senderName: m.sender.name,
    senderAvatarUrl: m.sender.avatarUrl,
    type: m.type,
    offer: m.offer
      ? {
          id: m.offer.id,
          amount: m.offer.amount,
          status: m.offer.status as OfferView["status"],
          role: m.offer.role as OfferView["role"],
          createdById: m.offer.createdById,
          note: m.offer.note,
        }
      : null,
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
    include: {
      sender: { select: { name: true, avatarUrl: true } },
      offer: { select: { id: true, amount: true, status: true, role: true, createdById: true, note: true } },
    },
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

// ---------------------------------------------------------------------------
// TEKLİF VER (pazarlık) - mevcut konuşma/mesaj altyapısı üzerine kurulu
// ---------------------------------------------------------------------------

export type SubmitOfferState = {
  error?: string;
  ok?: boolean;
  conversationId?: string;
  offerId?: string;
  // Her başarılı işlemde değişen damga - istemci yeni gönderimi ayırt eder.
  at?: number;
};

// Teklif / karşı teklif / teklif güncelleme: tek eylem her durumu kapsar.
// - conversationId verilirse o konuşmada (satıcı karşı teklifi VEYA alıcı
//   teklif güncellemesi); verilmezse alıcının ilk teklifi (konuşma oluşturulur).
// - Aynı konuşmadaki önceki "pending" teklif "countered" yapılır (zincir/geçmiş
//   parentId ile korunur). Yeni teklif "offer" tipli bir mesaj olarak düşer →
//   karşı tarafa otomatik bildirim (okunmamış mesaj rozeti).
export async function submitOfferAction(
  _prevState: SubmitOfferState,
  formData: FormData,
): Promise<SubmitOfferState> {
  const session = await requireUser();
  const conversationIdInput = String(formData.get("conversationId") ?? "");
  const listingIdInput = String(formData.get("listingId") ?? "");
  const amount = Number(formData.get("amount"));
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);

  // Konuşma ve ilanı (fiyat + pazarlık durumu + satıcı) çöz.
  let conversationId: string | null = null;
  let sellerId: string;
  let listingId: string;
  let listingPrice: number;
  let isNegotiable: boolean;

  if (conversationIdInput) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationIdInput },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        listingId: true,
        listing: { select: { price: true, isNegotiable: true } },
      },
    });
    if (!conversation || (conversation.buyerId !== session.id && conversation.sellerId !== session.id)) {
      return { error: "Bu konuşmaya erişim yetkiniz yok." };
    }
    conversationId = conversation.id;
    sellerId = conversation.sellerId;
    listingId = conversation.listingId;
    listingPrice = conversation.listing.price;
    isNegotiable = conversation.listing.isNegotiable;
  } else {
    const listing = await prisma.listing.findUnique({
      where: { id: listingIdInput },
      select: { id: true, userId: true, price: true, isNegotiable: true },
    });
    if (!listing) return { error: "İlan bulunamadı." };
    if (listing.userId === session.id) return { error: "Kendi ilanınıza teklif veremezsiniz." };
    sellerId = listing.userId;
    listingId = listing.id;
    listingPrice = listing.price;
    isNegotiable = listing.isNegotiable;
  }

  if (!isNegotiable) return { error: "Bu ilan tekliflere kapalı." };

  const amountError = validateOfferAmount(amount, listingPrice);
  if (amountError) return { error: amountError };
  if (note && containsContactInfo(note)) return { error: CONTACT_INFO_WARNING };

  const rateLimitError = await getRateLimitError(session.id);
  if (rateLimitError) return { error: rateLimitError };

  const role: OfferRole = session.id === sellerId ? "seller" : "buyer";

  // Konuşmayı bul/oluştur (alıcının ilk teklifinde oluşur).
  if (!conversationId) {
    const conversation = await prisma.conversation.upsert({
      where: { listingId_buyerId_sellerId: { listingId, buyerId: session.id, sellerId } },
      update: { updatedAt: new Date() },
      create: { listingId, buyerId: session.id, sellerId },
      select: { id: true },
    });
    conversationId = conversation.id;
  }

  // Bu pazarlıkta kabul edilmiş bir teklif varsa anlaşma sonuçlanmıştır;
  // ne alıcı yeni teklif ne de satıcı karşı teklif verebilir.
  const acceptedOffer = await prisma.offer.findFirst({
    where: { conversationId, status: "accepted" },
    select: { id: true },
  });
  if (acceptedOffer) {
    return { error: "Bu pazarlıkta kabul edilmiş bir teklif var; yeni teklif veremezsiniz." };
  }

  // Önceki bekleyen teklifi "countered" yap (zincir kur).
  const prior = await prisma.offer.findFirst({
    where: { conversationId, status: "pending" },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (prior) {
    await prisma.offer.update({
      where: { id: prior.id },
      data: { status: "countered", resolvedAt: new Date() },
    });
  }

  const offer = await prisma.offer.create({
    data: {
      conversationId,
      listingId,
      createdById: session.id,
      role,
      amount,
      note: note || null,
      parentId: prior?.id ?? null,
    },
  });

  const verb = prior
    ? role === "seller"
      ? "karşı teklif"
      : "yeni teklif"
    : "teklif";
  const body = `💰 ${formatPrice(amount)} ${verb}${note ? ` — ${note}` : ""}`;

  await prisma.message.create({
    data: { conversationId, senderId: session.id, body, type: "offer", offerId: offer.id },
  });
  await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

  revalidatePath("/hesabim/mesajlar");
  return { ok: true, conversationId, offerId: offer.id, at: Date.now() };
}

export type RespondOfferState = { error?: string; ok?: boolean; at?: number };

// Teklifi yanıtla: kabul ("accept") veya reddet ("reject"). Yalnızca KARŞI
// taraf (teklifi vermeyen) ve yalnızca "pending" teklif yanıtlanabilir. Sonuç
// bir sistem mesajı olarak düşer → diğer tarafa bildirim. "Karşı teklif / yeni
// teklif" için bu eylem değil submitOfferAction kullanılır.
export async function respondOfferAction(
  _prevState: RespondOfferState,
  formData: FormData,
): Promise<RespondOfferState> {
  const session = await requireUser();
  const offerId = String(formData.get("offerId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (decision !== "accept" && decision !== "reject") return { error: "Geçersiz işlem." };

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
  if (!offer) return { error: "Teklif bulunamadı." };

  const conv = offer.conversation;
  if (session.id !== conv.buyerId && session.id !== conv.sellerId) {
    return { error: "Bu teklife erişim yetkiniz yok." };
  }
  if (offer.createdById === session.id) return { error: "Kendi teklifinizi yanıtlayamazsınız." };
  if (offer.status !== "pending") return { error: "Bu teklif artık geçerli değil." };

  // Aynı pazarlıkta zaten kabul edilmiş bir teklif varsa ikinci bir kabul olmaz.
  if (decision === "accept") {
    const alreadyAccepted = await prisma.offer.findFirst({
      where: { conversationId: conv.id, status: "accepted" },
      select: { id: true },
    });
    if (alreadyAccepted) return { error: "Bu pazarlıkta zaten kabul edilmiş bir teklif var." };
  }

  const newStatus = decision === "accept" ? "accepted" : "rejected";
  await prisma.offer.update({
    where: { id: offer.id },
    data: { status: newStatus, resolvedAt: new Date() },
  });

  const body =
    decision === "accept"
      ? `✅ Teklif kabul edildi! (${formatPrice(offer.amount)})`
      : `❌ ${formatPrice(offer.amount)} teklifi reddedildi.`;
  await prisma.message.create({ data: { conversationId: conv.id, senderId: session.id, body } });
  await prisma.conversation.update({ where: { id: conv.id }, data: { updatedAt: new Date() } });

  revalidatePath("/hesabim/mesajlar");
  return { ok: true, at: Date.now() };
}
