import { parseAiAnalysis } from "./ai-analysis";

export type ModerationFlag = {
  tip: "celiski" | "supheli_sinyal" | "eksik_bilgi" | "manipulasyon_girisimi";
  onem: "dusuk" | "orta" | "yuksek";
  aciklama: string;
};

// Bir ilanın moderasyon kuyruğuna düşmesine sebep olan yapay zeka bulgularını
// döner: tüm "manipulasyon_girisimi" bulguları ve "yuksek" önemli
// "supheli_sinyal" bulguları (bkz. Admin Paneli > Moderasyon Kuyruğu).
export function getAiModerationFlags(aiAnalysisJson: string | null | undefined): ModerationFlag[] {
  const analysis = parseAiAnalysis(aiAnalysisJson);
  if (!analysis) return [];
  return analysis.tutarlilik_analizi.bulgular.filter(
    (b) => b.tip === "manipulasyon_girisimi" || (b.tip === "supheli_sinyal" && b.onem === "yuksek"),
  );
}
