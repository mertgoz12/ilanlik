import Link from "next/link";
import { ClockIcon } from "@/components/icons";

export function PlaceholderPage({ title, description }: { title: string; description?: string }) {
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

      <div className="mt-6 rounded-lg bg-white p-8 text-center shadow-soft">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-brand">
          <ClockIcon className="h-6 w-6" />
        </span>
        <p className="mt-4 text-sm font-semibold text-foreground">İçerik yakında eklenecek</p>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
        )}
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
