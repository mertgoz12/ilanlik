import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export type NotificationType =
  | "listing_approved"
  | "listing_rejected"
  | "new_message"
  | "new_offer"
  | "new_listing_nearby";

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  // Verilirse ve kullanıcının "İlan durumu bildirimleri" tercihi açıksa
  // (notifyListingUpdates) ek olarak e-posta da gönderilir.
  email?: { subject: string; html: string };
};

// Site içi bildirim oluşturur (navbar zil/sayaç + Hesabım > Bildirimler) ve
// kullanıcı tercihi izin veriyorsa e-posta gönderir. Bildirim oluşturma asla
// çağıran akışı (örn. admin onay aksiyonu) çökertmemeli; hata yutulur.
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        link: input.link ?? null,
      },
    });
  } catch (err) {
    console.error("[notifications] create failed:", err);
  }

  if (input.email) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
        select: { email: true, notifyListingUpdates: true },
      });
      if (user?.email && user.notifyListingUpdates) {
        await sendEmail({ to: user.email, subject: input.email.subject, html: input.email.html });
      }
    } catch (err) {
      console.error("[notifications] email failed:", err);
    }
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  // Navbar her sayfada çağırır; Prisma client şema ile senkron değilse tüm
  // siteyi çökertmek yerine sessizce 0 göster (bkz. getUnreadMessageCount).
  try {
    return await prisma.notification.count({ where: { userId, readAt: null } });
  } catch {
    return 0;
  }
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

// Hesabım > Bildirimler sayfası açılınca tüm okunmamışları okundu işaretler.
export async function markAllNotificationsRead(userId: string): Promise<void> {
  try {
    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  } catch (err) {
    console.error("[notifications] markAllRead failed:", err);
  }
}
