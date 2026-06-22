import Link from "next/link";
import { Plus } from "lucide-react";

export function QuickPostCard() {
  return (
    <section className="rounded-xl bg-white p-4 shadow-soft">
      <h2 className="text-sm font-bold text-foreground">Hızlı İlan Ver</h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Evinden çıkmadan ilan ver, binlerce kişiye ulaş.
      </p>
      <Link
        href="/ilan-ver"
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-brand shadow-sm transition-colors hover:bg-accent-dark"
      >
        <Plus className="h-4 w-4" />
        Ücretsiz İlan Ver
      </Link>
    </section>
  );
}
