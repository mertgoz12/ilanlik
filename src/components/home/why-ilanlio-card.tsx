import { CheckCircle2 } from "lucide-react";

const REASONS = [
  "Her ilan yapay zeka ile denetlenir",
  "Fahiş/tutarsız ilanlar engellenir",
  "Sahte ilanlar tespit edilir",
  "Güven puanı ile şeffaflık sağlanır",
];

export function WhyIlanlioCard() {
  return (
    <section className="rounded-xl bg-white p-4 shadow-soft">
      <h2 className="text-sm font-bold text-foreground">Neden İlanlio?</h2>
      <ul className="mt-2.5 space-y-2">
        {REASONS.map((reason) => (
          <li key={reason} className="flex items-start gap-2 text-xs text-slate-600">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            {reason}
          </li>
        ))}
      </ul>
    </section>
  );
}
