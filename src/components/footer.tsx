import Link from "next/link";
import { Globe, Mail } from "lucide-react";
import { Logo } from "./logo";
import { SOCIAL_LINKS } from "@/lib/social-links";
import { isVasitaEmlakActive } from "@/lib/categories";
import { ComingSoonBadge, ComingSoonTrigger } from "./coming-soon";

const SUPPORT_EMAIL = "destek@ilanlio.com";

type FooterLink = { label: string; href: string; comingSoon?: boolean };

const CORPORATE_LINKS: FooterLink[] = [
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Nasıl Çalışır", href: "/nasil-calisir" },
  { label: "Kariyer", href: "/kariyer" },
  { label: "Site Haritası", href: "/site-haritasi" },
  { label: "İletişim", href: "/iletisim" },
];

const SERVICE_LINKS: FooterLink[] = [
  { label: "Ücretsiz İlan Ver", href: "/ilan-ver" },
  { label: "Yapay Zeka Ekspertiz", href: "/yapay-zeka-ekspertiz" },
  { label: "Güvenli Alışveriş", href: "/guvenli-alisveris" },
  { label: "Vitrin / Öne Çıkarma", href: "/one-cikarma" },
  { label: "Galeri / Kurumsal Üyelik", href: "/kurumsal-uyelik" },
];

function categoryLinks(): FooterLink[] {
  const vasitaEmlakActive = isVasitaEmlakActive();
  return [
    { label: "Vasıta", href: "/?kategori=vasita", comingSoon: !vasitaEmlakActive },
    { label: "Emlak", href: "/?kategori=emlak", comingSoon: !vasitaEmlakActive },
    { label: "İkinci El", href: "/?kategori=ikinci-el-ve-sifir-alisveris" },
    { label: "Parça & Aksesuar", href: "/?kategori=yedek-parca-aksesuar-donanim-tuning" },
  ];
}

const LEGAL_LINKS: FooterLink[] = [
  { label: "Kullanım Koşulları", href: "/kullanim-kosullari" },
  { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
  { label: "KVKK / Kişisel Verilerin Korunması", href: "/kvkk" },
  { label: "Çerez Politikası", href: "/cerez-politikasi" },
  { label: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis-sozlesmesi" },
];

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-accent">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-brand-100">
        {links.map((link) =>
          link.comingSoon ? (
            <li key={link.label}>
              <ComingSoonTrigger className="inline-flex items-center gap-1.5 text-brand-100/70">
                {link.label}
                <ComingSoonBadge />
              </ComingSoonTrigger>
            </li>
          ) : (
            <li key={link.label}>
              <Link href={link.href} className="transition-colors hover:text-accent">
                {link.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-brand text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <FooterColumn title="Kurumsal" links={CORPORATE_LINKS} />
          <FooterColumn title="Hizmetler" links={SERVICE_LINKS} />
          <FooterColumn title="Kategoriler" links={categoryLinks()} />
          <FooterColumn title="Gizlilik ve Kullanım" links={LEGAL_LINKS} />

          <div>
            <h3 className="text-sm font-bold text-accent">Bizi Takip Edin</h3>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-accent hover:text-brand"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-center gap-2 text-sm text-brand-100 transition-colors hover:text-accent"
          >
            <Mail className="h-4 w-4 text-accent" />
            Müşteri Hizmetleri / Yardım Merkezi: <span className="font-medium text-white">{SUPPORT_EMAIL}</span>
          </a>
          <span className="flex items-center gap-2 text-sm text-brand-100">
            <Globe className="h-4 w-4 text-accent" />
            Türkçe
          </span>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <Logo size="sm" variant="dark" />
          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-brand-100">
            İlanlio.com&apos;da yer alan kullanıcıların oluşturduğu tüm içerik, görüş ve bilgilerin
            doğruluğu ve sorumluluğu içeriği oluşturan kullanıcıya aittir. İlanlio, kullanıcılar
            tarafından oluşturulan içeriklerden sorumlu değildir.
          </p>
          <p className="mt-4 text-xs text-brand-100/70">
            Copyright &copy; {new Date().getFullYear()} İlanlio.com - Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
