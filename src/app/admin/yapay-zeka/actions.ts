"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import {
  buildAnalysisInputFromListing,
  buildGenericAnalysisInput,
  runAiAnalysis,
  runGenericAiAnalysis,
} from "@/lib/ai-analysis";
import { getEffectiveSettings, invalidateSettingsCache } from "@/lib/analysis-config";
import { DAMAGE_PART_STATUSES, type DamagePartStatus } from "@/lib/car-data";

// Son katman ("üstü") için sonsuz oranı JSON'a yazılamadığından, pratikte
// hiçbir TRAMER/fiyat oranının aşamayacağı sabit bir tavan kullanılır.
const TRAMER_MAX_RATIO_SENTINEL = 999;

function readNumber(formData: FormData, key: string, fallback: number): number {
  const raw = formData.get(key);
  if (raw == null) return fallback;
  const num = Number(raw);
  return Number.isFinite(num) ? num : fallback;
}

// Form alanları "%" olarak girilir (örn. 5 -> 0.05); fallback zaten 0-1 arası bir orandır.
function readPercent(formData: FormData, key: string, fallback: number): number {
  const raw = formData.get(key);
  if (raw == null) return fallback;
  const num = Number(raw);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(Math.max(num, 0), 100_000) / 100;
}

function clampInt(value: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(value), min), max);
}

// "use server" dosyasındaki TÜM fonksiyonlar HTTP üzerinden çağrılabilir
// server action'lardır; arayüz bu formu admin olmayanlara göstermese de
// requireAdmin() burada (ikinci savunma katmanı olarak) yeniden doğrulama yapar.
export async function updateAiSettingsAction(formData: FormData) {
  await requireAdmin();

  const current = await getEffectiveSettings();

  const aiReportPricingMode = formData.get("aiReportPricingMode") === "ucretli" ? "ucretli" : "ucretsiz";
  const aiReportPrice = Math.max(0, readNumber(formData, "aiReportPrice", current.aiReportPrice));
  const aiReportDailyLimitPerUser = clampInt(
    readNumber(formData, "aiReportDailyLimitPerUser", current.aiReportDailyLimitPerUser),
    1,
    1000,
  );
  const aiReportDailyGlobalCap = clampInt(
    readNumber(formData, "aiReportDailyGlobalCap", current.aiReportDailyGlobalCap),
    1,
    100_000,
  );
  const maxDeprecationRatio = readPercent(formData, "maxDeprecationRatio", current.deprecation.maxDeprecationRatio);

  const partDeprecationRates: Record<string, number> = {};
  for (const { value } of DAMAGE_PART_STATUSES) {
    partDeprecationRates[value] = readPercent(
      formData,
      `part_${value}`,
      current.deprecation.partDeprecationRates[value as DamagePartStatus],
    );
  }

  const tramerDeprecationTiers = current.deprecation.tramerDeprecationTiers.map((tier, i) => {
    const rate = readPercent(formData, `tramer_rate_${i}`, tier.rate);
    const isLast = i === current.deprecation.tramerDeprecationTiers.length - 1;
    const maxRatio = isLast
      ? TRAMER_MAX_RATIO_SENTINEL
      : readPercent(formData, `tramer_max_${i}`, tier.maxRatio);
    return { maxRatio, rate };
  });

  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: {
      aiReportPricingMode,
      aiReportPrice,
      aiReportDailyLimitPerUser,
      aiReportDailyGlobalCap,
      maxDeprecationRatio,
      partDeprecationRates: JSON.stringify(partDeprecationRates),
      tramerDeprecationTiers: JSON.stringify(tramerDeprecationTiers),
    },
    create: {
      id: "singleton",
      aiReportPricingMode,
      aiReportPrice,
      aiReportDailyLimitPerUser,
      aiReportDailyGlobalCap,
      maxDeprecationRatio,
      partDeprecationRates: JSON.stringify(partDeprecationRates),
      tramerDeprecationTiers: JSON.stringify(tramerDeprecationTiers),
    },
  });

  invalidateSettingsCache();
  revalidatePath("/admin/yapay-zeka");
  revalidatePath("/admin");
}

export type TriggerAiReportState = { error?: string; success?: string };

// Herhangi bir Vasıta ilanı için, fiyatlandırma modu/günlük limitlerden
// bağımsız olarak, ücretsiz ve manuel bir yapay zeka raporu üretir.
export async function triggerAiReportAction(
  _prevState: TriggerAiReportState,
  formData: FormData,
): Promise<TriggerAiReportState> {
  const admin = await requireAdmin();

  const listingNo = String(formData.get("listingNo") ?? "").trim();
  if (!listingNo) {
    return { error: "Lütfen bir ilan numarası girin." };
  }

  const listing = await prisma.listing.findUnique({
    where: { listingNo },
    include: { images: { select: { id: true } }, category: { select: { name: true } } },
  });
  if (!listing) {
    return { error: "Bu ilan numarasına sahip bir ilan bulunamadı." };
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
    data: { aiAnalysis: JSON.stringify(analysis.result), aiReportStatus: "tamamlandi", flagResolvedAt: null },
  });
  await prisma.aiReportLog.create({ data: { listingId: listing.id, userId: admin.id } });

  revalidatePath("/admin/yapay-zeka");
  revalidatePath("/admin/moderasyon");
  revalidatePath("/admin/ilanlar");
  revalidatePath("/admin");
  revalidatePath(`/ilan/${listingNo}`);

  return { success: `"${listing.title}" (#${listingNo}) için rapor başarıyla oluşturuldu.` };
}
