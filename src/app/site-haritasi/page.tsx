import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORY_TREE, COMING_SOON_SLUGS, isVasitaEmlakActive } from "@/lib/categories";
import { ComingSoonBadge, ComingSoonTrigger } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Site Haritası - İlanlio" };

const OTHER_LINKS = [
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Nasıl Çalışır", href: "/nasil-calisir" },
  { label: "Kariyer", href: "/kariyer" },
  { label: "İletişim", href: "/iletisim" },
  { label: "Ücretsiz İlan Ver", href: "/ilan-ver" },
  { label: "Yapay Zeka Ekspertiz", href: "/yapay-zeka-ekspertiz" },
  { label: "Güvenli Alışveriş", href: "/guvenli-alisveris" },
  { label: "Vitrin / Öne Çıkarma", href: "/one-cikarma" },
  { label: "Galeri / Kurumsal Üyelik", href: "/kurumsal-uyelik" },
  { label: "Giriş Yap", href: "/giris" },
  { label: "Üye Ol", href: "/kayit" },
  { label: "Kullanım Koşulları", href: "/kullanim-kosullari" },
  { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
  { label: "KVKK / Kişisel Verilerin Korunması", href: "/kvkk" },
  { label: "Çerez Politikası", href: "/cerez-politikasi" },
  { label: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis-sozlesmesi" },
];

export default function SiteHaritasiPage() {
  const vasitaEmlakActive = isVasitaEmlakActive();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand">
          Ana Sayfa
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-700">Site Haritası</span>
      </nav>

      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Site Haritası</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_TREE.map((node) => {
          const comingSoon = !vasitaEmlakActive && COMING_SOON_SLUGS.includes(node.slug);
          return (
            <div key={node.slug} className="rounded-lg bg-white p-5 shadow-soft">
              <h2 className="flex items-center gap-2 text-sm font-bold text-brand">
                {comingSoon ? (
                  <ComingSoonTrigger className="flex items-center gap-2 text-slate-400">
                    {node.name}
                    <ComingSoonBadge />
                  </ComingSoonTrigger>
                ) : (
                  <Link href={`/?kategori=${node.slug}`} className="hover:text-accent-dark">
                    {node.name}
                  </Link>
                )}
              </h2>
              {!comingSoon && node.children && node.children.length > 0 && (
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {node.children.map((child) => (
                    <li key={child.slug}>
                      <Link href={`/?kategori=${child.slug}`} className="hover:text-brand">
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        <div className="rounded-lg bg-white p-5 shadow-soft">
          <h2 className="text-sm font-bold text-brand">Diğer Sayfalar</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {OTHER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-brand">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
