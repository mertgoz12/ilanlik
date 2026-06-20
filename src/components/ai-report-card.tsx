import type { AiAnalysisResult } from "@/lib/ai-analysis";
import type { AiReportPricingMode } from "@/lib/analysis-config";
import { formatPrice } from "@/lib/format";
import { RULE_FIYAT_DURUMU_LABELS, RULE_FIYAT_DURUMU_STYLES, type RuleAnalysisResult } from "@/lib/rule-analysis";
import { AiReportTrigger } from "./ai-report-trigger";
import { SparkleIcon } from "./icons";
import { TrustBadge } from "./trust-badge";

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

const BULGU_ONEM_DOT: Record<"dusuk" | "orta" | "yuksek", string> = {
  yuksek: "bg-red-400",
  orta: "bg-amber-400",
  dusuk: "bg-slate-300",
};

type AiReportCardProps = {
  rule: RuleAnalysisResult;
  ai: AiAnalysisResult | null;
  price: number;
  listingNo: string;
  pricingMode: AiReportPricingMode;
};

export function AiReportCard({ rule, ai, price, listingNo, pricingMode }: AiReportCardProps) {
  const fiyat = rule.fiyat_analizi;
  const ekspertiz = ai?.ekspertiz_raporu;
  // Vasıta ilanlarında hasar_yorumu her zaman dolu döner (computeRuleAnalysis);
  // vasıta dışı ilanlarda bu kavram yok, computeGenericRuleAnalysis boş bırakır.
  const hasarYorumu = ekspertiz?.hasar_yorumu ?? rule.hasar_yorumu;
  const isVehicleListing = rule.hasar_yorumu !== "";

  const hasRange = fiyat.tahmini_deger_alt != null && fiyat.tahmini_deger_ust != null;

  let rangeStart = 0;
  let rangeEnd = 100;
  let priceMarker = 50;
  if (hasRange) {
    const alt = fiyat.tahmini_deger_alt!;
    const ust = fiyat.tahmini_deger_ust!;
    const rangeMin = Math.min(alt, price) * 0.95;
    const rangeMax = Math.max(ust, price) * 1.05 || 1;
    const span = rangeMax - rangeMin || 1;
    rangeStart = clampPercent(((alt - rangeMin) / span) * 100);
    rangeEnd = clampPercent(((ust - rangeMin) / span) * 100);
    priceMarker = clampPercent(((price - rangeMin) / span) * 100);
  }

  return (
    <section className="rounded-lg border border-emerald-100 bg-white p-6 shadow-soft">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <SparkleIcon className="h-5 w-5 text-emerald-500" />
        {isVehicleListing ? "İlanlio Yapay Zeka Ekspertiz Raporu" : "İlanlio Yapay Zeka Analizi"}
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <TrustBadge score={rule.tutarlilik_analizi.guven_puani} size="lg" />
          <p className="text-sm font-medium text-slate-600">Güven Puanı</p>
          <p className="max-w-[180px] text-xs text-slate-400">{rule.tutarlilik_analizi.puan_ozeti}</p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">Fiyat Analizi</p>
            <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${RULE_FIYAT_DURUMU_STYLES[fiyat.fiyat_durumu]}`}>
              {RULE_FIYAT_DURUMU_LABELS[fiyat.fiyat_durumu]}
            </span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
            {hasRange && (
              <>
                <div
                  className="absolute inset-y-0 rounded-full bg-emerald-200"
                  style={{ left: `${rangeStart}%`, width: `${Math.max(0, rangeEnd - rangeStart)}%` }}
                />
                <div
                  className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-slate-700"
                  style={{ left: `${priceMarker}%` }}
                />
              </>
            )}
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-slate-500">
            <span>Tahmini Min: {hasRange ? formatPrice(fiyat.tahmini_deger_alt!) : "—"}</span>
            <span>Tahmini Max: {hasRange ? formatPrice(fiyat.tahmini_deger_ust!) : "—"}</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {hasRange
              ? `Benzer ilanlara göre · ${fiyat.emsal_sayisi} emsal karşılaştırıldı.`
              : isVehicleListing
                ? "Bu araç için piyasada yeterli sayıda benzer ilan bulunmadığından fiyat aralığı hesaplanamadı."
                : "Bu ürüne yeterince benzer ilan bulunmadığından kesin bir fiyat değerlendirmesi yapılamadı."}
          </p>
        </div>
      </div>

      {rule.tutarlilik_analizi.bulgular.length > 0 && (
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Tespit Edilen Bulgular</h3>
          <ul className="space-y-1.5 text-sm text-slate-600">
            {rule.tutarlilik_analizi.bulgular.map((bulgu, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${BULGU_ONEM_DOT[bulgu.onem]}`} />
                <span>{bulgu.aciklama}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={`mt-6 grid grid-cols-1 gap-4 ${hasarYorumu ? "sm:grid-cols-2" : ""}`}>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">Genel Değerlendirme</h3>
          <p className="text-sm leading-relaxed text-slate-600">
            {ekspertiz?.genel_degerlendirme ?? rule.genel_degerlendirme}
          </p>
        </div>
        {hasarYorumu && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">Hasar Yorumu</h3>
            <p className="text-sm leading-relaxed text-slate-600">{hasarYorumu}</p>
          </div>
        )}
      </div>

      {rule.deger_kaybi.kalemler.length > 0 && (
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">Tahmini Değer Kaybı</h3>
            <span className="text-sm font-semibold text-foreground">
              %{Math.round(rule.deger_kaybi.toplam_oran * 100)} (~{formatPrice(rule.deger_kaybi.tahmini_tutar)})
            </span>
          </div>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
            {rule.deger_kaybi.kalemler.map((kalem, i) => (
              <li key={i}>
                {kalem.etken} — ~%{Math.round(kalem.oran * 100)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 rounded-lg border border-dashed border-emerald-200 bg-emerald-50/40 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SparkleIcon className="h-4 w-4 text-emerald-500" />
          Detaylı Yapay Zeka Raporu
        </h3>

        {ekspertiz ? (
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">Satıcıya Sorulacak Sorular</h4>
              {ekspertiz.saticiya_sorulacak_sorular.length > 0 ? (
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
                  {ekspertiz.saticiya_sorulacak_sorular.map((soru) => (
                    <li key={soru}>{soru}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">Belirgin bir soru tespit edilmedi.</p>
              )}
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">Önerilen Pazarlık Payı</h4>
              <div className="rounded-lg border border-slate-100 bg-white px-3 py-2.5">
                <p className="text-sm font-semibold text-foreground">
                  {formatPrice(ekspertiz.pazarlik_payi.alt)} – {formatPrice(ekspertiz.pazarlik_payi.ust)}
                </p>
                <p className="mt-1 text-xs text-slate-500">{ekspertiz.pazarlik_payi.aciklama}</p>
              </div>
            </div>

            {ekspertiz.kronik_sorunlar.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-foreground">
                  {isVehicleListing ? "Kronik Sorunlar" : "Bilinen Sorunlar"}
                </h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
                  {ekspertiz.kronik_sorunlar.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-slate-600">
              Yapay zeka; sade dilli bir genel değerlendirme, satıcıya sorulacak kritik sorular, makul
              pazarlık aralığı ve {isVehicleListing ? "bu marka/modele" : "bu ürüne"} özgü bilinen
              sorunları içeren detaylı bir rapor oluşturabilir.
            </p>
            <AiReportTrigger listingNo={listingNo} pricingMode={pricingMode} />
          </div>
        )}
      </div>
    </section>
  );
}
