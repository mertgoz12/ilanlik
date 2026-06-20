"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnreadMessages } from "./unread-messages-context";
import { useMobileSearch } from "./mobile-search-context";
import { HomeIcon, MessageIcon, PlusIcon, SearchIcon, UserIcon } from "./icons";

// Sahibinden/letgo tarzı mobil uygulama hissi için ekranın altında sabit bir
// sekme çubuğu - sadece mobilde görünür (md:hidden). İlan verme akışı kendi
// alt buton satırına sahip olduğundan (Geri/İleri/Yayınla) bu çubukla
// çakışmaması için /ilan-ver rotasında tamamen gizlenir.
const HIDDEN_ON_PREFIXES = ["/ilan-ver"];

export function BottomNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();
  const { count: unreadCount } = useUnreadMessages();
  const { open: openSearch } = useMobileSearch();

  if (HIDDEN_ON_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const isHome = pathname === "/";
  const isMessages = pathname.startsWith("/hesabim/mesajlar");
  const isAccount = pathname.startsWith("/hesabim") && !isMessages;

  const itemClass = (active: boolean) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium ${
      active ? "text-brand" : "text-slate-400"
    }`;

  function handleSearchTap() {
    openSearch();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Alt gezinme çubuğu"
    >
      <Link href="/" className={itemClass(isHome)}>
        <HomeIcon className="h-5.5 w-5.5" />
        Ana Sayfa
      </Link>

      <button type="button" onClick={handleSearchTap} className={itemClass(false)}>
        <SearchIcon className="h-5.5 w-5.5" />
        Ara
      </button>

      <Link href="/ilan-ver" className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium text-brand">
        <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-brand shadow-soft-lg ring-4 ring-white transition-transform active:scale-95">
          <PlusIcon className="h-6 w-6" />
        </span>
        <span className="-mt-1">İlan Ver</span>
      </Link>

      <Link
        href={isLoggedIn ? "/hesabim/mesajlar" : "/giris?callbackUrl=%2Fhesabim%2Fmesajlar"}
        className={`relative ${itemClass(isMessages)}`}
      >
        <span className="relative">
          <MessageIcon className="h-5.5 w-5.5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </span>
        Mesajlar
      </Link>

      <Link href={isLoggedIn ? "/hesabim" : "/giris"} className={itemClass(isAccount)}>
        <UserIcon className="h-5.5 w-5.5" />
        Hesabım
      </Link>
    </nav>
  );
}
