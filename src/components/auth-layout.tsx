import type { ReactNode } from "react";
import { Award, ScanSearch, ShieldCheck } from "lucide-react";
import { Logo } from "./logo";

const TRUST_ITEMS = [
  { icon: ScanSearch, text: "Her ilan yapay zeka ile denetlenir" },
  { icon: ShieldCheck, text: "Güvenli, şeffaf alışveriş" },
  { icon: Award, text: "Güven puanıyla işaretlenen ilanlar" },
];

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

// Giriş/kayıt sayfalarının paylaştığı split-screen kabuk: solda marka/illüstrasyon
// paneli (sadece lg+ ekranlarda), sağda form. Mobilde tek kolona iner (sol
// panel tamamen gizlenir, logo üstte global navbar'dan zaten görünür).
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-soft-lg lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-950 via-brand to-brand-700 p-10 lg:flex">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1.5px)",
              backgroundSize: "26px 26px",
            }}
          />
          <div className="absolute -top-16 -right-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-brand-400/25 blur-3xl" />

          <div className="relative z-10">
            <Logo size="md" variant="dark" />
            <h2 className="mt-12 text-3xl font-extrabold leading-tight text-white">
              Güvenle Al,
              <span className="block text-accent">Güvenle Sat</span>
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-100">
              İlanlio&apos;da her ilan yapay zeka ile denetlenir - fahiş fiyat ve tutarsız ilanlar
              otomatik tespit edilir.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            {TRUST_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-sm font-medium text-white">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-accent">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-10">
          <div className="mb-6 text-center lg:text-left">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
