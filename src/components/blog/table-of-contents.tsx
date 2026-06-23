import type { TocEntry } from "@/lib/blog-toc";

export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  // Kısa yazılarda içindekiler listesi gereksiz yer kaplar.
  if (entries.length < 3) return null;

  return (
    <nav className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">İçindekiler</p>
      <ul className="space-y-1.5 text-sm">
        {entries.map((entry) => (
          <li key={entry.id} className={entry.level === 3 ? "ml-3" : ""}>
            <a href={`#${entry.id}`} className="text-slate-600 transition-colors hover:text-brand">
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
