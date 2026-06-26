"use client";

import { useState } from "react";
import locationData from "../../data/il-ilce.json";
import { labelClass, selectClass } from "./form-ui";

const LOCATIONS = locationData as { il: string; ilceler: string[] }[];

const darkSelectClass =
  "w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

type LocationSelectProps = {
  defaultIl?: string;
  defaultIlce?: string;
  ilName?: string;
  ilceName?: string;
  ilLabel?: string;
  ilceLabel?: string;
  required?: boolean;
  showIlce?: boolean;
  variant?: "light" | "dark";
  hideLabel?: boolean;
  onIlChange?: (il: string) => void;
  onIlceChange?: (ilce: string) => void;
};

export function LocationSelect({
  defaultIl = "",
  defaultIlce = "",
  ilName = "il",
  ilceName = "ilce",
  ilLabel = "İl",
  ilceLabel = "İlçe",
  required = false,
  showIlce = true,
  variant = "light",
  hideLabel = false,
  onIlChange,
  onIlceChange,
}: LocationSelectProps) {
  const [il, setIl] = useState(defaultIl);
  const ilceler = LOCATIONS.find((p) => p.il === il)?.ilceler ?? [];

  const selectCls = variant === "dark" ? darkSelectClass : selectClass;
  const labelCls = hideLabel ? "sr-only" : labelClass;

  return (
    <>
      <div>
        <label htmlFor={ilName} className={labelCls}>
          {ilLabel}
        </label>
        <select
          id={ilName}
          name={ilName}
          value={il}
          onChange={(e) => {
            const value = e.target.value;
            setIl(value);
            onIlChange?.(value);
            onIlceChange?.("");
          }}
          className={selectCls}
          required={required}
        >
          <option value="" className="text-slate-900">
            {required ? "İl seçin" : "Tüm İller"}
          </option>
          {LOCATIONS.map((p) => (
            <option key={p.il} value={p.il} className="text-slate-900">
              {p.il}
            </option>
          ))}
        </select>
      </div>

      {showIlce && (
        <div>
          <label htmlFor={ilceName} className={labelCls}>
            {ilceLabel}
          </label>
          <select
            key={il}
            id={ilceName}
            name={ilceName}
            defaultValue={defaultIlce}
            onChange={(e) => onIlceChange?.(e.target.value)}
            disabled={!il}
            className={selectCls}
            required={required}
          >
            <option value="" className="text-slate-900">
              {required ? "İlçe seçin" : "Tüm İlçeler"}
            </option>
            {ilceler.map((d) => (
              <option key={d} value={d} className="text-slate-900">
                {d}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}
