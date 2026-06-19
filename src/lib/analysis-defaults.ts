import type { DamagePartStatus } from "./car-data";

// =====================================================================
// KATMAN 1 — KURAL TABANLI ANALİZ AYARLARI (varsayılan değerler)
// Bu dosya prisma'ya bağımlı DEĞİLDİR, böylece src/lib/rule-analysis.ts
// (ve onu kullanan istemci bileşenleri, örn. ilan-ver sihirbazı önizlemesi)
// veritabanı sürücüsünü (Neon/pg) tarayıcı paketine dahil etmeden bu
// sabitleri kullanabilir.
// Admin tarafından geçersiz kılınabilen "etkin" değerler için
// src/lib/analysis-config.ts → getEffectiveSettings() kullanılır.
// =====================================================================

// --- Fiyat aralığı: emsal ilan eşleştirme ayarları (Vasıta) ---
export const PRICE_RANGE_CONFIG = {
  // Emsal sayılmak için yıl farkı en fazla bu kadar olabilir (± yıl)
  yearTolerance: 2,
  // Emsal sayılmak için km farkı bu oranın içinde olmalı (± %)
  kmToleranceRatio: 0.3,
  // Bu sayının altında emsal varsa "yetersiz_veri" döner
  minComparables: 3,
  // Fiyat, emsal alt sınırının bu oranından daha azsa "piyasanın altında"
  belowMarketRatio: 0.9,
  // Fiyat, emsal üst sınırının bu oranından fazlaysa "aşırı yüksek"
  aboveMarketRatio: 1.15,
};

// --- Fiyat aralığı: vasıta dışı (ikinci el/sıfır ürün) ayarları ---
// İkinci el ürün fiyatları (durum, garanti, aksesuar tamlığı vb. nedeniyle)
// araçlardan çok daha değişkendir ve emsaller marka/model/km gibi kesin
// alanlarla değil sadece kategori + başlık benzerliğiyle eşleştirilir - bu
// yüzden tolerans kasıtlı olarak çok daha geniş tutulur. Emsal eşleşmesi
// zayıfsa (3'ten az) KESİN bir "üstünde/altında" hükmü verilmez, nötr
// "yetersiz_veri" döner - yanlış damga, damgasızlıktan kötüdür.
export const GENERIC_PRICE_RANGE_CONFIG = {
  // Aynı kategoride VE başlığı en az bu kadar ortak anlamlı kelime
  // paylaşan ilanlar emsal sayılır (bkz. titleOverlapCount).
  minTitleOverlap: 1,
  // Bu sayının altında (yeterince benzer) emsal varsa "yetersiz_veri" döner
  minComparables: 3,
  // Fiyat, emsallerin MEDYANININ bu oranından daha azsa "piyasanın altında"
  belowMarketRatio: 0.6,
  // Fiyat, medyanın bu oranından fazlaysa "piyasanın üstünde"
  aboveMarketRatio: 1.3,
  // Fiyat, medyanın bu oranından fazlaysa "aşırı yüksek" (moderasyon kuyruğunu tetikler)
  extremeAboveRatio: 1.8,
};

// --- Değer kaybı: parça durumu katsayıları ---
// Her parça için, o parçanın durumunun ilan fiyatına oranla yol açtığı
// tahmini değer kaybı (0-1 arası). Birden çok parça etkisi toplanır.
export const PART_DEPRECIATION_RATES: Record<DamagePartStatus, number> = {
  orijinal: 0,
  plastik: 0.005,
  "lokal-boyali": 0.01,
  boyali: 0.02,
  "ezik-gocuk": 0.02,
  tramer: 0.03,
  degisen: 0.05,
};

// --- Değer kaybı: TRAMER tutarının ilan fiyatına oranına göre ek kayıp ---
// İlk eşleşen (maxRatio'yu aşmayan) kademe uygulanır.
export const TRAMER_DEPRECIATION_TIERS: { maxRatio: number; rate: number }[] = [
  { maxRatio: 0.02, rate: 0 },
  { maxRatio: 0.05, rate: 0.03 },
  { maxRatio: 0.1, rate: 0.08 },
  { maxRatio: Infinity, rate: 0.15 },
];

// Toplam değer kaybı oranının üst sınırı (mantıksız >%100 sonuçları önler)
export const MAX_DEPRECIATION_RATIO = 0.6;

// --- Güven puanı: kural tabanlı bulgu ayarları ---
// İLKE: Güven puanı ARACIN KALİTESİNİ değil, İLANIN GÜVENİLİRLİĞİNİ (satıcının
// dürüstlüğü, ilan içeriğinin tutarlılığı) ölçer. Hasar/boya/değişen kaydı veya
// emsal ilan azlığı TEK BAŞINA bu puanı düşürmez - aracın fiziksel durumu ayrı
// olarak "deger_kaybi"/"hasar_yorumu" alanlarında raporlanır (bkz. rule-analysis.ts).
// Sadece çelişki, dolandırıcılık sinyali, manipülasyon ve özensiz/eksik ilan
// güven puanını düşürür.
export const TRUST_SCORE_CONFIG = {
  startScore: 100,
  // Bulgu önem derecesine göre puan kırılımı (AI sistem promptuyla aynı ölçek).
  // "yuksek": açıklama/veri çelişkisi veya ciddi dolandırıcılık sinyali - en ağır etken.
  // "orta": manipülasyon girişimi veya şüpheli km sinyali.
  // "dusuk": eksik/özensiz doldurulmuş ilan - en hafif etken.
  penalties: { yuksek: 55, orta: 25, dusuk: 8 } as Record<"yuksek" | "orta" | "dusuk", number>,
  // Açıklamada bu ifadelerden biri geçiyorsa ve parça/tramer verisi bunu
  // yalanlıyorsa "celiski" bulgusu eklenir.
  cleanClaimPhrases: [
    "boyasız",
    "değişensiz",
    "hatasız",
    "tramersiz",
    "tramer kaydı yok",
    "hiç boyası yok",
    "hiç değişeni yok",
  ],
  // İlan fiyatı, emsal alt sınırının bu oranından daha azsa "şüpheli düşük fiyat"
  suspiciousPriceRatio: 0.6,
  // Türkiye ortalaması yıllık km beklentisi
  expectedKmPerYear: 18000,
  // Beklenen km'nin bu oranından daha azsa "olası km manipülasyonu" bulgusu eklenir
  kmYearLowRatio: 0.25,
  // Açıklamada aciliyet/ön ödeme baskısı kuran ifadeler
  pressurePhrases: [
    "bugün kaparo",
    "acil satılık",
    "acil sat",
    "sadece nakit",
    "sadece havale",
    "bugün gelen alır",
    "kaçırılmayacak fırsat",
    "fiyat sabit",
    "pazarlık yok kesin",
    "hemen ara",
  ],
  // Eksik/özensiz ilan tespiti (bu sayının altında fotoğraf varsa)
  minPhotoCount: 3,
  // Eksik/özensiz ilan tespiti (açıklama bu karakter sayısının altındaysa)
  minDescriptionLength: 30,
  // Bu sayıda veya daha fazla teknik alan (kasa tipi, renk, motor gücü, motor
  // hacmi, çekiş) eksikse "eksik bilgi" bulgusu eklenir.
  maxMissingTechnicalFields: 3,
};

export type DeprecationConfig = {
  partDeprecationRates: Record<DamagePartStatus, number>;
  tramerDeprecationTiers: { maxRatio: number; rate: number }[];
  maxDeprecationRatio: number;
};
