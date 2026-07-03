"use client";

import { useState } from "react";
import {
  CategoryPicker,
  SelectedCategoryCard,
  type CategoryOption,
} from "./category-picker";
import { SimpleListingForm } from "./simple-listing-form";
import { ListingWizard } from "./wizard/listing-wizard";
import { StepProgress } from "./step-progress";
import type { VehicleCatalogBrand } from "@/lib/vehicle-catalog";

// /ilan-ver akışının istemci orkestratörü: üstteki 4 adımlı ilerleme
// göstergesini ve adım 1 (kategori seçimi) ile adım 2-4 (detay/foto/konum)
// arasındaki geçişi yönetir. Vasıta seçilirse kendi sihirbazına devreder.
export function ListingFlow({
  categories,
  catalog,
  defaultFromWho,
  initialCategorySlug = null,
}: {
  categories: CategoryOption[];
  catalog: VehicleCatalogBrand[];
  defaultFromWho?: string;
  // Kategori sayfasındaki placeholder karttan gelen ön-seçili kategori slug'ı.
  // Yalnızca seçilebilir bir yaprak kategoriye denk gelirse otomatik seçilir.
  initialCategorySlug?: string | null;
}) {
  const initialCategory = initialCategorySlug
    ? categories.find((c) => c.slug === initialCategorySlug) ?? null
    : null;
  const [selected, setSelected] = useState<CategoryOption | null>(initialCategory);
  const [step, setStep] = useState(initialCategory ? 2 : 1);

  // Vasıta: kendi 5 adımlı sihirbazı + ilerleme göstergesi var (şu an kapalı).
  if (selected?.isVasita) {
    return (
      <div className="space-y-5">
        <SelectedCategoryCard
          selected={selected}
          onChange={() => {
            setSelected(null);
            setStep(1);
          }}
        />
        <ListingWizard
          categoryId={selected.id}
          categoryName={selected.name}
          catalog={catalog}
          defaultFromWho={defaultFromWho}
        />
      </div>
    );
  }

  const showPicker = step === 1 || !selected;

  return (
    <div className="space-y-5">
      <StepProgress current={step} />

      {showPicker ? (
        <CategoryPicker
          categories={categories}
          onSelect={(cat) => {
            setSelected(cat);
            setStep(2);
          }}
        />
      ) : (
        <div className="space-y-5">
          <SelectedCategoryCard selected={selected} onChange={() => setStep(1)} />
          <SimpleListingForm
            categoryId={selected.id}
            categoryName={selected.name}
            step={step}
            onStep={setStep}
          />
        </div>
      )}
    </div>
  );
}
