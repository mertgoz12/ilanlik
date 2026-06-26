"use client";

import { useMemo, useState } from "react";
import { CheckIcon, ChevronRightIcon } from "@/components/icons";
import {
  CATEGORY_THEME_CLASSES,
  getCategoryVisual,
} from "@/lib/category-visuals";

export type CategoryOption = {
  id: string;
  slug: string;
  name: string;
  groupName: string;
  /** Kökten bu yaprağa kadar tüm ad'lar (bkz. categories.ts breadcrumb). */
  breadcrumb: string[];
  /** breadcrumb ile aynı sırada her seviyenin slug'ı - ara düğüm ikonları. */
  breadcrumbSlugs: string[];
  isVasita: boolean;
};

type LeafInfo = { id: string; slug: string; isVasita: boolean };

// Düz yaprak listesinden (breadcrumb'lar üzerinden) gezinilebilir kategori
// ağacını yeniden kurar. Her düğüm kendi slug'ını taşır (ikon/tema için);
// yalnızca yapraklar gerçek bir DB id'si taşır. Vasıta/Emlak gibi "çok
// yakında" kategoriler zaten selectableCategories'te elendiği için burada da
// hiç görünmez.
type TreeNode = {
  name: string;
  slug: string;
  children: TreeNode[];
  leaf: LeafInfo | null;
};

function buildTree(categories: CategoryOption[]): TreeNode {
  const root: TreeNode = { name: "", slug: "", children: [], leaf: null };
  for (const c of categories) {
    let node = root;
    for (let i = 0; i < c.breadcrumb.length; i++) {
      const name = c.breadcrumb[i];
      const slug = c.breadcrumbSlugs[i];
      let child = node.children.find((n) => n.slug === slug);
      if (!child) {
        child = { name, slug, children: [], leaf: null };
        node.children.push(child);
      }
      if (i === c.breadcrumb.length - 1) {
        child.leaf = { id: c.id, slug: c.slug, isVasita: c.isVasita };
      }
      node = child;
    }
  }
  return root;
}

function nodeAtPath(root: TreeNode, path: string[]): TreeNode {
  let node = root;
  for (const slug of path) {
    const next = node.children.find((n) => n.slug === slug);
    if (!next) break;
    node = next;
  }
  return node;
}

export function CategoryIconBadge({
  slug,
  size = "md",
}: {
  slug: string;
  size?: "md" | "lg";
}) {
  const { icon: Icon, theme } = getCategoryVisual(slug);
  const t = CATEGORY_THEME_CLASSES[theme];
  const box = size === "lg" ? "h-12 w-12 rounded-xl" : "h-11 w-11 rounded-xl";
  const ic = size === "lg" ? "h-6 w-6" : "h-5.5 w-5.5";
  return (
    <span
      className={`flex shrink-0 items-center justify-center text-white shadow-soft ${box} ${t.badge}`}
    >
      <Icon className={ic} />
    </span>
  );
}

export function CategoryPicker({
  categories,
  onSelect,
}: {
  categories: CategoryOption[];
  onSelect: (category: CategoryOption) => void;
}) {
  const tree = useMemo(() => buildTree(categories), [categories]);
  // path = seçili ara düğümlerin slug zinciri (köke göre).
  const [path, setPath] = useState<string[]>([]);

  const current = nodeAtPath(tree, path);

  function handlePick(node: TreeNode) {
    // Alt kategorisi olan düğümde bir seviye in; yaprakta ise seçimi yap.
    if (node.children.length > 0) {
      setPath((p) => [...p, node.slug]);
    } else if (node.leaf) {
      const cat = categories.find((c) => c.id === node.leaf!.id);
      if (cat) onSelect(cat);
    }
  }

  // Üst breadcrumb için ara düğüm adlarını path slug'larından çöz.
  const trail = useMemo(() => {
    const items: { name: string; slug: string }[] = [];
    let node = tree;
    for (const slug of path) {
      const next = node.children.find((n) => n.slug === slug);
      if (!next) break;
      items.push({ name: next.name, slug: next.slug });
      node = next;
    }
    return items;
  }, [tree, path]);

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-soft">
      <div className="border-b border-slate-100 bg-gradient-to-br from-brand-50/60 to-white px-5 py-4 sm:px-6">
        <h2 className="font-display text-base font-bold text-brand sm:text-lg">
          Hangi kategoride ilan veriyorsunuz?
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
          Ürününüze en uygun kategoriyi seçin, doğru alıcıya ulaşın.
        </p>

        <nav className="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
          <button
            type="button"
            onClick={() => setPath([])}
            disabled={path.length === 0}
            className={`rounded-full px-3 py-1 font-semibold transition-colors ${
              path.length === 0
                ? "bg-brand text-white"
                : "bg-brand-50 text-brand hover:bg-brand-100"
            }`}
          >
            Tüm Kategoriler
          </button>
          {trail.map((item, i) => {
            const isLast = i === trail.length - 1;
            return (
              <span key={item.slug} className="flex items-center gap-1.5">
                <ChevronRightIcon className="h-3.5 w-3.5 text-slate-300" />
                <button
                  type="button"
                  onClick={() => setPath(path.slice(0, i + 1))}
                  disabled={isLast}
                  className={`rounded-full px-3 py-1 font-semibold transition-colors ${
                    isLast
                      ? "bg-accent-light text-accent-dark"
                      : "bg-brand-50 text-brand hover:bg-brand-100"
                  }`}
                >
                  {item.name}
                </button>
              </span>
            );
          })}
        </nav>
      </div>

      <div
        key={path.join("/")}
        className="animate-fade-in-up grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6"
      >
        {current.children.map((node) => {
          const isLeaf = node.children.length === 0;
          return (
            <button
              key={node.slug}
              type="button"
              onClick={() => handlePick(node)}
              className="group relative flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-soft-lg focus:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
            >
              <span className="transition-transform duration-200 group-hover:scale-110">
                <CategoryIconBadge slug={node.slug} size="lg" />
              </span>
              <span className="text-[13px] font-semibold leading-tight text-foreground sm:text-sm">
                {node.name}
              </span>
              {isLeaf ? (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-accent-dark opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  Seç
                  <ChevronRightIcon className="h-3 w-3" />
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-400">
                  {node.children.length} alt kategori
                  <ChevronRightIcon className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function SelectedCategoryCard({
  selected,
  onChange,
}: {
  selected: CategoryOption;
  onChange: () => void;
}) {
  const leafSlug =
    selected.breadcrumbSlugs[selected.breadcrumbSlugs.length - 1] ?? selected.slug;
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-accent bg-accent-light/50 p-4 sm:p-5">
      <div className="flex min-w-0 items-center gap-3">
        <CategoryIconBadge slug={leafSlug} size="lg" />
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-accent-dark">
            <CheckIcon className="h-3.5 w-3.5" />
            Seçilen Kategori
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm">
            {selected.breadcrumb.map((name, i) => {
              const isLast = i === selected.breadcrumb.length - 1;
              return (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRightIcon className="h-3 w-3 text-slate-400" />}
                  <span className={isLast ? "font-bold text-brand" : "text-slate-500"}>
                    {name}
                  </span>
                </span>
              );
            })}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        Değiştir
      </button>
    </div>
  );
}
