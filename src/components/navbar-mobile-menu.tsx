"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, Plus, ShieldCheck, User, X } from "lucide-react";
import type { SessionUser } from "@/lib/session";
import { ACCOUNT_NAV_ITEMS } from "@/lib/account-nav";
import { useUnreadMessages } from "@/components/unread-messages-context";

type NavbarMobileMenuProps = {
  session: SessionUser | null;
  logoutAction: () => Promise<void>;
};

export function NavbarMobileMenu({ session, logoutAction }: NavbarMobileMenuProps) {
  const [open, setOpen] = useState(false);
  const { count: unreadCount } = useUnreadMessages();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menü"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/50 animate-overlay-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-80 max-w-[88vw] flex-col gap-2 overflow-y-auto bg-white p-4 shadow-soft-lg animate-fade-in-up">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-base font-bold text-brand">Menü</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Kapat"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <Link
              href="/ilan-ver"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3.5 text-base font-bold text-brand shadow-sm transition-colors hover:bg-accent-dark"
            >
              <Plus className="h-5 w-5" />
              Ücretsiz İlan Ver
            </Link>

            <div className="mt-2 flex flex-col gap-1 border-t border-slate-100 pt-2">
              {session ? (
                <>
                  {session.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-slate-600 transition-colors active:bg-slate-100 hover:bg-slate-50"
                    >
                      <ShieldCheck className="h-5 w-5 text-slate-400" />
                      Yönetim Paneli
                    </Link>
                  )}
                  <span className="flex items-center gap-3 px-3 py-3 text-base font-semibold text-slate-700">
                    <User className="h-5 w-5 text-slate-400" />
                    {session.name}
                  </span>
                  {ACCOUNT_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-slate-600 transition-colors active:bg-slate-100 hover:bg-slate-50"
                      >
                        <Icon className="h-5 w-5 text-slate-400" />
                        {item.label}
                        {item.href === "/hesabim/mesajlar" && unreadCount > 0 && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-base font-medium text-slate-600 transition-colors active:bg-slate-100 hover:bg-slate-50"
                    >
                      <LogOut className="h-5 w-5" />
                      Çıkış Yap
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/giris"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium text-slate-600 transition-colors active:bg-slate-100 hover:bg-slate-50"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/kayit"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium text-slate-600 transition-colors active:bg-slate-100 hover:bg-slate-50"
                  >
                    Üye Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
