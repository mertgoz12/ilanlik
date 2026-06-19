"use client";

import { useState } from "react";
import { CloseIcon, MenuIcon } from "./icons";

export function SidebarShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-soft"
        >
          <MenuIcon className="h-4 w-4" />
          Kategoriler
        </button>
      </div>

      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-20 rounded-lg bg-white p-4 shadow-soft">{children}</div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] overflow-y-auto bg-white p-4 shadow-soft-lg">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Kategoriler
              </span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Kapat">
                <CloseIcon className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
