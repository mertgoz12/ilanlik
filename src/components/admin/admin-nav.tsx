"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "@/lib/admin-nav";
import { ShieldCheckIcon } from "@/components/icons";
import { ACCENT_ICON_STYLES } from "./accent";

export function AdminNav({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="lg:w-64 lg:shrink-0">
      <div className="mb-4 hidden items-center gap-3 lg:flex">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-soft">
          <ShieldCheckIcon className="h-5.5 w-5.5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Yönetim Paneli</p>
          <p className="truncate text-sm font-semibold text-foreground">{adminName}</p>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto rounded-xl bg-white p-1.5 shadow-soft lg:flex-col lg:gap-1 lg:overflow-visible">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-2.5 py-2.5 text-sm font-medium transition-all ${
                active ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  active ? ACCENT_ICON_STYLES[item.accent] : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-500"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
