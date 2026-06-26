"use client";

import { useMemo, useState } from "react";
import { ListingWizard } from "./wizard/listing-wizard";
import { SimpleListingForm } from "./simple-listing-form";
import { FormSection } from "@/components/form-ui";
import { CheckIcon, ChevronRightIcon } from "@/components/icons";
import type { VehicleCatalogBrand } from "@/lib/vehicle-catalog";

export type CategoryOption = {
  id: string;
  slug: string;
  name: string;
  groupName: string;
  /** Kökten bu yaprağa kadar tüm ad'lar - kademeli seçicide gezinme ve
   * onay özeti bunun üzerinden çizilir (bkz. categories.ts breadcrumb). */
  breadcrumb: string[];
  isVasita: boolean;
};

type LeafInfo = { id: string; slug: string; isVasita: boolean };

// Düz yaprak listesinden (breadcrumb'lar üzerinden) gezinilebilir kategori
// ağacını yeniden kurar. Ara düğümler yalnızca ad ile temsil edilir (gezinme
// için yeterli); yalnızca yapraklar gerçek bir DB id'si taşır. Vasıta/Emlak
// gibi "çok yakında" kategoriler zaten selectableCategories'te elendiği için
// burada da hiç görünmez.
type TreeNode = {
  name: string;
  children: TreeNode[];
  leaf: LeafInfo | null;
};

function buildTree(categories: CategoryOption[]): TreeNode {
  const root: TreeNode = { name: "", children: [], leaf: null };
  for (const c of categories) {
    let node = root;
    for (let i = 0; i < c.breadcrumb.length; i++) {
      const name = c.breadcrumb[i];
      let child = node.children.find((n) => n.name === name);
      if (!child) {
        child = { name, children: [], leaf: null };
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
  for (const name of path) {
    const next = node.children.find((n) => n.name === name);
    if (!next) break;
    node = next;
  }
  return node;
}

export function CategoryPicker({
  categories,
  catalog,
  defaultFromWho,
}: {
  categories: CategoryOption[];
  catalog: VehicleCatalogBrand[];
  defaultFromWho?: string;
}) {
  const tree = useMemo(() => buildTree(categories), [categories]);
  const [path, setPath] = useState<string[]>([]);
  const [selected, setSelected] = useState<CategoryOption | null>(null);

  const current = nodeAtPath(tree, path);

  function handlePick(node: TreeNode) {
    // Alt kategorisi olan düğümde bir seviye in; yaprakta ise seçimi yap.
    if (node.children.length > 0) {
      setPath((p) => [...p, node.name]);
    } else if (node.leaf) {
      setSelected(categories.find((c) => c.id === node.leaf!.id) ?? null);
    }
  }

  return (
    <div className="space-y-6">
      <FormSection
        title="Kategori"
        description="İlanınızı en doğru kategoriye yerleştirin. Adım adım ilerleyerek alt kategoriyi seçin."
      >
        {selected ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <span className="flex flex-wrap items-center gap-1.5 text-sm text-slate-700">
              <CheckIcon className="h-4 w-4 shrink-0 text-emerald-600" />
              {selected.breadcrumb.map((name, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRightIcon className="h-3.5 w-3.5 text-slate-400" />}
                  <span
                    className={
                      i === selected.breadcrumb.length - 1
                        ? "font-semibold text-emerald-800"
                        : "text-slate-500"
                    }
                  >
                    {name}
                  </span>
                </span>
              ))}
            </span>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              Değiştir
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {path.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                <button
                  type="button"
                  onClick={() => setPath([])}
                  className="font-medium text-emerald-700 transition-colors hover:underline"
                >
                  Tüm kategoriler
                </button>
                {path.map((name, i) => {
                  const isLast = i === path.length - 1;
                  return (
                    <span key={i} className="flex items-center gap-1.5">
                      <ChevronRightIcon className="h-3.5 w-3.5 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setPath(path.slice(0, i + 1))}
                        disabled={isLast}
                        className={
                          isLast
                            ? "font-semibold text-slate-700"
                            : "font-medium text-emerald-700 transition-colors hover:underline"
                        }
                      >
                        {name}
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {current.children.map((node) => {
                const isLeaf = node.children.length === 0;
                return (
                  <button
                    key={node.name}
                    type="button"
                    onClick={() => handlePick(node)}
                    className="group flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-left text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-emerald-400 hover:bg-emerald-50"
                  >
                    <span>{node.name}</span>
                    {isLeaf ? (
                      <span className="shrink-0 text-xs font-medium text-slate-400 transition-colors group-hover:text-emerald-600">
                        Seç
                      </span>
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-emerald-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </FormSection>

      {selected ? (
        selected.isVasita ? (
          <ListingWizard
            categoryId={selected.id}
            categoryName={selected.name}
            catalog={catalog}
            defaultFromWho={defaultFromWho}
          />
        ) : (
          <SimpleListingForm categoryId={selected.id} />
        )
      ) : (
        <p className="rounded-lg bg-white p-6 text-sm text-slate-500 shadow-soft">
          Devam etmek için yukarıdan bir kategori seçin.
        </p>
      )}
    </div>
  );
}
