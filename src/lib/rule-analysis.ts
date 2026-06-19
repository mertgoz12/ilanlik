import {
  FIYAT_DURUMU_LABELS,
  FIYAT_DURUMU_STYLES,
  type FiyatDurumu,
} from "./ai-analysis";
import {
  GENERIC_PRICE_RANGE_CONFIG,
  MAX_DEPRECIATION_RATIO,
  PART_DEPRECIATION_RATES,
  PRICE_RANGE_CONFIG,
  TRAMER_DEPRECIATION_TIERS,
  TRUST_SCORE_CONFIG,
  type DeprecationConfig,
} from "./analysis-defaults";
import { damagePartStatusLabel, type DamagePartStatus } from "./car-data";
import { formatPrice } from "./format";

// =====================================================================
// KATMAN 1 — KURAL TABANLI ANALİZ (yapay zeka kullanılmaz, ücretsiz)
// =====================================================================

export type RuleFiyatDurumu = FiyatDurumu | "yetersiz_veri";

export const RULE_FIYAT_DURUMU_LABELS: Record<RuleFiyatDurumu, string> = {
  ...FIYAT_DURUMU_LABELS,
  yetersiz_veri: "Yetersiz Veri",
};

export const RULE_FIYAT_DURUMU_STYLES: Record<RuleFiyatDurumu, string> = {
  ...FIYAT_DURUMU_STYLES,
  yetersiz_veri: "border-slate-200 bg-slate-50 text-slate-500",
};

// --- Emsal ilan karşılaştırması ---

export type ComparableListing = {
  id: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  price: number;
};

export function toComparable(row: {
  id: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  km: number | null;
  price: number;
}): ComparableListing | null {
  if (!row.brand || !row.model || row.year == null || row.km == null) return null;
  return { id: row.id, brand: row.brand, model: row.model, year: row.year, km: row.km, price: row.price };
}

export type RulePriceRange = {
  fiyat_durumu: RuleFiyatDurumu;
  tahmini_deger_alt: number | null;
  tahmini_deger_ust: number | null;
  emsal_sayisi: number;
};

function computeFiyatDurumu(price: number, alt: number, ust: number): FiyatDurumu {
  const { belowMarketRatio, aboveMarketRatio } = PRICE_RANGE_CONFIG;
  if (price < alt * belowMarketRatio) return "piyasanin_altinda";
  if (price > ust * aboveMarketRatio) return "asiri_yuksek";
  if (price > ust) return "piyasanin_ustunde";
  return "uygun";
}

export function computePriceRange(
  target: { id: string; brand: string; model: string; year: number; km: number; price: number },
  comparables: ComparableListing[],
): RulePriceRange {
  const { yearTolerance, kmToleranceRatio, minComparables } = PRICE_RANGE_CONFIG;
  const kmLow = target.km * (1 - kmToleranceRatio);
  const kmHigh = target.km * (1 + kmToleranceRatio);

  const matches = comparables.filter(
    (c) =>
      c.id !== target.id &&
      c.brand === target.brand &&
      c.model === target.model &&
      Math.abs(c.year - target.year) <= yearTolerance &&
      c.km >= kmLow &&
      c.km <= kmHigh,
  );

  if (matches.length < minComparables) {
    return {
      fiyat_durumu: "yetersiz_veri",
      tahmini_deger_alt: null,
      tahmini_deger_ust: null,
      emsal_sayisi: matches.length,
    };
  }

  const prices = matches.map((m) => m.price).sort((a, b) => a - b);
  const alt = prices[0];
  const ust = prices[prices.length - 1];

  return {
    fiyat_durumu: computeFiyatDurumu(target.price, alt, ust),
    tahmini_deger_alt: alt,
    tahmini_deger_ust: ust,
    emsal_sayisi: matches.length,
  };
}

// --- Değer kaybı (parça durumu + TRAMER katsayıları) ---

export type DeprecationItem = { etken: string; oran: number };

export type RuleDeprecation = {
  toplam_oran: number;
  tahmini_tutar: number;
  kalemler: DeprecationItem[];
};

const DEFAULT_DEPRECIATION_CONFIG: DeprecationConfig = {
  partDeprecationRates: PART_DEPRECIATION_RATES,
  tramerDeprecationTiers: TRAMER_DEPRECIATION_TIERS,
  maxDeprecationRatio: MAX_DEPRECIATION_RATIO,
};

export function computeDeprecation(
  damageInfo: Record<string, DamagePartStatus>,
  tramerAmount: number | null,
  price: number,
  config: DeprecationConfig = DEFAULT_DEPRECIATION_CONFIG,
): RuleDeprecation {
  const kalemler: DeprecationItem[] = [];
  let toplamOran = 0;

  const statusCounts = new Map<DamagePartStatus, number>();
  for (const status of Object.values(damageInfo)) {
    if (status === "orijinal") continue;
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
  }
  for (const [status, count] of statusCounts) {
    const rate = (config.partDeprecationRates[status] ?? 0) * count;
    if (rate <= 0) continue;
    toplamOran += rate;
    kalemler.push({ etken: `${count} adet ${damagePartStatusLabel(status)} parça`, oran: rate });
  }

  if (tramerAmount && tramerAmount > 0 && price > 0) {
    const ratio = tramerAmount / price;
    const tier = config.tramerDeprecationTiers.find((t) => ratio <= t.maxRatio);
    if (tier && tier.rate > 0) {
      toplamOran += tier.rate;
      kalemler.push({ etken: `TRAMER hasar kaydı (${formatPrice(tramerAmount)})`, oran: tier.rate });
    }
  }

  toplamOran = Math.min(toplamOran, config.maxDeprecationRatio);

  return { toplam_oran: toplamOran, tahmini_tutar: Math.round(price * toplamOran), kalemler };
}

// --- Güven puanı (kural tabanlı bulgular) ---

export type TrustFinding = {
  tip: "celiski" | "supheli_sinyal" | "eksik_bilgi" | "manipulasyon_girisimi";
  onem: "dusuk" | "orta" | "yuksek";
  aciklama: string;
};

export type RuleTutarlilik = {
  guven_puani: number;
  puan_ozeti: string;
  bulgular: TrustFinding[];
};

export function computeRuleTrustScore(params: {
  description: string | null;
  damageInfo: Record<string, DamagePartStatus>;
  tramerAmount: number | null;
  price: number;
  year: number;
  km: number;
  priceRange: RulePriceRange;
  // Eksik/özensiz ilan tespiti için - mevcut değilse o kontrol atlanır.
  photoCount?: number;
  bodyType?: string | null;
  color?: string | null;
  enginePower?: string | null;
  engineVolume?: string | null;
  drivetrain?: string | null;
}): RuleTutarlilik {
  const bulgular: TrustFinding[] = [];
  const desc = (params.description ?? "").toLowerCase();
  const cfg = TRUST_SCORE_CONFIG;

  // 1. Açıklama-parça çelişkisi: "boyasız/değişensiz/hatasız" denmiş ama
  //    parça verisi veya TRAMER kaydı bunu yalanlıyor. EN ÖNEMLİ etken: aracın
  //    hasarlı olması değil, satıcının bunu YALANLAMASI güveni kırar.
  const hasNonOriginalPart = Object.values(params.damageInfo).some((s) => s !== "orijinal");
  const hasTramer = !!params.tramerAmount && params.tramerAmount > 0;
  const claimsClean = cfg.cleanClaimPhrases.some((p) => desc.includes(p));
  if (claimsClean && (hasNonOriginalPart || hasTramer)) {
    bulgular.push({
      tip: "celiski",
      onem: "yuksek",
      aciklama:
        "İlan açıklamasında aracın hasarsız/boyasız/değişensiz olduğu belirtilmiş ancak teknik veriler boyalı, değişen veya TRAMER kayıtlı parça(lar) olduğunu gösteriyor.",
    });
  }

  // 2. Anormal düşük fiyat: emsal aralığının belirgin altında (dolandırıcılık riski).
  if (params.priceRange.tahmini_deger_alt != null) {
    if (params.price < params.priceRange.tahmini_deger_alt * cfg.suspiciousPriceRatio) {
      bulgular.push({
        tip: "supheli_sinyal",
        onem: "yuksek",
        aciklama:
          "İlan fiyatı, benzer araçların piyasa aralığının belirgin şekilde altında. Bu durum dolandırıcılık riskine işaret edebilir; ödeme yapmadan aracı ve belgeleri yüz yüze kontrol edin.",
      });
    }
  }

  // 3. Olası kilometre manipülasyonu: yaşına göre anormal düşük km beyanı.
  //    (Yüksek km, aracın normal bir özelliğidir; güveni etkilemez, bu yüzden
  //    burada kontrol edilmez.)
  const age = Math.max(1, new Date().getFullYear() - params.year);
  const expectedKm = age * cfg.expectedKmPerYear;
  if (params.km < expectedKm * cfg.kmYearLowRatio) {
    bulgular.push({
      tip: "supheli_sinyal",
      onem: "orta",
      aciklama: `Aracın yaşına göre kilometresi (${params.km.toLocaleString("tr-TR")} km) beklenenden oldukça düşük. Bu, olası bir kilometre manipülasyonuna işaret edebilir; km bilgisinin doğruluğunu satıcıyla teyit edin.`,
    });
  }

  // 4. Aciliyet / ön ödeme baskısı kuran ifadeler (manipülasyon girişimi).
  const hasPressureLanguage = cfg.pressurePhrases.some((p) => desc.includes(p));
  if (hasPressureLanguage) {
    bulgular.push({
      tip: "manipulasyon_girisimi",
      onem: "orta",
      aciklama:
        "İlan açıklamasında aciliyet veya ön ödeme/kaparo baskısı kuran ifadeler tespit edildi. Temkinli yaklaşın, aracı görmeden ve incelemeden ödeme yapmayın.",
    });
  }

  // 5. Eksik/özensiz doldurulmuş ilan: çok az fotoğraf, çok kısa/boş açıklama
  //    veya çoğu teknik alanın eksik bırakılması. Aracın hasarlı olmasından
  //    BAĞIMSIZ, sadece ilanın ne kadar eksiksiz hazırlandığını ölçer.
  const eksikNedenler: string[] = [];
  if (params.photoCount !== undefined && params.photoCount < cfg.minPhotoCount) {
    eksikNedenler.push("çok az fotoğraf");
  }
  if (desc.trim().length < cfg.minDescriptionLength) {
    eksikNedenler.push("açıklama eksik veya çok kısa");
  }
  const missingTechnicalFields = [
    params.bodyType,
    params.color,
    params.enginePower,
    params.engineVolume,
    params.drivetrain,
  ].filter((v) => v === undefined || v === null || v === "").length;
  if (missingTechnicalFields >= cfg.maxMissingTechnicalFields) {
    eksikNedenler.push("teknik bilgiler eksik");
  }
  if (eksikNedenler.length > 0) {
    bulgular.push({
      tip: "eksik_bilgi",
      onem: "dusuk",
      aciklama: `İlan eksiksiz doldurulmamış (${eksikNedenler.join(", ")}). Daha eksiksiz bir ilan alıcılarda daha güçlü bir güven oluşturur.`,
    });
  }

  // Güven puanı, SADECE yukarıdaki bulgulara (ilanın dürüstlüğü/tutarlılığı)
  // göre hesaplanır. Hasar/boya/değişen geçmişi, TRAMER kaydı ve emsal ilan
  // sayısı/yetersizliği güven puanını ETKİLEMEZ - bunlar "deger_kaybi" ve
  // "fiyat_analizi" alanlarında ayrıca ve doğru şekilde raporlanır.
  let bulguKirilmasi = 0;
  for (const b of bulgular) {
    bulguKirilmasi += cfg.penalties[b.onem];
  }
  const guvenPuani = Math.max(0, Math.min(100, cfg.startScore - bulguKirilmasi));

  const tipVarMi = (tip: TrustFinding["tip"]) => bulgular.some((b) => b.tip === tip);
  const ozetParcalari: string[] = [];
  if (tipVarMi("celiski")) ozetParcalari.push("açıklama ile teknik veriler arasındaki çelişki");
  if (tipVarMi("supheli_sinyal")) ozetParcalari.push("dolandırıcılık riski taşıyan şüpheli sinyal(ler)");
  if (tipVarMi("manipulasyon_girisimi")) ozetParcalari.push("aciliyet/ön ödeme baskısı kuran ifadeler");
  if (tipVarMi("eksik_bilgi")) ozetParcalari.push("eksik/özensiz doldurulmuş ilan bilgileri");

  const puanOzeti =
    ozetParcalari.length === 0
      ? "İlan açıklaması tutarlı ve eksiksiz; herhangi bir şüpheli sinyal tespit edilmedi. (Not: Güven puanı ilanın dürüstlüğünü ölçer; aracın hasar durumu bu puanı etkilemez.)"
      : `Güven puanı şu etkenler nedeniyle düşürüldü: ${ozetParcalari.join(", ")}.`;

  return { guven_puani: guvenPuani, puan_ozeti: puanOzeti, bulgular };
}

// --- Kural tabanlı metin üretimi (yapay zeka raporu yoksa gösterilir) ---

function buildGenelDegerlendirme(
  listing: { brand: string; model: string },
  priceRange: RulePriceRange,
  deprecation: RuleDeprecation,
): string {
  const parts: string[] = [];

  if (priceRange.fiyat_durumu === "yetersiz_veri") {
    parts.push(
      `Bu ${listing.brand} ${listing.model} için piyasada yeterli sayıda benzer ilan bulunmadığından fiyat karşılaştırması yapılamadı.`,
    );
  } else {
    parts.push(
      `Benzer ${listing.brand} ${listing.model} ilanlarına göre bu aracın fiyatı "${RULE_FIYAT_DURUMU_LABELS[priceRange.fiyat_durumu]}" olarak değerlendirildi (${priceRange.emsal_sayisi} emsal ilan karşılaştırıldı).`,
    );
  }

  if (deprecation.toplam_oran > 0) {
    parts.push(
      `Tespit edilen hasar/boya kayıtları nedeniyle aracın değerinde tahmini %${Math.round(deprecation.toplam_oran * 100)} oranında (~${formatPrice(deprecation.tahmini_tutar)}) ek bir değer kaybı olabilir.`,
    );
  } else {
    parts.push("Araçta herhangi bir boya, değişen parça veya TRAMER kaydı tespit edilmedi.");
  }

  return parts.join(" ");
}

function buildHasarYorumu(deprecation: RuleDeprecation): string {
  if (deprecation.kalemler.length === 0) {
    return "Bu araçta orijinal dışı bir parça veya hasar kaydı bulunmamaktadır.";
  }

  const items = deprecation.kalemler
    .map((k) => `${k.etken} (~%${Math.round(k.oran * 100)} değer kaybı)`)
    .join(", ");
  return `Bu araçta şu kalemler tespit edildi: ${items}. Bu tür işlemler genellikle kaza, çarpma veya kozmetik bakım nedeniyle yapılır; satın almadan önce mutlaka bir ekspertiz merkezinde kontrol ettirin.`;
}

// --- Hepsini birleştiren ana fonksiyon ---

export type RuleAnalysisInput = {
  id: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  km: number | null;
  price: number;
  description: string | null;
  damageInfo: string | null; // JSON
  tramerAmount: number | null;
  // Eksik/özensiz ilan tespiti için - mevcut değilse o kontrol atlanır.
  photoCount?: number;
  bodyType?: string | null;
  color?: string | null;
  enginePower?: string | null;
  engineVolume?: string | null;
  drivetrain?: string | null;
};

export type RuleAnalysisResult = {
  fiyat_analizi: RulePriceRange;
  deger_kaybi: RuleDeprecation;
  tutarlilik_analizi: RuleTutarlilik;
  genel_degerlendirme: string;
  hasar_yorumu: string;
};

// Vasıta dışı ilanlar (brand/model/year/km eksik) için null döner.
export function computeRuleAnalysis(
  listing: RuleAnalysisInput,
  comparables: ComparableListing[],
  deprecationConfig?: DeprecationConfig,
): RuleAnalysisResult | null {
  if (!listing.brand || !listing.model || listing.year == null || listing.km == null) return null;

  const target = {
    id: listing.id,
    brand: listing.brand,
    model: listing.model,
    year: listing.year,
    km: listing.km,
    price: listing.price,
  };

  const priceRange = computePriceRange(target, comparables);

  let damageInfo: Record<string, DamagePartStatus> = {};
  try {
    damageInfo = JSON.parse(listing.damageInfo ?? "{}") as Record<string, DamagePartStatus>;
  } catch {
    damageInfo = {};
  }

  const deprecation = computeDeprecation(
    damageInfo,
    listing.tramerAmount,
    listing.price,
    deprecationConfig,
  );

  const tutarlilik = computeRuleTrustScore({
    description: listing.description,
    damageInfo,
    tramerAmount: listing.tramerAmount,
    price: listing.price,
    year: target.year,
    km: target.km,
    priceRange,
    photoCount: listing.photoCount,
    bodyType: listing.bodyType,
    color: listing.color,
    enginePower: listing.enginePower,
    engineVolume: listing.engineVolume,
    drivetrain: listing.drivetrain,
  });

  return {
    fiyat_analizi: priceRange,
    deger_kaybi: deprecation,
    tutarlilik_analizi: tutarlilik,
    genel_degerlendirme: buildGenelDegerlendirme(target, priceRange, deprecation),
    hasar_yorumu: buildHasarYorumu(deprecation),
  };
}

// Emsal ilan listesi mevcut olmadığı (örn. ilan kartı/favoriler/ilanlarım gibi
// liste görünümleri) bağlamlarda kullanılan yedek güven puanı. Aynı dürüstlük/
// tutarlılık mantığını kullanır; sadece fiyat karşılaştırması atlanır
// ("yetersiz_veri" artık güven puanını etkilemediği için bu güvenli bir yedektir).
export function computeFallbackTrustScore(listing: {
  description: string | null;
  damageInfo: string | null; // JSON
  tramerAmount: number | null;
  price: number;
  year: number | null;
  km: number | null;
  photoCount?: number;
  bodyType?: string | null;
  color?: string | null;
  enginePower?: string | null;
  engineVolume?: string | null;
  drivetrain?: string | null;
}): number {
  let damageInfo: Record<string, DamagePartStatus> = {};
  try {
    damageInfo = JSON.parse(listing.damageInfo ?? "{}") as Record<string, DamagePartStatus>;
  } catch {
    damageInfo = {};
  }

  return computeRuleTrustScore({
    description: listing.description,
    damageInfo,
    tramerAmount: listing.tramerAmount,
    price: listing.price,
    year: listing.year ?? new Date().getFullYear(),
    km: listing.km ?? 0,
    priceRange: { fiyat_durumu: "yetersiz_veri", tahmini_deger_alt: null, tahmini_deger_ust: null, emsal_sayisi: 0 },
    photoCount: listing.photoCount,
    bodyType: listing.bodyType,
    color: listing.color,
    enginePower: listing.enginePower,
    engineVolume: listing.engineVolume,
    drivetrain: listing.drivetrain,
  }).guven_puani;
}

// =====================================================================
// VASITA DIŞI (İKİNCİ EL / SIFIR ÜRÜN) İLANLAR İÇİN GENEL ANALİZ
// Aynı güven puanı ilkesini (ilan dürüstlüğü, ürün kalitesi değil) kullanır;
// sadece marka/model/km gibi araca özel alanlar yerine kategori bazlı emsal
// karşılaştırması yapar. Araca özgü bulgular (çelişki, km manipülasyonu)
// burada YOKTUR çünkü genel ürünlerde karşılığı yoktur.
// =====================================================================

export type GenericComparable = { id: string; categoryId: string; title: string; price: number };

export function toGenericComparable(row: {
  id: string;
  categoryId: string;
  title: string;
  price: number;
}): GenericComparable {
  return { id: row.id, categoryId: row.categoryId, title: row.title, price: row.price };
}

// Başlık benzerliği: kategori tek başına emsal saymak için çok geniştir
// (örn. "iPhone 14 Pro" ile "Xiaomi Redmi Note 12" aynı "Cep Telefonu"
// kategorisinde ama fiyatları kıyaslanamaz). Marka/model gibi yapısal alanlar
// olmadığı için başlıktaki anlamlı kelimelerin örtüşmesi kullanılır - jenerik
// dolgu kelimeler ve pazarlama ekleri ("pro", "max" gibi) hariç tutulur.
const GENERIC_TITLE_STOPWORDS = new Set([
  "ve", "ile", "icin", "bir", "bu", "cok", "az", "yeni", "eski", "satilik", "satilir",
  "temiz", "kullanilmis", "sifir", "orijinal", "acil", "ucuz", "firsat", "model", "seri",
  "set", "gibi", "kutusunda", "kutulu", "garantili", "garanti", "fatura", "faturali",
  "faturasiz", "renk", "beden", "numara", "adet", "pro", "max", "plus", "ultra", "mini",
  "lite", "edition", "neo", "air",
]);

function normalizeForMatch(word: string): string {
  return word
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function significantWords(title: string): Set<string> {
  const words = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map(normalizeForMatch)
    .filter((w) => w.length >= 2 && !GENERIC_TITLE_STOPWORDS.has(w));
  return new Set(words);
}

function titleOverlapCount(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const w of a) if (b.has(w)) count++;
  return count;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function computeGenericFiyatDurumu(price: number, med: number): FiyatDurumu {
  const { belowMarketRatio, aboveMarketRatio, extremeAboveRatio } = GENERIC_PRICE_RANGE_CONFIG;
  if (price < med * belowMarketRatio) return "piyasanin_altinda";
  if (price > med * extremeAboveRatio) return "asiri_yuksek";
  if (price > med * aboveMarketRatio) return "piyasanin_ustunde";
  return "uygun";
}

export function computeGenericPriceRange(
  target: { id: string; categoryId: string; title: string; price: number },
  comparables: GenericComparable[],
): RulePriceRange {
  const { minTitleOverlap, minComparables } = GENERIC_PRICE_RANGE_CONFIG;
  const targetWords = significantWords(target.title);

  const matches = comparables.filter(
    (c) =>
      c.id !== target.id &&
      c.categoryId === target.categoryId &&
      titleOverlapCount(targetWords, significantWords(c.title)) >= minTitleOverlap,
  );

  if (matches.length < minComparables) {
    return {
      fiyat_durumu: "yetersiz_veri",
      tahmini_deger_alt: null,
      tahmini_deger_ust: null,
      emsal_sayisi: matches.length,
    };
  }

  const prices = matches.map((m) => m.price).sort((a, b) => a - b);
  const alt = prices[0];
  const ust = prices[prices.length - 1];
  const med = median(prices);

  return {
    // Aralık (alt/ust) gözlemlenen emsal fiyatlarını şeffafça gösterir; ancak
    // "uygun/üstünde/altında" HÜKMÜ tek bir uç emsale göre değil medyana göre
    // (geniş toleransla) verilir - tek bir aşırı ucuz/pahalı ilan tüm hükmü
    // değiştiremez.
    fiyat_durumu: computeGenericFiyatDurumu(target.price, med),
    tahmini_deger_alt: alt,
    tahmini_deger_ust: ust,
    emsal_sayisi: matches.length,
  };
}

export function computeGenericTrustScore(params: {
  description: string | null;
  price: number;
  priceRange: RulePriceRange;
  photoCount?: number;
}): RuleTutarlilik {
  const bulgular: TrustFinding[] = [];
  const desc = (params.description ?? "").toLowerCase();
  const cfg = TRUST_SCORE_CONFIG;

  // 1. Anormal düşük fiyat: kategori emsal aralığının belirgin altında (dolandırıcılık riski).
  if (params.priceRange.tahmini_deger_alt != null) {
    if (params.price < params.priceRange.tahmini_deger_alt * cfg.suspiciousPriceRatio) {
      bulgular.push({
        tip: "supheli_sinyal",
        onem: "yuksek",
        aciklama:
          "İlan fiyatı, aynı kategorideki benzer ilanların piyasa aralığının belirgin şekilde altında. Bu durum dolandırıcılık riskine işaret edebilir; ödeme yapmadan ürünü ve satıcıyı doğrulayın, mümkünse yüz yüze teslim alın.",
      });
    }
  }

  // 2. Aciliyet / ön ödeme baskısı kuran ifadeler (manipülasyon girişimi).
  const hasPressureLanguage = cfg.pressurePhrases.some((p) => desc.includes(p));
  if (hasPressureLanguage) {
    bulgular.push({
      tip: "manipulasyon_girisimi",
      onem: "orta",
      aciklama:
        "İlan açıklamasında aciliyet veya ön ödeme/kapora baskısı kuran ifadeler tespit edildi. Temkinli yaklaşın, ürünü görmeden ve incelemeden ödeme yapmayın.",
    });
  }

  // 3. Eksik/özensiz doldurulmuş ilan: çok az fotoğraf veya çok kısa/boş açıklama.
  const eksikNedenler: string[] = [];
  if (params.photoCount !== undefined && params.photoCount < cfg.minPhotoCount) {
    eksikNedenler.push("çok az fotoğraf");
  }
  if (desc.trim().length < cfg.minDescriptionLength) {
    eksikNedenler.push("açıklama eksik veya çok kısa");
  }
  if (eksikNedenler.length > 0) {
    bulgular.push({
      tip: "eksik_bilgi",
      onem: "dusuk",
      aciklama: `İlan eksiksiz doldurulmamış (${eksikNedenler.join(", ")}). Daha eksiksiz bir ilan alıcılarda daha güçlü bir güven oluşturur.`,
    });
  }

  let bulguKirilmasi = 0;
  for (const b of bulgular) bulguKirilmasi += cfg.penalties[b.onem];
  const guvenPuani = Math.max(0, Math.min(100, cfg.startScore - bulguKirilmasi));

  const tipVarMi = (tip: TrustFinding["tip"]) => bulgular.some((b) => b.tip === tip);
  const ozetParcalari: string[] = [];
  if (tipVarMi("supheli_sinyal")) ozetParcalari.push("dolandırıcılık riski taşıyan şüpheli sinyal(ler)");
  if (tipVarMi("manipulasyon_girisimi")) ozetParcalari.push("aciliyet/ön ödeme baskısı kuran ifadeler");
  if (tipVarMi("eksik_bilgi")) ozetParcalari.push("eksik/özensiz doldurulmuş ilan bilgileri");

  const puanOzeti =
    ozetParcalari.length === 0
      ? "İlan açıklaması tutarlı ve eksiksiz; herhangi bir şüpheli sinyal tespit edilmedi."
      : `Güven puanı şu etkenler nedeniyle düşürüldü: ${ozetParcalari.join(", ")}.`;

  return { guven_puani: guvenPuani, puan_ozeti: puanOzeti, bulgular };
}

// Fiyat etiketinin yanında gösterilecek kısa gerekçe - kullanıcı kararın
// dayanağını görsün, açıklamasız bir damga olmasın.
export function genericFiyatGerekce(priceRange: RulePriceRange): string {
  if (priceRange.fiyat_durumu === "yetersiz_veri") {
    return "Bu ürüne yeterince benzer ilan bulunmadığından fiyat değerlendirmesi yapılamadı.";
  }
  return `Benzer ürün ilanlarına göre (${priceRange.emsal_sayisi} emsal)`;
}

function buildGenericGenelDegerlendirme(priceRange: RulePriceRange): string {
  if (priceRange.fiyat_durumu === "yetersiz_veri") {
    return "Bu ürüne yeterince benzer ilan bulunmadığından fiyat karşılaştırması yapılamadı. Daha kesin bir değerlendirme için \"Detaylı Yapay Zeka Raporu\" oluşturabilirsiniz.";
  }
  return `Benzer ürün ilanlarına göre bu ürünün fiyatı "${RULE_FIYAT_DURUMU_LABELS[priceRange.fiyat_durumu]}" olarak değerlendirildi (${priceRange.emsal_sayisi} emsal ilan karşılaştırıldı).`;
}

export type GenericRuleAnalysisInput = {
  id: string;
  categoryId: string;
  title: string;
  price: number;
  description: string | null;
  photoCount?: number;
};

// Vasıta dışı ilanlar için computeRuleAnalysis'in karşılığı; aynı
// RuleAnalysisResult şeklini döner (deger_kaybi/hasar_yorumu kavramı
// olmadığından boş bırakılır) - böylece AiReportCard değişiklik gerektirmez.
export function computeGenericRuleAnalysis(
  listing: GenericRuleAnalysisInput,
  comparables: GenericComparable[],
): RuleAnalysisResult {
  const priceRange = computeGenericPriceRange(listing, comparables);
  const tutarlilik = computeGenericTrustScore({
    description: listing.description,
    price: listing.price,
    priceRange,
    photoCount: listing.photoCount,
  });

  return {
    fiyat_analizi: priceRange,
    deger_kaybi: { toplam_oran: 0, tahmini_tutar: 0, kalemler: [] },
    tutarlilik_analizi: tutarlilik,
    genel_degerlendirme: buildGenericGenelDegerlendirme(priceRange),
    hasar_yorumu: "",
  };
}

export function computeGenericFallbackTrustScore(listing: {
  description: string | null;
  price: number;
  photoCount?: number;
}): number {
  return computeGenericTrustScore({
    description: listing.description,
    price: listing.price,
    priceRange: { fiyat_durumu: "yetersiz_veri", tahmini_deger_alt: null, tahmini_deger_ust: null, emsal_sayisi: 0 },
    photoCount: listing.photoCount,
  }).guven_puani;
}
