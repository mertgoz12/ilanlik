"use client";

import { useMemo, useState } from "react";
import { ListingWizard } from "./wizard/listing-wizard";
import { SimpleListingForm } from "./simple-listing-form";
import { FormSection, labelClass, selectClass } from "@/components/form-ui";
import type { VehicleCatalogBrand } from "@/lib/vehicle-catalog";

export type CategoryOption = {
  id: string;
  slug: string;
  name: string;
  groupName: string;
  isVasita: boolean;
};

export function CategoryPicker({
  categories,
  catalog,
  defaultFromWho,
}: {
  categories: CategoryOption[];
  catalog: VehicleCatalogBrand[];
  defaultFromWho?: string;
}) {
  const [categoryId, setCategoryId] = useState("");

  const groups = useMemo(() => {
    const map = new Map<string, CategoryOption[]>();
    for (const c of categories) {
      const list = map.get(c.groupName) ?? [];
      list.push(c);
      map.set(c.groupName, list);
    }
    return Array.from(map.entries());
  }, [categories]);

  const selected = categories.find((c) => c.id === categoryId);

  return (
    <div className="space-y-6">
      <FormSection
        title="Kategori"
        description="İlanınızı yayınlamak istediğiniz kategoriyi seçin."
      >
        <div>
          <label htmlFor="category" className={labelClass}>
            Kategori
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={selectClass}
          >
            <option value="">Kategori seçin</option>
            {groups.map(([groupName, options]) => (
              <optgroup key={groupName} label={groupName}>
                {options.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
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
