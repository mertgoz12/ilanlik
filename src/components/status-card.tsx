import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

type Tone = "success" | "error" | "info";

const TONE_STYLES: Record<Tone, string> = {
  success: "bg-emerald-100 text-emerald-600",
  error: "bg-red-100 text-red-600",
  info: "bg-accent-light text-brand",
};

type StatusCardProps = {
  icon: ComponentType<{ className?: string }>;
  tone: Tone;
  title: string;
  message: string;
  cta?: { label: string; href: string };
  children?: ReactNode;
};

// Doğrulama/şifre sıfırlama gibi tek seferlik geçiş sayfalarının paylaştığı
// ortalanmış durum kartı (başarı/hata/bilgi).
export function StatusCard({ icon: Icon, tone, title, message, cta, children }: StatusCardProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${TONE_STYLES[tone]}`}>
        <Icon className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{message}</p>
      {children && <div className="mt-5 w-full">{children}</div>}
      {cta && (
        <Link
          href={cta.href}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-900"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
