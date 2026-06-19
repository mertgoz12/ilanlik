import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase } from "lucide-react";

export const metadata: Metadata = { title: "Kariyer - İlanlık" };

const CAREER_EMAIL = "kariyer@ilanlik.com";

export default function KariyerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">
          Ana Sayfa
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-700">Kariyer</span>
      </nav>

      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Kariyer</h1>

      <div className="mt-6 rounded-lg bg-white p-8 text-center shadow-soft">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-brand">
          <Briefcase className="h-6 w-6" />
        </span>
        <p className="mt-4 text-sm font-semibold text-foreground">Şu anda açık pozisyonumuz bulunmamaktadır</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Yine de ekibimize katılmak istiyorsanız özgeçmişinizi aşağıdaki e-posta adresine
          gönderebilirsiniz. Uygun bir pozisyon açıldığında sizinle iletişime geçeriz.
        </p>
        <a
          href={`mailto:${CAREER_EMAIL}`}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {CAREER_EMAIL}
        </a>
      </div>
    </div>
  );
}
