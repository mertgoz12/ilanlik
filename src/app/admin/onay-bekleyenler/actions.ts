"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { createNotification } from "@/lib/notifications";
import { notifyNearbyOfListing } from "@/lib/notify-nearby";
import { renderListingApprovedEmail, renderListingRejectedEmail } from "@/lib/email-templates";

function revalidateApprovalPaths(listingNo?: string) {
  revalidatePath("/admin/onay-bekleyenler");
  revalidatePath("/admin/ilanlar");
  revalidatePath("/admin");
  revalidatePath("/hesabim/ilanlarim");
  revalidatePath("/");
  if (listingNo) revalidatePath(`/ilan/${listingNo}`);
}

// İlanı onaylar: yayına alır (status=active) ve kullanıcıya bildirim + e-posta
// gönderir. "use server" fonksiyonları HTTP'den çağrılabilir; requireAdmin()
// ikinci savunma katmanı olarak yetkiyi yeniden doğrular.
export async function approveListingAction(listingId: string): Promise<void> {
  await requireAdmin();

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, title: true, listingNo: true, userId: true, status: true, il: true, ilce: true },
  });
  if (!listing || listing.status !== "pending_review") return;

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: "active", reviewedAt: new Date(), rejectionReason: null },
  });

  // Aynı ilçedeki kullanıcılara "yakınında yeni ilan" bildirimi.
  await notifyNearbyOfListing({
    ownerId: listing.userId,
    il: listing.il,
    ilce: listing.ilce,
    title: listing.title,
    listingNo: listing.listingNo,
  });

  await createNotification({
    userId: listing.userId,
    type: "listing_approved",
    title: "İlanınız onaylandı ve yayında! 🎉",
    body: `"${listing.title}" ilanınız onaylandı ve yayına alındı.`,
    link: `/ilan/${listing.listingNo}`,
    email: {
      subject: "🎉 İlanınız onaylandı ve yayında!",
      html: renderListingApprovedEmail({ listingTitle: listing.title, listingNo: listing.listingNo }),
    },
  });

  revalidateApprovalPaths(listing.listingNo);
}

// İlanı reddeder: yayınlanmaz (status=rejected), red sebebi saklanır ve
// kullanıcıya bildirim + e-posta gönderilir.
export async function rejectListingAction(listingId: string, reason: string): Promise<void> {
  await requireAdmin();

  const trimmed = reason.trim();
  if (!trimmed) throw new Error("Red sebebi girilmelidir.");

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, title: true, listingNo: true, userId: true, status: true },
  });
  if (!listing || listing.status !== "pending_review") return;

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: "rejected", rejectionReason: trimmed, reviewedAt: new Date() },
  });

  await createNotification({
    userId: listing.userId,
    type: "listing_rejected",
    title: "İlanınız yayınlanamadı",
    body: `"${listing.title}" ilanınız yayınlanamadı. Sebep: ${trimmed}`,
    link: `/hesabim/ilanlarim`,
    email: {
      subject: "İlanınız yayınlanamadı",
      html: renderListingRejectedEmail({ listingTitle: listing.title, reason: trimmed }),
    },
  });

  revalidateApprovalPaths(listing.listingNo);
}
