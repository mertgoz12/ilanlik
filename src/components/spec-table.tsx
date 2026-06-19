export type SpecEntry = { label: string; value: string };

// Sahibinden tarzı sıkışık liste: ince satırlar, "Etiket … Değer" düzeni.
// Geniş ekranlarda CSS grid satırları soldan sağa, yukarıdan aşağı sırayla
// iki dar kolona yerleştirir; mobilde tek kolona düşer.
export function SpecTable({ entries }: { entries: SpecEntry[] }) {
  return (
    <dl className="grid grid-cols-1 overflow-hidden rounded-lg border border-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-slate-100">
      {entries.map((entry) => (
        <div
          key={entry.label}
          className="flex items-baseline justify-between gap-3 border-b border-slate-100 px-3 py-2 text-sm"
        >
          <dt className="shrink-0 text-slate-500">{entry.label}</dt>
          <dd
            className={`min-w-0 flex-1 truncate text-right font-medium ${
              entry.value === "Belirtilmemiş" ? "text-slate-400" : "text-foreground"
            }`}
            title={entry.value}
          >
            {entry.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
