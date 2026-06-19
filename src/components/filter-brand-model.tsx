"use client";

import { useState } from "react";
import { BRAND_NAMES, BRANDS } from "@/lib/car-data";
import { labelClass, selectClass } from "./form-ui";

export function FilterBrandModel({
  defaultBrand,
  defaultModel,
}: {
  defaultBrand?: string;
  defaultModel?: string;
}) {
  const [brand, setBrand] = useState(defaultBrand ?? "");
  const models = brand ? (BRANDS[brand] ?? []) : [];

  return (
    <>
      <div>
        <label htmlFor="brand" className={labelClass}>
          Marka
        </label>
        <select
          id="brand"
          name="brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className={selectClass}
        >
          <option value="">Tüm Markalar</option>
          {BRAND_NAMES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="model" className={labelClass}>
          Model
        </label>
        <select
          key={brand}
          id="model"
          name="model"
          disabled={!brand}
          defaultValue={defaultModel}
          className={selectClass}
        >
          <option value="">Tüm Modeller</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
