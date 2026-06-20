"use client";

import { Search } from "lucide-react";
import { useMobileSearch } from "./mobile-search-context";
import { SearchBar } from "./search-bar";
import { CloseIcon } from "./icons";

// Navbar mobilde sade kalsın (logo + arama ikonu + hamburger) diye arama
// kutusu varsayılan olarak gizli - bu buton açar, aşağıdaki satır görünür
// olur. İkisi de aynı paylaşılan context'i (MobileSearchProvider) kullanır,
// böylece alt navigasyon çubuğundaki "Ara" sekmesi de aynı satırı açabilir.
export function MobileSearchToggleButton() {
  const { toggle } = useMobileSearch();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Ara"
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
    >
      <Search className="h-5 w-5" />
    </button>
  );
}

export function MobileSearchRow() {
  const { isOpen, close } = useMobileSearch();
  if (!isOpen) return null;

  return (
    <div className="border-t border-slate-100 px-4 py-2.5 md:hidden animate-fade-in-up">
      <div className="flex items-center gap-2">
        <SearchBar className="flex-1" autoFocus />
        <button
          type="button"
          onClick={close}
          aria-label="Aramayı kapat"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
