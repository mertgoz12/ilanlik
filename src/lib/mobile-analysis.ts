import { prisma } from "./prisma";
import { getEffectiveSettings } from "./analysis-config";
import {
  computeGenericRuleAnalysis,
  computeRuleAnalysis,
  toComparable,
  toGenericComparable,
  type ComparableListing,
  type GenericComparable,
  type RuleAnalysisResult,
} from "./rule-analysis";

// Web ana sayfasındaki ruleAnalysisFor() ile AYNI analiz - mobil API'de
// yeniden kullanılır. Emsal ilan havuzları + ayarlar bir kez yüklenir, sonra
// her ilana uygulanır. Böylece güven puanı/fiyat analizi web ile birebir aynıdır.

export type AnalysisContext = {
  vehicleComparables: ComparableListing[];
  genericComparables: GenericComparable[];
  deprecation: Awaited<ReturnType<typeof getEffectiveSettings>>["deprecation"];
};

export async function loadAnalysisContext(): Promise<AnalysisContext> {
  const [vehiclePool, genericPool, settings] = await Promise.all([
    prisma.listing.findMany({
      where: { brand: { not: null }, model: { not: null }, year: { not: null }, km: { not: null }, status: "active" },
      select: { id: true, brand: true, model: true, year: true, km: true, price: true },
    }),
    prisma.listing.findMany({
      where: { brand: null, status: "active" },
      select: { id: true, categoryId: true, title: true, price: true },
    }),
    getEffectiveSettings(),
  ]);

  return {
    vehicleComparables: vehiclePool.map(toComparable).filter((c): c is ComparableListing => c !== null),
    genericComparables: genericPool.map(toGenericComparable),
    deprecation: settings.deprecation,
  };
}

export type AnalyzableListing = {
  id: string;
  categoryId: string;
  title: string;
  price: number;
  brand: string | null;
  model: string | null;
  year: number | null;
  km: number | null;
  description: string | null;
  damageInfo: string | null;
  tramerAmount: number | null;
  bodyType?: string | null;
  color?: string | null;
  enginePower?: string | null;
  engineVolume?: string | null;
  drivetrain?: string | null;
  photoCount: number;
};

export function analyzeListing(listing: AnalyzableListing, ctx: AnalysisContext): RuleAnalysisResult {
  if (listing.brand !== null) {
    const result = computeRuleAnalysis(listing, ctx.vehicleComparables, ctx.deprecation);
    if (result) return result;
  }
  return computeGenericRuleAnalysis(listing, ctx.genericComparables);
}
