import { prisma } from "./prisma";
import { getAiReportDailyGlobalCap, getAiReportDailyLimitPerRequester } from "./analysis-config";

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export type AiReportRateLimitResult =
  | { ok: true }
  | { ok: false; reason: "kullanici_limiti" | "ip_limiti" | "genel_limit" };

// "ucretsiz" fiyatlandırma modunda maliyet kontrolü: kullanıcı/IP başına ve
// sistem genelinde günlük rapor üretim sayısını AiReportLog tablosundan
// (gün başlangıcı UTC) kontrol eder.
//
// AiReportLog erişimi (Prisma client'ı yeniden üretilmeden çalışan bir dev
// sunucusu, beklenmeyen DB hatası vb.) başarısız olursa limit kontrolü
// kullanıcıyı engellemez; hata loglanır ve "ok" döner.
export async function checkAiReportRateLimit(params: {
  userId: string | null;
  ip: string | null;
}): Promise<AiReportRateLimitResult> {
  try {
    const since = startOfTodayUtc();

    const globalCount = await prisma.aiReportLog.count({ where: { createdAt: { gte: since } } });
    if (globalCount >= (await getAiReportDailyGlobalCap())) {
      return { ok: false, reason: "genel_limit" };
    }

    const perRequesterLimit = await getAiReportDailyLimitPerRequester();

    if (params.userId) {
      const userCount = await prisma.aiReportLog.count({
        where: { userId: params.userId, createdAt: { gte: since } },
      });
      if (userCount >= perRequesterLimit) {
        return { ok: false, reason: "kullanici_limiti" };
      }
    }

    if (params.ip) {
      const ipCount = await prisma.aiReportLog.count({
        where: { ip: params.ip, createdAt: { gte: since } },
      });
      if (ipCount >= perRequesterLimit) {
        return { ok: false, reason: "ip_limiti" };
      }
    }

    return { ok: true };
  } catch (err) {
    console.error("checkAiReportRateLimit: AiReportLog kontrolü başarısız, limit atlanıyor.", err);
    return { ok: true };
  }
}

export async function recordAiReportUsage(params: {
  listingId: string;
  userId: string | null;
  ip: string | null;
}): Promise<void> {
  try {
    await prisma.aiReportLog.create({
      data: { listingId: params.listingId, userId: params.userId, ip: params.ip },
    });
  } catch (err) {
    console.error("recordAiReportUsage: AiReportLog kaydı oluşturulamadı.", err);
  }
}
