import { prisma } from "./prisma";

// "Fotoğraftan yapay zeka ile ilan doldurma" (Gemini) maliyet kontrolü.
// Anthropic güven puanı raporunun limitlerinden (ai-report-limits.ts / AppSettings)
// TAMAMEN ayrıdır; bu özellik kendi GeminiFillLog tablosunu ve aşağıdaki
// env değişkenlerini kullanır. Değer verilmezse makul varsayılanlar geçerlidir:
//   GEMINI_FILL_DAILY_LIMIT_PER_USER  (kullanıcı/IP başına, gün) — varsayılan 10
//   GEMINI_FILL_DAILY_GLOBAL_CAP      (tüm sistem, gün)          — varsayılan 300

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function getDailyLimitPerRequester(): number {
  return envInt("GEMINI_FILL_DAILY_LIMIT_PER_USER", 10);
}

function getDailyGlobalCap(): number {
  return envInt("GEMINI_FILL_DAILY_GLOBAL_CAP", 300);
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export type GeminiFillRateLimitResult =
  | { ok: true }
  | { ok: false; reason: "kullanici_limiti" | "ip_limiti" | "genel_limit" };

// Kullanıcı/IP başına ve sistem genelinde günlük doldurma sayısını GeminiFillLog
// tablosundan (gün başlangıcı UTC) kontrol eder. Tablo erişimi başarısız olursa
// (örn. prisma client yeniden üretilmemiş) limit kullanıcıyı engellemez; hata
// loglanır ve "ok" döner (ai-report-limits.ts ile aynı dayanıklılık yaklaşımı).
export async function checkGeminiFillRateLimit(params: {
  userId: string | null;
  ip: string | null;
}): Promise<GeminiFillRateLimitResult> {
  try {
    const since = startOfTodayUtc();

    const globalCount = await prisma.geminiFillLog.count({ where: { createdAt: { gte: since } } });
    if (globalCount >= getDailyGlobalCap()) {
      return { ok: false, reason: "genel_limit" };
    }

    const perRequesterLimit = getDailyLimitPerRequester();

    if (params.userId) {
      const userCount = await prisma.geminiFillLog.count({
        where: { userId: params.userId, createdAt: { gte: since } },
      });
      if (userCount >= perRequesterLimit) {
        return { ok: false, reason: "kullanici_limiti" };
      }
    }

    if (params.ip) {
      const ipCount = await prisma.geminiFillLog.count({
        where: { ip: params.ip, createdAt: { gte: since } },
      });
      if (ipCount >= perRequesterLimit) {
        return { ok: false, reason: "ip_limiti" };
      }
    }

    return { ok: true };
  } catch (err) {
    console.error("checkGeminiFillRateLimit: GeminiFillLog kontrolü başarısız, limit atlanıyor.", err);
    return { ok: true };
  }
}

export async function recordGeminiFillUsage(params: {
  userId: string | null;
  ip: string | null;
}): Promise<void> {
  try {
    await prisma.geminiFillLog.create({
      data: { userId: params.userId, ip: params.ip },
    });
  } catch (err) {
    console.error("recordGeminiFillUsage: GeminiFillLog kaydı oluşturulamadı.", err);
  }
}
