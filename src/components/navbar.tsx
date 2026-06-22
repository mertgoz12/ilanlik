import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/lib/actions/logout";
import { isVasitaEmlakActive, CATEGORY_TREE, COMING_SOON_SLUGS } from "@/lib/categories";
import { Logo } from "./logo";
import { MobileSearchRow, MobileSearchToggleButton } from "./mobile-search-row";
import { NavbarMobileMenu } from "./navbar-mobile-menu";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";

const POPULAR_QUICK_LINKS = [
  "iPhone 14",
  "Laptop",
  "Koltuk Takımı",
  "PlayStation 5",
  "iPad",
  "Buzdolabı",
  "Araç",
  "Kombi",
];

export async function Navbar() {
  const session = await getSession();
  // avatarUrl JWT'ye gömülmez (profil fotoğrafı değişince anında yansısın
  // diye) - oturum varsa burada DB'den taze okunur.
  const avatarUrl = session
    ? ((await prisma.user.findUnique({ where: { id: session.id }, select: { avatarUrl: true } }))?.avatarUrl ?? null)
    : null;
  const vasitaEmlakActive = isVasitaEmlakActive();
  const categoryOptions = CATEGORY_TREE.filter(
    (node) => vasitaEmlakActive || !COMING_SOON_SLUGS.includes(node.slug),
  ).map((node) => ({ slug: node.slug, name: node.name }));

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Logo size="md" />

        <SearchBar className="hidden flex-1 md:block" categoryOptions={categoryOptions} />

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {session ? (
            <div className="flex items-center gap-2">
              {session.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  title="Yönetim Paneli"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span className="hidden lg:inline">Yönetim Paneli</span>
                </Link>
              )}
              <UserMenu name={session.name} avatarUrl={avatarUrl} logoutAction={logoutAction} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/giris"
                className="px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-brand"
              >
                Giriş Yap
              </Link>
              <Link
                href="/kayit"
                className="hidden rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 lg:inline-flex"
              >
                Üye Ol
              </Link>
            </div>
          )}

          <Link
            href="/ilan-ver"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-brand shadow-sm transition-colors hover:bg-accent-dark"
          >
            <Plus className="h-4 w-4" />
            Ücretsiz İlan Ver
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <MobileSearchToggleButton />
          <NavbarMobileMenu session={session} avatarUrl={avatarUrl} logoutAction={logoutAction} />
        </div>
      </div>

      <MobileSearchRow />

      <div className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-2 scrollbar-hide sm:px-6 lg:px-8">
          <span className="hidden shrink-0 text-xs font-semibold text-slate-400 sm:inline">
            Popüler:
          </span>
          {POPULAR_QUICK_LINKS.map((term) => (
            <Link
              key={term}
              href={`/?q=${encodeURIComponent(term)}`}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-accent hover:bg-accent-light hover:text-brand"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
