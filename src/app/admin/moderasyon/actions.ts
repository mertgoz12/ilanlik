"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export type ModerationDecision = "approve" | "reject" | "warn";

function revalidateModerationPaths() {
  revalidatePath("/admin/moderasyon");
  revalidatePath("/admin/ilanlar");
  revalidatePath("/admin");
}

// "use server" dosyasındaki TÜM fonksiyonlar HTTP üzerinden çağrılabilir
// server action'lardır; arayüz bu butonları admin olmayanlara göstermese de
// requireAdmin() burada (ikinci savunma katmanı olarak) yeniden doğrulama yapar.
export async function resolveAiFlagAction(listingId: string, decision: ModerationDecision) {
  await requireAdmin();

  if (decision === "reject") {
    await prisma.listing.update({
      where: { id: listingId },
      data: { status: "pasif", flagResolvedAt: new Date() },
    });
  } else if (decision === "warn") {
    const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { userId: true } });
    if (listing) {
      await prisma.user.update({ where: { id: listing.userId }, data: { warningCount: { increment: 1 } } });
    }
    await prisma.listing.update({ where: { id: listingId }, data: { flagResolvedAt: new Date() } });
  } else {
    await prisma.listing.update({ where: { id: listingId }, data: { flagResolvedAt: new Date() } });
  }

  revalidateModerationPaths();
}

export async function resolveListingReportAction(reportId: string, decision: ModerationDecision) {
  await requireAdmin();

  const report = await prisma.listingReport.findUnique({
    where: { id: reportId },
    include: { listing: { select: { userId: true } } },
  });
  if (!report) return;

  if (decision === "reject") {
    await prisma.listing.update({ where: { id: report.listingId }, data: { status: "pasif" } });
    await prisma.listingReport.update({ where: { id: reportId }, data: { status: "resolved" } });
  } else if (decision === "warn") {
    await prisma.user.update({ where: { id: report.listing.userId }, data: { warningCount: { increment: 1 } } });
    await prisma.listingReport.update({ where: { id: reportId }, data: { status: "resolved" } });
  } else {
    await prisma.listingReport.update({ where: { id: reportId }, data: { status: "dismissed" } });
  }

  revalidateModerationPaths();
}
