"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  buildAnalysisInputFromListing,
  buildGenericAnalysisInput,
  runAiAnalysis,
  runGenericAiAnalysis,
} from "@/lib/ai-analysis";
import { getAiReportPricingMode } from "@/lib/analysis-config";
import { checkAiReportRateLimit, recordAiReportUsage } from "@/lib/ai-report-limits";
import { createOption, endOption } from "@/lib/listing-options";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/account-auth";
import { getSession } from "@/lib/session";

export type GenerateAiReportState = {
  error?: string;
  paymentRequired?: boolean;
};

async function getRequestIp(): Promise<string | null> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return headerList.get("x-real-ip");
}

// KATMAN 2 — YAPAY ZEKA: manuel tetikleme. Sonuç veritabanında saklanır ve
// bir kez üretildikten sonra tekrar çağrılmaz.
//
// "ucretsiz" modda: ödeme istenmeden rapor üretilir, ancak maliyet kontrolü
// için kullanıcı/IP başına ve sistem genelinde günlük limit uygulanır
// (bkz. ai-report-limits.ts).
// "ucretli" modda: rapor henüz ödenmediyse (aiReportStatus !== "odendi")
// ödeme akışını tetikleyecek "paymentRequired" durumu döner; gerçek ödeme
// entegrasyonu bu mod aktif olduğunda eklenecektir.
export async function generateAiReportAction(listingNo: string): Promise<GenerateAiReportState> {
  const session = await getSession();
  if (!session) {
    return { error: "Yapay zeka raporu oluşturmak için giriş yapmalısınız." };
  }

  const listing = await prisma.listing.findUnique({
    where: { listingNo },
    include: { images: { select: { id: true } }, category: { select: { name: true } } },
  });
  if (!listing) {
    return { error: "İlan bulunamadı." };
  }

  if (listing.aiAnalysis) {
    return {};
  }

  const pricingMode = await getAiReportPricingMode();

  if (pricingMode === "ucretli" && listing.aiReportStatus !== "odendi") {
    if (listing.aiReportStatus !== "odeme_bekliyor") {
      await prisma.listing.update({
        where: { id: listing.id },
        data: { aiReportStatus: "odeme_bekliyor" },
      });
      revalidatePath(`/ilan/${listingNo}`);
    }
    return {
      error: "Detaylı yapay zeka raporu için ödeme gerekiyor.",
      paymentRequired: true,
    };
  }

  let ip: string | null = null;
  if (pricingMode === "ucretsiz") {
    ip = await getRequestIp();
    const rateLimit = await checkAiReportRateLimit({ userId: session.id, ip });
    if (!rateLimit.ok) {
      return {
        error:
          rateLimit.reason === "genel_limit"
            ? "Sistem genelinde günlük ücretsiz rapor limitine ulaşıldı. Lütfen daha sonra tekrar deneyin."
            : "Günlük ücretsiz rapor limitinize ulaştınız. Lütfen yarın tekrar deneyin.",
      };
    }
  }

  const analysis = listing.brand
    ? await runAiAnalysis(buildAnalysisInputFromListing(listing))
    : await runGenericAiAnalysis(
        buildGenericAnalysisInput({
          title: listing.title,
          categoryName: listing.category.name,
          price: listing.price,
          description: listing.description,
          photoCount: listing.images.length,
          comparables: (
            await prisma.listing.findMany({
              where: { id: { not: listing.id }, categoryId: listing.categoryId, status: { not: "silindi" } },
              select: { title: true, price: true },
              take: 5,
            })
          ).map((c) => ({ title: c.title, price: c.price })),
        }),
      );
  if (!analysis.ok) {
    return { error: "Rapor oluşturulamadı. Lütfen daha sonra tekrar deneyin." };
  }

  await prisma.listing.update({
    where: { id: listing.id },
    data: { aiAnalysis: JSON.stringify(analysis.result), aiReportStatus: "tamamlandi" },
  });

  if (pricingMode === "ucretsiz") {
    await recordAiReportUsage({ listingId: listing.id, userId: session.id, ip });
  }

  revalidatePath(`/ilan/${listingNo}`);
  return {};
}

export type ReportListingState = {
  error?: string;
  success?: boolean;
};

const MIN_REPORT_REASON_LENGTH = 10;
const MAX_REPORT_REASON_LENGTH = 1000;

// Kullanıcı şikayeti oluşturur; admin panelindeki Moderasyon Kuyruğu bu
// kayıtları "pending" durumdaki ListingReport satırlarından listeler.
export async function reportListingAction(
  listingId: string,
  _prevState: ReportListingState,
  formData: FormData,
): Promise<ReportListingState> {
  const session = await getSession();
  if (!session) {
    return { error: "Şikayet göndermek için giriş yapmalısınız." };
  }

  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < MIN_REPORT_REASON_LENGTH) {
    return { error: "Lütfen şikayet sebebinizi en az 10 karakterle açıklayın." };
  }
  if (reason.length > MAX_REPORT_REASON_LENGTH) {
    return { error: "Açıklama en fazla 1000 karakter olabilir." };
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true } });
  if (!listing) {
    return { error: "İlan bulunamadı." };
  }

  await prisma.listingReport.create({
    data: { listingId, userId: session.id, reason },
  });

  return { success: true };
}

export type OptionFormState = {
  error?: string;
  success?: boolean;
};

function revalidateOptionPaths(listingNo: string) {
  revalidatePath(`/ilan/${listingNo}`);
  revalidatePath("/hesabim/ilanlarim");
  revalidatePath("/hesabim/opsiyonlarim");
}

// Alıcı bir ilanı seçtiği süre kadar rezerve eder; ilan bu süre boyunca
// genel listeleme/aramadan gizlenir (bkz. src/lib/listing-options.ts).
export async function createOptionAction(
  listingId: string,
  _prevState: OptionFormState,
  formData: FormData,
): Promise<OptionFormState> {
  const session = await getSession();
  if (!session) {
    return { error: "Bu ürünü opsiyonlamak için giriş yapmalısınız." };
  }

  const durationHours = Number(formData.get("durationHours"));
  if (!Number.isFinite(durationHours) || durationHours <= 0) {
    return { error: "Lütfen bir opsiyon süresi seçin." };
  }

  const result = await createOption({ listingId, buyerId: session.id, durationHours });
  if (!result.ok) {
    return { error: result.error };
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { listingNo: true } });
  if (listing) revalidateOptionPaths(listing.listingNo);

  return { success: true };
}

// Alıcı ("vazgeç") veya satıcı tarafından opsiyonu sonlandırır; ikinci
// (gerçek) yetki kontrolü endOption() içinde yapılır.
export async function endOptionAction(listingId: string): Promise<void> {
  const session = await requireUser();
  const result = await endOption({ listingId, actingUserId: session.id });
  if (!result.ok) {
    throw new Error(result.error);
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { listingNo: true } });
  if (listing) revalidateOptionPaths(listing.listingNo);
}
