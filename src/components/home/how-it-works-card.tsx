import Link from "next/link";
import { Handshake, ScanSearch, UserPlus } from "lucide-react";

const STEPS = [
  { icon: UserPlus, title: "Ücretsiz Üye Ol", text: "Saniyeler içinde hesabını oluştur." },
  { icon: ScanSearch, title: "İlanını Ver", text: "Yapay zeka ilanını otomatik denetler." },
  { icon: Handshake, title: "Güvenle Al-Sat", text: "Güven puanıyla şeffaf alışveriş yap." },
];

export function HowItWorksCard() {
  return (
    <section className="rounded-xl bg-white p-4 shadow-soft">
      <h2 className="text-sm font-bold text-foreground">Nasıl Çalışır?</h2>
      <ol className="mt-3 space-y-3">
        {STEPS.map(({ icon: Icon, title, text }, index) => (
          <li key={title} className="flex items-start gap-3">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-accent">
              <Icon className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-brand">
                {index + 1}
              </span>
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">{title}</p>
              <p className="text-[11px] text-slate-500">{text}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link
        href="/ilan-ver"
        className="mt-3 flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-brand shadow-sm transition-colors hover:bg-accent-dark"
      >
        Hemen Başla
      </Link>
    </section>
  );
}
