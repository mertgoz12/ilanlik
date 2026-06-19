"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ACCOUNT_NAV_ITEMS } from "@/lib/account-nav";
import { UserIcon } from "@/components/icons";
import { useUnreadMessages } from "@/components/unread-messages-context";

export function AccountNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const { count: unreadCount } = useUnreadMessages();

  return (
    <aside className="lg:w-64 lg:shrink-0">
      <div className="mb-4 hidden items-center gap-3 lg:flex">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-accent shadow-soft">
          <UserIcon className="h-5.5 w-5.5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Hesabım</p>
          <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto rounded-xl bg-white p-1.5 shadow-soft lg:flex-col lg:gap-1 lg:overflow-visible">
        {ACCOUNT_NAV_ITEMS.map((item) => {
          const active = item.href === "/hesabim" ? pathname === "/hesabim" : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-2.5 py-2.5 text-sm font-medium transition-all ${
                active ? "bg-accent-light text-brand" : "text-slate-600 hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  active ? "bg-brand text-accent" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-500"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              {item.label}
              {item.href === "/hesabim/mesajlar" && unreadCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
