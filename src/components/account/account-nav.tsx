"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ACCOUNT_NAV_ITEMS } from "@/lib/account-nav";
import { Avatar } from "@/components/avatar";
import { useUnreadMessages } from "@/components/unread-messages-context";

export function AccountNav({ userName, avatarUrl }: { userName: string; avatarUrl: string | null }) {
  const pathname = usePathname();
  const { count: unreadCount } = useUnreadMessages();

  return (
    <aside className="lg:w-64 lg:shrink-0">
      <div className="mb-3 flex items-center gap-3 rounded-xl bg-white p-3 shadow-soft lg:mb-4">
        <Avatar name={userName} src={avatarUrl} size="md" className="shadow-soft lg:hidden" />
        <Avatar name={userName} src={avatarUrl} size="lg" className="hidden shadow-soft lg:flex" />
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-accent-dark">Hesabım</p>
          <p className="truncate text-sm font-bold text-foreground">{userName}</p>
        </div>
      </div>

      <nav className="grid grid-cols-3 gap-1.5 rounded-xl bg-white p-1.5 shadow-soft lg:flex lg:flex-col lg:gap-1">
        {ACCOUNT_NAV_ITEMS.map((item) => {
          const active = item.href === "/hesabim" ? pathname === "/hesabim" : pathname?.startsWith(item.href);
          const Icon = item.icon;
          const badge = item.href === "/hesabim/mesajlar" && unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : null;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex flex-col items-center gap-1.5 rounded-lg px-1.5 py-2.5 text-center text-[11px] font-semibold transition-all lg:flex-row lg:gap-3 lg:px-2.5 lg:py-2.5 lg:text-left lg:text-sm lg:font-medium ${
                active ? "bg-accent-light text-brand" : "text-slate-500 hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <span
                className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors lg:h-8 lg:w-8 ${
                  active ? "bg-brand text-accent" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-500"
                }`}
              >
                <Icon className="h-4.5 w-4.5 lg:h-4 lg:w-4" />
                {badge && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </span>
              <span className="leading-tight lg:leading-normal">
                <span className="lg:hidden">{item.shortLabel}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
