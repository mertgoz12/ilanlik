import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { FormSection } from "@/components/form-ui";
import { SOCIAL_LINKS } from "@/lib/social-links";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "İletişim - İlanlio" };

const SUPPORT_EMAIL = "destek@ilanlio.com";

export default function IletisimPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">
          Ana Sayfa
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-700">İletişim</span>
      </nav>

      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">İletişim</h1>
      <p className="mt-2 text-sm text-slate-500">
        Sorularınız, önerileriniz veya şikayetleriniz için bize aşağıdaki formu kullanarak ya da
        doğrudan e-posta yoluyla ulaşabilirsiniz.
      </p>

      <div className="mt-8 flex items-center gap-3 rounded-lg bg-white p-5 shadow-soft">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-light text-brand">
          <Mail className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-slate-500">Destek E-postası</p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm font-semibold text-brand hover:text-accent-dark">
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>

      <div className="mt-6">
        <FormSection title="Bize Yazın" description="Formu doldurun, en kısa sürede size dönüş yapalım.">
          <ContactForm />
        </FormSection>
      </div>

      <div className="mt-8 rounded-lg bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold text-foreground">Sosyal Medyada Bizi Takip Edin</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              aria-label={label}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-brand hover:text-accent"
            >
              <Icon className="h-4.5 w-4.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
