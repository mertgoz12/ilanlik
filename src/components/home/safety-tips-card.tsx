import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const TIPS = [
  "Görüşmeden kapora göndermeyin",
  "Para transferini elden yapın",
  "Şüpheli durumları bize bildirin",
];

export function SafetyTipsCard() {
  return (
    <section className="rounded-xl bg-white p-4 shadow-soft">
      <h2 className="text-sm font-bold text-foreground">Güvenli Alışveriş İpuçları</h2>
      <ul className="mt-2.5 space-y-2">
        {TIPS.map((tip) => (
          <li key={tip} className="flex items-start gap-2 text-xs text-slate-600">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            {tip}
          </li>
        ))}
      </ul>
      <Link
        href="/guvenli-alisveris"
        className="mt-3 inline-block text-xs font-semibold text-brand hover:text-accent-dark"
      >
        Tüm İpuçlarını Gör ›
      </Link>
    </section>
  );
}
