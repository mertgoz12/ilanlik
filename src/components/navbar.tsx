import Link from "next/link";
import { Plus, Search, ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/lib/actions/logout";
import { isVasitaEmlakActive } from "@/lib/categories";
import { Logo } from "./logo";
import { NavbarMobileMenu } from "./navbar-mobile-menu";
import { UserMenu } from "./user-menu";

// Vasıta aktif olduğunda kullanılacak eski hızlı filtreler - kod silinmedi,
// bayrak açıldığında geri döner (bkz. ARAC_EMLAK_AKTIF).
const VASITA_QUICK_LINKS = [
  { label: "BMW", href: "/?brand=BMW" },
  { label: "Mercedes-Benz", href: "/?brand=Mercedes-Benz" },
  { label: "Volkswagen", href: "/?brand=Volkswagen" },
  { label: "0 - 500.000 ₺", href: "/?maxPrice=500000" },
  { label: "2020 ve üzeri", href: "/?minYear=2020" },
  { label: "Elektrikli", href: "/?fuelType=Elektrik" },
  { label: "SUV", href: "/?kategori=arazi-suv-pickup" },
  { label: "Dizel", href: "/?fuelType=Dizel" },
];

// İlk yayın sürümünde vitrin ikinci el/sıfır ürünlere odaklı.
const IKINCI_EL_QUICK_LINKS = [
  { label: "Cep Telefonu", href: "/?kategori=cep-telefonu" },
  { label: "Bilgisayar", href: "/?kategori=bilgisayar" },
  { label: "Ev Elektroniği", href: "/?kategori=ev-elektronigi" },
  { label: "Giyim & Aksesuar", href: "/?kategori=giyim-aksesuar" },
  { label: "Spor", href: "/?kategori=spor" },
  { label: "Oyun & Hobi", href: "/?kategori=oyun-hobi" },
  { label: "0 - 1.000 ₺", href: "/?maxPrice=1000" },
];

function SearchForm({ className = "" }: { className?: string }) {
  return (
    <form method="get" action="/" className={className}>
      <div className="flex w-full items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            placeholder="Ürün veya ilan başlığı ara..."
            className="w-full rounded-l-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-r-lg border border-l-0 border-brand bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-900"
        >
          Ara
        </button>
      </div>
    </form>
  );
}

export async function Navbar() {
  const session = await getSession();
  const quickLinks = isVasitaEmlakActive() ? VASITA_QUICK_LINKS : IKINCI_EL_QUICK_LINKS;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Logo size="md" />

        <SearchForm className="hidden flex-1 md:block" />

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
              <UserMenu name={session.name} logoutAction={logoutAction} />
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

        <div className="ml-auto md:hidden">
          <NavbarMobileMenu session={session} logoutAction={logoutAction} />
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-2.5 md:hidden">
        <SearchForm />
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-2 scrollbar-hide sm:px-6 lg:px-8">
          <span className="hidden shrink-0 text-xs font-semibold text-slate-400 sm:inline">
            Popüler:
          </span>
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-accent hover:bg-accent-light hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
