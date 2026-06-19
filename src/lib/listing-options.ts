import { randomUUID } from "crypto";
import { prisma } from "./prisma";
import { hashPassword } from "./password";
import { formatOptionDuration } from "./option-format";

export { formatOptionDuration, formatRemainingTime } from "./option-format";

// =====================================================================
// OPSİYONLAMA (REZERVASYON) SİSTEMİ
// Bir alıcı bir ilanı kısa süreliğine rezerve edebilir; bu sürede ilan
// genel listeleme/aramadan gizlenir (status alanından bağımsız bir eksen,
// bkz. Listing.optionStatus). Güncel opsiyon Listing üzerinde, geçmişi
// ListingOption tablosunda tutulur. "Bildirim" mevcut mesajlaşma sistemi
// (Conversation/Message) üzerinden iletilir - ayrı bir bildirim tablosu
// gerekmez, kullanıcılar bunu zaten /hesabim/mesajlar'da görür.
// =====================================================================

export const DEFAULT_OPTION_DURATIONS_HOURS = [24, 48, 72];
export const DEFAULT_OPTION_MAX_ACTIVE_PER_USER = 3;
export const DEFAULT_OPTION_MAX_WEEKLY_CANCELLATIONS = 5;

export type OptionSettings = {
  durationsHours: number[];
  maxActivePerUser: number;
  maxWeeklyCancellations: number;
};

// Admin panelinden (AppSettings.option*) düzenlenebilir; okunamazsa veya
// geçersizse varsayılanlara düşülür - bu yüzden hiçbir akışı kesintiye uğratmaz.
export async function getOptionSettings(): Promise<OptionSettings> {
  let row: {
    optionDurationsHours: string | null;
    optionMaxActivePerUser: number | null;
    optionMaxWeeklyCancellations: number | null;
  } | null = null;

  try {
    row = await prisma.appSettings.findUnique({
      where: { id: "singleton" },
      select: {
        optionDurationsHours: true,
        optionMaxActivePerUser: true,
        optionMaxWeeklyCancellations: true,
      },
    });
  } catch {
    row = null;
  }

  let durationsHours = DEFAULT_OPTION_DURATIONS_HOURS;
  if (row?.optionDurationsHours) {
    try {
      const parsed = JSON.parse(row.optionDurationsHours);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((n) => Number.isFinite(n) && n > 0)) {
        durationsHours = parsed;
      }
    } catch {
      // geçersiz JSON - varsayılan kullanılır
    }
  }

  return {
    durationsHours,
    maxActivePerUser: row?.optionMaxActivePerUser ?? DEFAULT_OPTION_MAX_ACTIVE_PER_USER,
    maxWeeklyCancellations: row?.optionMaxWeeklyCancellations ?? DEFAULT_OPTION_MAX_WEEKLY_CANCELLATIONS,
  };
}

// --- Sistem mesajları için kullanılan otomatik hesap ---

const SYSTEM_USER_EMAIL = "sistem@ilanlik.com";
let cachedSystemUserId: string | null = null;

// Sadece opsiyon süresi otomatik dolduğunda (hiçbir tarafın aksiyonu olmadığı
// tek durum) mesaj göndericisi olarak kullanılır. Diğer tüm opsiyon
// olaylarında (oluşturma, iptal) gerçek aksiyonu yapan kullanıcı gönderici olur.
async function getSystemUserId(): Promise<string> {
  if (cachedSystemUserId) return cachedSystemUserId;

  const existing = await prisma.user.findUnique({ where: { email: SYSTEM_USER_EMAIL }, select: { id: true } });
  if (existing) {
    cachedSystemUserId = existing.id;
    return existing.id;
  }

  const password = await hashPassword(randomUUID());
  const created = await prisma.user.create({
    data: { name: "İlanlık Sistem", email: SYSTEM_USER_EMAIL, password, isVerified: true },
  });
  cachedSystemUserId = created.id;
  return created.id;
}

// Mevcut alıcı-satıcı Conversation'ına bir mesaj ekler (yoksa oluşturur) -
// "bildirim" mekanizması olarak mevcut mesajlaşma sistemini yeniden kullanır.
async function notifyOptionEvent(params: {
  listingId: string;
  buyerId: string;
  sellerId: string;
  senderId: string;
  body: string;
}): Promise<void> {
  const conversation = await prisma.conversation.upsert({
    where: {
      listingId_buyerId_sellerId: {
        listingId: params.listingId,
        buyerId: params.buyerId,
        sellerId: params.sellerId,
      },
    },
    update: { updatedAt: new Date() },
    create: { listingId: params.listingId, buyerId: params.buyerId, sellerId: params.sellerId },
  });

  await prisma.message.create({
    data: { conversationId: conversation.id, senderId: params.senderId, body: params.body },
  });
}

export async function countActiveOptionsForUser(userId: string): Promise<number> {
  return prisma.listingOption.count({ where: { buyerId: userId, status: "aktif" } });
}

export async function countRecentCancellationsForUser(userId: string, since: Date): Promise<number> {
  return prisma.listingOption.count({
    where: { buyerId: userId, endReason: "alici_vazgecti", endedAt: { gte: since } },
  });
}

export type OptionActionResult = { ok: true } | { ok: false; error: string };

export async function createOption(params: {
  listingId: string;
  buyerId: string;
  durationHours: number;
}): Promise<OptionActionResult> {
  const listing = await prisma.listing.findUnique({
    where: { id: params.listingId },
    select: { id: true, title: true, userId: true, optionStatus: true, status: true },
  });
  if (!listing || listing.status !== "active") {
    return { ok: false, error: "İlan bulunamadı." };
  }
  if (listing.userId === params.buyerId) {
    return { ok: false, error: "Kendi ilanınızı opsiyonlayamazsınız." };
  }
  if (listing.optionStatus === "opsiyonlandi") {
    return { ok: false, error: "Bu ilan şu anda başka bir alıcı tarafından opsiyonlu." };
  }

  const settings = await getOptionSettings();
  if (!settings.durationsHours.includes(params.durationHours)) {
    return { ok: false, error: "Geçersiz opsiyon süresi." };
  }

  const activeCount = await countActiveOptionsForUser(params.buyerId);
  if (activeCount >= settings.maxActivePerUser) {
    return {
      ok: false,
      error: `Aynı anda en fazla ${settings.maxActivePerUser} aktif opsiyonunuz olabilir. Önce birini sonlandırın.`,
    };
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentCancellations = await countRecentCancellationsForUser(params.buyerId, weekAgo);
  if (recentCancellations >= settings.maxWeeklyCancellations) {
    return {
      ok: false,
      error: "Son 7 günde çok fazla opsiyon iptal ettiniz. Lütfen daha dikkatli seçim yapın.",
    };
  }

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + params.durationHours * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.listing.update({
      where: { id: listing.id },
      data: {
        optionStatus: "opsiyonlandi",
        optionHolderId: params.buyerId,
        optionStartAt: startedAt,
        optionEndAt: endsAt,
      },
    }),
    prisma.listingOption.create({
      data: {
        listingId: listing.id,
        buyerId: params.buyerId,
        durationHours: params.durationHours,
        startedAt,
        endsAt,
        status: "aktif",
      },
    }),
  ]);

  await notifyOptionEvent({
    listingId: listing.id,
    buyerId: params.buyerId,
    sellerId: listing.userId,
    senderId: params.buyerId,
    body: `Ürününüzü opsiyonladım. Opsiyon süresi: ${formatOptionDuration(params.durationHours)} (bitiş: ${endsAt.toLocaleString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}).`,
  });

  return { ok: true };
}

async function endActiveOption(params: {
  listingId: string;
  endReason: "alici_vazgecti" | "satici_sonlandirdi" | "admin_sonlandirdi";
  senderId: string;
  buyerMessage: string;
  sellerMessage: string;
}): Promise<OptionActionResult> {
  const listing = await prisma.listing.findUnique({
    where: { id: params.listingId },
    select: { id: true, userId: true, optionStatus: true, optionHolderId: true },
  });
  if (!listing || listing.optionStatus !== "opsiyonlandi" || !listing.optionHolderId) {
    return { ok: false, error: "Bu ilan için aktif bir opsiyon bulunamadı." };
  }

  const now = new Date();
  const buyerId = listing.optionHolderId;
  const sellerId = listing.userId;

  await prisma.$transaction([
    prisma.listing.update({
      where: { id: listing.id },
      data: { optionStatus: "bosta", optionHolderId: null, optionStartAt: null, optionEndAt: null },
    }),
    prisma.listingOption.updateMany({
      where: { listingId: listing.id, status: "aktif" },
      data: { status: "bitti", endReason: params.endReason, endedAt: now },
    }),
  ]);

  const isBuyerActor = params.senderId === buyerId;
  await notifyOptionEvent({
    listingId: listing.id,
    buyerId,
    sellerId,
    senderId: params.senderId,
    body: isBuyerActor ? params.buyerMessage : params.sellerMessage,
  });

  return { ok: true };
}

// actingUserId, alıcı (vazgeçme) veya satıcı (sonlandırma) olabilir - ikinci
// (gerçek) yetki kontrolü burada yapılır, arayüz zaten ilgisiz butonu göstermez.
export async function endOption(params: { listingId: string; actingUserId: string }): Promise<OptionActionResult> {
  const listing = await prisma.listing.findUnique({
    where: { id: params.listingId },
    select: { userId: true, optionHolderId: true },
  });
  if (!listing) return { ok: false, error: "İlan bulunamadı." };

  const isBuyer = listing.optionHolderId === params.actingUserId;
  const isSeller = listing.userId === params.actingUserId;
  if (!isBuyer && !isSeller) {
    return { ok: false, error: "Bu işlem için yetkiniz yok." };
  }

  return endActiveOption({
    listingId: params.listingId,
    endReason: isBuyer ? "alici_vazgecti" : "satici_sonlandirdi",
    senderId: params.actingUserId,
    buyerMessage: "Opsiyonu sonlandırdım (vazgeçtim), ilan tekrar yayında.",
    sellerMessage: "Opsiyonu sonlandırdım, ilan tekrar yayında.",
  });
}

// Admin panelinden manuel sonlandırma - taraflardan biri olma şartı yok.
export async function adminEndOption(listingId: string): Promise<OptionActionResult> {
  const systemUserId = await getSystemUserId();
  return endActiveOption({
    listingId,
    endReason: "admin_sonlandirdi",
    senderId: systemUserId,
    buyerMessage: "Opsiyonunuz yönetici tarafından sonlandırıldı, ilan tekrar yayında.",
    sellerMessage: "İlanınızdaki opsiyon yönetici tarafından sonlandırıldı, ilan tekrar yayında.",
  });
}

// Cron/arka plan görevi olmadığı için süresi dolan opsiyonlar OKUMA
// anlarında tembel (lazy) olarak süpürülür (bkz. ana sayfa ve ilan detay
// sayfası). Küçük/orta ölçekli trafik için yeterlidir.
export async function expireStaleOptions(): Promise<void> {
  const now = new Date();
  const stale = await prisma.listing.findMany({
    where: { optionStatus: "opsiyonlandi", optionEndAt: { lte: now } },
    select: { id: true, title: true, userId: true, optionHolderId: true },
  });
  if (stale.length === 0) return;

  const systemUserId = await getSystemUserId();

  for (const listing of stale) {
    if (!listing.optionHolderId) continue;

    await prisma.$transaction([
      prisma.listing.update({
        where: { id: listing.id },
        data: { optionStatus: "bosta", optionHolderId: null, optionStartAt: null, optionEndAt: null },
      }),
      prisma.listingOption.updateMany({
        where: { listingId: listing.id, status: "aktif" },
        data: { status: "bitti", endReason: "suresi_doldu", endedAt: now },
      }),
    ]);

    await notifyOptionEvent({
      listingId: listing.id,
      buyerId: listing.optionHolderId,
      sellerId: listing.userId,
      senderId: systemUserId,
      body: `"${listing.title}" ilanı için opsiyon süresi doldu, ilan tekrar yayında.`,
    });
  }
}
