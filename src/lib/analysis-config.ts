import type { AppSettings } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import {
  MAX_DEPRECIATION_RATIO,
  PART_DEPRECIATION_RATES,
  TRAMER_DEPRECIATION_TIERS,
  type DeprecationConfig,
} from "./analysis-defaults";

export {
  PRICE_RANGE_CONFIG,
  PART_DEPRECIATION_RATES,
  TRAMER_DEPRECIATION_TIERS,
  MAX_DEPRECIATION_RATIO,
  TRUST_SCORE_CONFIG,
  type DeprecationConfig,
} from "./analysis-defaults";

// =====================================================================
// KATMAN 2 — YAPAY ZEKA RAPORU
// Varsayılan olarak KAPALI. Otomatik çalışması için .env dosyasına
// AI_ANALYSIS_AUTO=true eklenmelidir. Kapalıyken yapay zeka SADECE
// ilan detay sayfasındaki "Detaylı Yapay Zeka Raporu Oluştur" butonuyla
// manuel olarak tetiklenir ve sonucu veritabanında saklanır.
// =====================================================================
export function isAiAnalysisAutoEnabled(): boolean {
  return process.env.AI_ANALYSIS_AUTO === "true";
}

// =====================================================================
// YAPAY ZEKA RAPORU — FİYATLANDIRMA MODU VE GÜNLÜK LİMİTLER
// "ucretsiz" modda detaylı rapor butonu ödeme istemeden backend raporu
// üretir; maliyet kontrolü kullanıcı/IP başına ve sistem genelinde günlük
// üretim sayısı sınırlanarak yapılır (bkz. ai-report-limits.ts).
// "ucretli" moda geçildiğinde aynı buton ödeme akışını tetikler ve
// Listing.aiReportStatus alanı devreye girer. Admin bu üç değeri .env
// üzerinden değiştirebilir.
// =====================================================================

export type AiReportPricingMode = "ucretsiz" | "ucretli";

// "ucretli" modda gösterilecek varsayılan rapor fiyatı (TL). Admin panelinden
// (AppSettings.aiReportPrice) düzenlenebilir.
export const DEFAULT_AI_REPORT_PRICE = 49;

// Bir AI raporu üretiminin kabaca tahmini API maliyeti (TL). Sadece admin
// panelindeki "bugünkü tahmini maliyet" göstergesi için kullanılır, gerçek
// faturalandırmayı yansıtmaz.
export const AI_REPORT_ESTIMATED_COST_TRY = 0.5;

function pricingModeFromEnv(): AiReportPricingMode {
  return process.env.AI_REPORT_PRICING_MODE === "ucretli" ? "ucretli" : "ucretsiz";
}

// "ucretsiz" modda bir kullanıcının (veya IP'nin) günde üretebileceği azami rapor sayısı.
const DEFAULT_AI_REPORT_DAILY_LIMIT_PER_REQUESTER = 3;

function dailyLimitPerRequesterFromEnv(): number {
  const value = Number(process.env.AI_REPORT_DAILY_LIMIT_PER_USER);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : DEFAULT_AI_REPORT_DAILY_LIMIT_PER_REQUESTER;
}

// "ucretsiz" modda sistem genelinde günde üretilebilecek azami rapor sayısı
// (toplam yapay zeka API maliyetini sınırlamak için).
const DEFAULT_AI_REPORT_DAILY_GLOBAL_CAP = 100;

function dailyGlobalCapFromEnv(): number {
  const value = Number(process.env.AI_REPORT_DAILY_GLOBAL_CAP);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : DEFAULT_AI_REPORT_DAILY_GLOBAL_CAP;
}

// =====================================================================
// ADMIN PANELİ — YAPAY ZEKA KONTROL PANELİ
// Yukarıdaki sabitler/.env değerleri varsayılandır. Admin paneli bu
// varsayılanları AppSettings tablosundaki tekil ("singleton") satıra
// yazarak geçersiz kılabilir. getEffectiveSettings() bu satırı okuyup
// eksik/null alanları varsayılanlarla tamamlar; sonuç kısa süreli
// önbelleğe alınır (admin kaydettiğinde invalidateSettingsCache ile
// hemen geçersiz kılınır).
// =====================================================================

export type EffectiveSettings = {
  aiReportPricingMode: AiReportPricingMode;
  aiReportPrice: number;
  aiReportDailyLimitPerUser: number;
  aiReportDailyGlobalCap: number;
  deprecation: DeprecationConfig;
};

let settingsCache: { value: EffectiveSettings; expiresAt: number } | null = null;
const SETTINGS_CACHE_TTL_MS = 5000;

export function invalidateSettingsCache() {
  settingsCache = null;
}

// AppSettings okunamazsa (DB hatası, eski Prisma client vb.) hata loglanır
// ve tamamen varsayılan/.env değerlerle devam edilir - admin paneli dışındaki
// hiçbir akış bu yüzden kesintiye uğramaz.
async function readAppSettings(): Promise<AppSettings | null> {
  try {
    return await prisma.appSettings.findUnique({ where: { id: "singleton" } });
  } catch (err) {
    console.error("readAppSettings: AppSettings okunamadı, varsayılanlar kullanılıyor.", err);
    return null;
  }
}

export async function getEffectiveSettings(): Promise<EffectiveSettings> {
  if (settingsCache && settingsCache.expiresAt > Date.now()) return settingsCache.value;

  const row = await readAppSettings();

  let partDeprecationRates = PART_DEPRECIATION_RATES;
  if (row?.partDeprecationRates) {
    try {
      partDeprecationRates = { ...PART_DEPRECIATION_RATES, ...JSON.parse(row.partDeprecationRates) };
    } catch {
      // geçersiz JSON - varsayılanlar kullanılır
    }
  }

  let tramerDeprecationTiers = TRAMER_DEPRECIATION_TIERS;
  if (row?.tramerDeprecationTiers) {
    try {
      const parsed = JSON.parse(row.tramerDeprecationTiers);
      if (Array.isArray(parsed) && parsed.length > 0) tramerDeprecationTiers = parsed;
    } catch {
      // geçersiz JSON - varsayılanlar kullanılır
    }
  }

  const value: EffectiveSettings = {
    aiReportPricingMode:
      row?.aiReportPricingMode === "ucretli" || row?.aiReportPricingMode === "ucretsiz"
        ? row.aiReportPricingMode
        : pricingModeFromEnv(),
    aiReportPrice: row?.aiReportPrice ?? DEFAULT_AI_REPORT_PRICE,
    aiReportDailyLimitPerUser: row?.aiReportDailyLimitPerUser ?? dailyLimitPerRequesterFromEnv(),
    aiReportDailyGlobalCap: row?.aiReportDailyGlobalCap ?? dailyGlobalCapFromEnv(),
    deprecation: {
      partDeprecationRates,
      tramerDeprecationTiers,
      maxDeprecationRatio: row?.maxDeprecationRatio ?? MAX_DEPRECIATION_RATIO,
    },
  };

  settingsCache = { value, expiresAt: Date.now() + SETTINGS_CACHE_TTL_MS };
  return value;
}

export async function getAiReportPricingMode(): Promise<AiReportPricingMode> {
  return (await getEffectiveSettings()).aiReportPricingMode;
}

export async function getAiReportDailyLimitPerRequester(): Promise<number> {
  return (await getEffectiveSettings()).aiReportDailyLimitPerUser;
}

export async function getAiReportDailyGlobalCap(): Promise<number> {
  return (await getEffectiveSettings()).aiReportDailyGlobalCap;
}
