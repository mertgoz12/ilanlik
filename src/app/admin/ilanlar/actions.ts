"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import type { ListingStatus } from "@/lib/listing-status";

function revalidateListingPaths(listingNo?: string) {
  revalidatePath("/admin/ilanlar");
  revalidatePath("/admin/moderasyon");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/hesabim/ilanlarim");
  if (listingNo) revalidatePath(`/ilan/${listingNo}`);
}

// "use server" dosyasındaki TÜM fonksiyonlar HTTP üzerinden çağrılabilir
// server action'lardır; arayüz bu butonları admin olmayanlara göstermese de
// requireAdmin() burada (ikinci savunma katmanı olarak) yeniden doğrulama yapar.
export async function setListingStatusAction(listingId: string, status: ListingStatus) {
  await requireAdmin();
  const listing = await prisma.listing.update({
    where: { id: listingId },
    data: { status },
    select: { listingNo: true },
  });
  revalidateListingPaths(listing.listingNo);
}

// Soft delete: ilan "silindi" durumuna alınır, sitede hiçbir yerde görünmez
// ama veritabanından silinmez; gerekirse restoreListingAction ile geri alınabilir.
export async function deleteListingAction(listingId: string) {
  await requireAdmin();
  const listing = await prisma.listing.update({
    where: { id: listingId },
    data: { status: "silindi" },
    select: { listingNo: true },
  });
  revalidateListingPaths(listing.listingNo);
}

export async function restoreListingAction(listingId: string) {
  await requireAdmin();
  const listing = await prisma.listing.update({
    where: { id: listingId },
    data: { status: "pasif" },
    select: { listingNo: true },
  });
  revalidateListingPaths(listing.listingNo);
}
