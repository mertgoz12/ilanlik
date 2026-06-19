"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, User } from "lucide-react";
import { ACCOUNT_NAV_ITEMS } from "@/lib/account-nav";
import { useUnreadMessages } from "@/components/unread-messages-context";

type UserMenuProps = {
  name: string;
  logoutAction: () => Promise<void>;
};

export function UserMenu({ name, logoutAction }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { count: unreadCount } = useUnreadMessages();

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      >
        <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
          <User className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </span>
        <span className="hidden lg:inline">{name}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl border border-slate-100 bg-white py-1.5 shadow-soft-lg animate-fade-in-up">
          <div className="border-b border-slate-100 px-3.5 py-2.5">
            <p className="truncate text-sm font-semibold text-foreground">{name}</p>
            <Link href="/hesabim" onClick={() => setOpen(false)} className="text-xs text-brand hover:underline">
              Hesabıma git
            </Link>
          </div>
          <nav className="py-1">
            {ACCOUNT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-foreground"
                >
                  <Icon className="h-4 w-4 text-slate-400" />
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
          <form action={logoutAction} className="border-t border-slate-100 pt-1">
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4 text-slate-400" />
              Çıkış Yap
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
