"use client";

import { useState, type ReactNode } from "react";

export type ListingTab = {
  id: string;
  label: string;
  content: ReactNode;
};

export function ListingTabs({ tabs }: { tabs: ListingTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div className="rounded-lg bg-white shadow-soft">
      <div role="tablist" className="scrollbar-hide flex gap-1 overflow-x-auto border-b border-slate-100 px-2 sm:px-4">
        {tabs.map((tab) => {
          const isActive = tab.id === active?.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(tab.id)}
              className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-brand text-brand"
                  : "border-transparent text-slate-500 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="p-6">{active?.content}</div>
    </div>
  );
}
