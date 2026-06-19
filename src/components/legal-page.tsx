import Link from "next/link";
import type { ReactNode } from "react";

export type LegalSection = { id: string; title: string };

export function LegalPage({
  title,
  updatedAt,
  sections,
  children,
}: {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">
          Ana Sayfa
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-700">{title}</span>
      </nav>

      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">Son güncelleme: {updatedAt}</p>

      <div className="mt-8 rounded-lg bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold text-foreground">İçindekiler</p>
        <ol className="mt-3 grid grid-cols-1 gap-1.5 text-sm text-slate-600 sm:grid-cols-2">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="hover:text-brand">
                {i + 1}. {s.title}
              </a>
            </li>
          ))}
        </ol>
      </div>

      <div
        className="mt-8 rounded-lg bg-white p-6 shadow-soft sm:p-8
        [&_h2]:mt-9 [&_h2]:scroll-mt-24 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-brand [&_h2:first-child]:mt-0
        [&_h3]:mt-5 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-foreground
        [&_p]:mt-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-slate-600
        [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:text-sm [&_ul]:text-slate-600
        [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_ol]:text-sm [&_ol]:text-slate-600
        [&_li]:leading-relaxed
        [&_strong]:font-semibold [&_strong]:text-foreground"
      >
        {children}
      </div>
    </div>
  );
}
