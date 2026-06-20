"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import {
  getPopularSearchesAction,
  getSearchSuggestionsAction,
  type CategorySuggestion,
  type ListingSuggestion,
  type SearchSuggestions,
} from "@/lib/actions/search-suggestions";
import { addRecentSearch, getRecentSearches, removeRecentSearch } from "@/lib/search-recent";
import { formatPrice } from "@/lib/format";
import { ClockIcon, CloseIcon, ImageIcon, SpinnerIcon, TagIcon } from "./icons";

// Sunucudaki MIN_QUERY_LENGTH ile aynı eşik (bkz. search-suggestions.ts) -
// "use server" dosyaları sadece async fonksiyon export edebildiği için bu
// sabit ortak bir dosyadan paylaşılamıyor, burada bilinçli olarak tekrarlanır.
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

type FlatOption =
  | { kind: "recent"; term: string }
  | { kind: "popularCategory"; category: CategorySuggestion }
  | { kind: "category"; category: CategorySuggestion }
  | { kind: "listing"; listing: ListingSuggestion };

type Section = { title: string; options: FlatOption[] };

const EMPTY_RESULTS: SearchSuggestions = { categories: [], listings: [] };

function turkishLower(value: string): string {
  return value.toLocaleLowerCase("tr-TR");
}

function optionKey(option: FlatOption): string {
  switch (option.kind) {
    case "recent":
      return `recent:${option.term}`;
    case "popularCategory":
      return `popular:${option.category.slug}`;
    case "category":
      return `category:${option.category.slug}`;
    case "listing":
      return `listing:${option.listing.listingNo}`;
  }
}

type SearchBarProps = {
  className?: string;
  /** Mobil arama satırı açılır açılmaz inputa odaklanmak için (bkz. navbar.tsx). */
  autoFocus?: boolean;
};

export function SearchBar({ className = "", autoFocus = false }: SearchBarProps) {
  const router = useRouter();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularCategories, setPopularCategories] = useState<CategorySuggestion[]>([]);
  const [results, setResults] = useState<SearchSuggestions>(EMPTY_RESULTS);
  const [isFetching, setIsFetching] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const popularFetchedRef = useRef(false);
  // Klavyede yazılan en son değeri tutar - debounce sırasında iptal edilen
  // eski isteklerin yanıtı geldiğinde (sorgu zaten değişmiş/kısalmışsa) bu
  // referans sayesinde bayat sonuçlar ekrana yansımaz.
  const latestQueryRef = useRef("");

  useEffect(() => {
    // localStorage sadece tarayıcıda mevcut olduğundan son aramalar ancak
    // mount sonrası okunabilir - bu, option-panel.tsx'teki saat hesaplama
    // deseniyle aynı, bilinçli bir istisnadır.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsFetching(true);
      getSearchSuggestionsAction(trimmed)
        .then((data) => {
          if (latestQueryRef.current.trim() === trimmed) setResults(data);
        })
        .catch(() => {
          if (latestQueryRef.current.trim() === trimmed) setResults(EMPTY_RESULTS);
        })
        .finally(() => {
          if (latestQueryRef.current.trim() === trimmed) setIsFetching(false);
        });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const trimmedQuery = query.trim();
  const showingEmptyState = trimmedQuery.length === 0;
  const hasEnoughChars = trimmedQuery.length >= MIN_QUERY_LENGTH;

  const sections: Section[] = useMemo(() => {
    if (showingEmptyState) {
      const list: Section[] = [];
      if (recentSearches.length > 0) {
        list.push({
          title: "Son Aramalarınız",
          options: recentSearches.map((term) => ({ kind: "recent", term }) as const),
        });
      }
      if (popularCategories.length > 0) {
        list.push({
          title: "Popüler Kategoriler",
          options: popularCategories.map((category) => ({ kind: "popularCategory", category }) as const),
        });
      }
      return list;
    }

    const list: Section[] = [];
    const matchingRecent = recentSearches.filter((term) => turkishLower(term).includes(turkishLower(trimmedQuery)));
    if (matchingRecent.length > 0) {
      list.push({
        title: "Geçmiş Aramalarınızda",
        options: matchingRecent.map((term) => ({ kind: "recent", term }) as const),
      });
    }
    if (hasEnoughChars && results.categories.length > 0) {
      list.push({
        title: "Kategoride Ara",
        options: results.categories.map((category) => ({ kind: "category", category }) as const),
      });
    }
    if (hasEnoughChars && results.listings.length > 0) {
      list.push({
        title: "İlan Önerileri",
        options: results.listings.map((listing) => ({ kind: "listing", listing }) as const),
      });
    }
    return list;
  }, [showingEmptyState, hasEnoughChars, recentSearches, popularCategories, results, trimmedQuery]);

  const flatOptions = useMemo(() => sections.flatMap((section) => section.options), [sections]);

  const noResults = !showingEmptyState && hasEnoughChars && !isFetching && sections.length === 0;
  const showLoading = !showingEmptyState && hasEnoughChars && isFetching;
  const shouldRenderPanel = isOpen && (sections.length > 0 || showLoading || noResults);

  function handleFocus() {
    setIsOpen(true);
    if (!popularFetchedRef.current) {
      popularFetchedRef.current = true;
      getPopularSearchesAction()
        .then((data) => setPopularCategories(data.categories))
        .catch(() => {});
    }
  }

  function closeAndNavigate(href: string) {
    setIsOpen(false);
    setActiveIndex(-1);
    router.push(href);
  }

  function activateOption(option: FlatOption) {
    switch (option.kind) {
      case "recent":
        setRecentSearches(addRecentSearch(option.term));
        closeAndNavigate(`/?q=${encodeURIComponent(option.term)}`);
        break;
      case "popularCategory":
        closeAndNavigate(`/?kategori=${option.category.slug}`);
        break;
      case "category":
        setRecentSearches(addRecentSearch(trimmedQuery));
        closeAndNavigate(`/?kategori=${option.category.slug}&q=${encodeURIComponent(trimmedQuery)}`);
        break;
      case "listing":
        setRecentSearches(addRecentSearch(trimmedQuery));
        closeAndNavigate(`/ilan/${option.listing.listingNo}`);
        break;
    }
  }

  function submitRawQuery() {
    if (!trimmedQuery) return;
    setRecentSearches(addRecentSearch(trimmedQuery));
    closeAndNavigate(`/?q=${encodeURIComponent(trimmedQuery)}`);
  }

  function handleRemoveRecent(event: React.MouseEvent, term: string) {
    event.preventDefault();
    event.stopPropagation();
    setRecentSearches(removeRecentSearch(term));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      if (!isOpen) setIsOpen(true);
      if (flatOptions.length === 0) return;
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % flatOptions.length);
    } else if (event.key === "ArrowUp") {
      if (flatOptions.length === 0) return;
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + flatOptions.length) % flatOptions.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const active = activeIndex >= 0 ? flatOptions[activeIndex] : undefined;
      if (active) {
        activateOption(active);
      } else {
        submitRawQuery();
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  let renderIndex = -1;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitRawQuery();
        }}
      >
        <div className="flex w-full items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              name="q"
              autoComplete="off"
              autoFocus={autoFocus}
              value={query}
              onChange={(event) => {
                const value = event.target.value;
                latestQueryRef.current = value;
                setQuery(value);
                setActiveIndex(-1);
                setIsOpen(true);
                if (value.trim().length < MIN_QUERY_LENGTH) setIsFetching(false);
              }}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              placeholder="Ürün veya ilan başlığı ara..."
              role="combobox"
              aria-expanded={shouldRenderPanel}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
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

      {shouldRenderPanel && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-slate-100 bg-white py-1.5 shadow-soft-lg animate-fade-in-up"
        >
          {showLoading && sections.length === 0 && (
            <div className="flex items-center gap-2 px-3.5 py-3 text-sm text-slate-400">
              <SpinnerIcon className="h-4 w-4 animate-spin" />
              Aranıyor...
            </div>
          )}

          {noResults && (
            <p className="px-3.5 py-3 text-sm text-slate-500">
              &quot;{trimmedQuery}&quot; için sonuç bulunamadı.
            </p>
          )}

          {sections.map((section) => (
            <div key={section.title} className="py-1">
              <div className="px-3.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {section.title}
              </div>
              {section.options.map((option) => {
                renderIndex += 1;
                const index = renderIndex;
                const isActive = index === activeIndex;
                return (
                  <OptionRow
                    key={optionKey(option)}
                    option={option}
                    optionId={`${listboxId}-${index}`}
                    isActive={isActive}
                    onHover={() => setActiveIndex(index)}
                    onSelect={() => activateOption(option)}
                    onRemoveRecent={handleRemoveRecent}
                  />
                );
              })}
            </div>
          ))}

          {showLoading && sections.length > 0 && (
            <div className="flex items-center gap-2 border-t border-slate-100 px-3.5 py-2 text-xs text-slate-400">
              <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />
              Güncelleniyor...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OptionRow({
  option,
  optionId,
  isActive,
  onHover,
  onSelect,
  onRemoveRecent,
}: {
  option: FlatOption;
  optionId: string;
  isActive: boolean;
  onHover: () => void;
  onSelect: () => void;
  onRemoveRecent: (event: React.MouseEvent, term: string) => void;
}) {
  const rowClass = `flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors ${
    isActive ? "bg-accent-light text-brand" : "text-slate-700 hover:bg-slate-50"
  }`;

  if (option.kind === "recent") {
    return (
      <button
        type="button"
        id={optionId}
        role="option"
        aria-selected={isActive}
        onMouseEnter={onHover}
        onClick={onSelect}
        className={`${rowClass} justify-between`}
      >
        <span className="flex items-center gap-2.5 truncate">
          <ClockIcon className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate">{option.term}</span>
        </span>
        <span
          role="button"
          aria-label="Bu aramayı kaldır"
          onClick={(event) => onRemoveRecent(event, option.term)}
          className="shrink-0 rounded-full p-1 text-slate-300 hover:bg-slate-200 hover:text-slate-600"
        >
          <CloseIcon className="h-3 w-3" />
        </span>
      </button>
    );
  }

  if (option.kind === "category" || option.kind === "popularCategory") {
    return (
      <button
        type="button"
        id={optionId}
        role="option"
        aria-selected={isActive}
        onMouseEnter={onHover}
        onClick={onSelect}
        className={rowClass}
      >
        <TagIcon className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="truncate">{option.category.name}</span>
        {option.category.groupName !== option.category.name && (
          <span className="shrink-0 truncate text-xs text-slate-400">{option.category.groupName}</span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      id={optionId}
      role="option"
      aria-selected={isActive}
      onMouseEnter={onHover}
      onClick={onSelect}
      className={rowClass}
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-slate-100">
        {option.listing.imageUrl ? (
          <Image src={option.listing.imageUrl} alt={option.listing.title} fill sizes="40px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <ImageIcon className="h-4 w-4" />
          </div>
        )}
      </div>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{option.listing.title}</span>
        <span className="block text-xs font-semibold text-brand">{formatPrice(option.listing.price)}</span>
      </span>
    </button>
  );
}
