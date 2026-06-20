"use client";

import { useState, type CSSProperties } from "react";
import {
  ALL_DAMAGE_PART_KEYS,
  DAMAGE_PART_FILL_COLORS,
  DAMAGE_PART_LABELS,
  DAMAGE_PART_STATUS_STYLES,
  DAMAGE_PART_STATUSES,
  damagePartLabel,
  damagePartStatusLabel,
  type DamagePartStatus,
} from "@/lib/car-data";

type CarDiagramProps = {
  /** Current status per part key. Missing keys default to "orijinal". */
  values: Record<string, DamagePartStatus>;
  /** Omit for read-only mode (listing detail page). Provide for interactive mode (wizard). */
  onChange?: (partKey: string, status: DamagePartStatus) => void;
  className?: string;
};

const ACTIVE_PART_STYLE: CSSProperties = { stroke: "#10b981", strokeWidth: 3 };

export function CarDiagram({ values, onChange, className }: CarDiagramProps) {
  const [activePart, setActivePart] = useState<string | null>(null);

  const nonOriginalParts = ALL_DAMAGE_PART_KEYS.filter(
    (key) => (values[key] ?? "orijinal") !== "orijinal",
  );

  function partProps(key: string) {
    const status = values[key] ?? "orijinal";
    return {
      id: key,
      "data-part": key,
      className: "part",
      fill: DAMAGE_PART_FILL_COLORS[status],
      style: {
        cursor: onChange ? "pointer" : "default",
        ...(activePart === key ? ACTIVE_PART_STYLE : null),
      },
      onClick: onChange
        ? () => setActivePart((current) => (current === key ? null : key))
        : undefined,
    } as const;
  }

  return (
    <div className={className}>
      <svg
        viewBox="0 0 520 520"
        role="img"
        aria-label="İlanlio araç ekspertiz şeması"
        className="mx-auto block h-auto w-full max-w-md"
      >
        <defs>
          <linearGradient id="glassWhite" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f3f3f3" />
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.10" />
          </filter>
        </defs>
        <style>{`
          .veh-bg{ fill:#f8f3e4; }
          .part{ stroke:#f4f4f4; stroke-width:5; stroke-linejoin:round; stroke-linecap:round; transition:.2s ease; }
          .part:hover{ filter:brightness(.94); }
          .glass{ pointer-events:none; fill:url(#glassWhite); stroke:#d7d7d7; stroke-width:3; stroke-linejoin:round; stroke-linecap:round; }
          .wheel{ pointer-events:none; fill:#d4d4d4; stroke:#f4f4f4; stroke-width:5; }
          .small-detail{ pointer-events:none; fill:#d4d4d4; stroke:#f4f4f4; stroke-width:4; }
        `}</style>

        <rect className="veh-bg" x="0" y="0" width="520" height="520" rx="16" />

        <g filter="url(#softShadow)">
          {/* ON TAMPON */}
          <path
            {...partProps("on-tampon")}
            d="M178 29 Q260 18 342 29 Q349 31 351 39 L351 60 Q351 70 341 72 L179 72 Q169 70 169 60 L169 39 Q171 31 178 29 Z"
          >
            <title>{DAMAGE_PART_LABELS["on-tampon"]}</title>
          </path>
          <g pointerEvents="none">
            <rect className="glass" x="194" y="42" width="34" height="13" rx="7" />
            <rect className="glass" x="292" y="42" width="34" height="13" rx="7" />
            <rect className="small-detail" x="203" y="9" width="31" height="18" rx="6" />
            <rect className="small-detail" x="286" y="9" width="31" height="18" rx="6" />
          </g>

          {/* ORTA GOVDE */}
          <path
            {...partProps("kaput")}
            d="M184 102 Q260 80 336 102 Q349 107 353 121 Q357 154 352 198 Q307 188 260 188 Q213 188 168 198 Q163 154 167 121 Q171 107 184 102 Z"
          >
            <title>{DAMAGE_PART_LABELS["kaput"]}</title>
          </path>
          <path {...partProps("tavan")} d="M176 207 Q260 194 344 207 L344 335 Q260 348 176 335 Z">
            <title>{DAMAGE_PART_LABELS["tavan"]}</title>
          </path>
          <path
            {...partProps("bagaj")}
            d="M168 335 Q213 345 260 345 Q307 345 352 335 Q357 379 353 414 Q349 428 336 433 Q260 454 184 433 Q171 428 167 414 Q163 379 168 335 Z"
          >
            <title>{DAMAGE_PART_LABELS["bagaj"]}</title>
          </path>
          <g pointerEvents="none">
            <path className="glass" d="M171 198 Q213 188 260 188 Q307 188 349 198 L332 249 Q260 236 188 249 Z" />
            <path className="glass" d="M188 335 Q260 348 332 335 L349 390 Q307 402 260 402 Q213 402 171 390 Z" />
          </g>

          {/* SOL TARAF */}
          <path
            {...partProps("marspiyel-sol")}
            d="M49 75 L67 75 L67 447 L49 447 Q43 442 43 433 L43 89 Q43 80 49 75 Z"
          >
            <title>{DAMAGE_PART_LABELS["marspiyel-sol"]}</title>
          </path>
          <path
            {...partProps("camurluk-sol-on")}
            d="M67 75 L97 75 Q108 100 113 129 Q111 150 104 166 Q88 158 67 158 Z"
          >
            <title>{DAMAGE_PART_LABELS["camurluk-sol-on"]}</title>
          </path>
          <path {...partProps("kapi-sol-on")} d="M67 158 Q88 158 104 166 Q135 196 157 276 L67 255 Z">
            <title>{DAMAGE_PART_LABELS["kapi-sol-on"]}</title>
          </path>
          <path
            {...partProps("kapi-sol-arka")}
            d="M67 255 L157 276 Q150 337 113 369 Q90 363 67 348 Z"
          >
            <title>{DAMAGE_PART_LABELS["kapi-sol-arka"]}</title>
          </path>
          <path
            {...partProps("camurluk-sol-arka")}
            d="M67 348 Q90 363 113 369 Q108 414 97 447 L67 447 Z"
          >
            <title>{DAMAGE_PART_LABELS["camurluk-sol-arka"]}</title>
          </path>

          {/* SAG TARAF */}
          <path
            {...partProps("marspiyel-sag")}
            d="M471 75 L453 75 L453 447 L471 447 Q477 442 477 433 L477 89 Q477 80 471 75 Z"
          >
            <title>{DAMAGE_PART_LABELS["marspiyel-sag"]}</title>
          </path>
          <path
            {...partProps("camurluk-sag-on")}
            d="M453 75 L423 75 Q412 100 407 129 Q409 150 416 166 Q432 158 453 158 Z"
          >
            <title>{DAMAGE_PART_LABELS["camurluk-sag-on"]}</title>
          </path>
          <path {...partProps("kapi-sag-on")} d="M453 158 Q432 158 416 166 Q385 196 363 276 L453 255 Z">
            <title>{DAMAGE_PART_LABELS["kapi-sag-on"]}</title>
          </path>
          <path
            {...partProps("kapi-sag-arka")}
            d="M453 255 L363 276 Q370 337 407 369 Q430 363 453 348 Z"
          >
            <title>{DAMAGE_PART_LABELS["kapi-sag-arka"]}</title>
          </path>
          <path
            {...partProps("camurluk-sag-arka")}
            d="M453 348 Q430 363 407 369 Q412 414 423 447 L453 447 Z"
          >
            <title>{DAMAGE_PART_LABELS["camurluk-sag-arka"]}</title>
          </path>

          {/* TEKERLEKLER */}
          <g pointerEvents="none">
            <circle className="wheel" cx="45" cy="142" r="34" />
            <circle className="wheel" cx="45" cy="378" r="34" />
            <circle className="wheel" cx="475" cy="142" r="34" />
            <circle className="wheel" cx="475" cy="378" r="34" />
          </g>

          {/* ARKA TAMPON */}
          <path
            {...partProps("arka-tampon")}
            d="M178 448 Q260 459 342 448 Q349 446 351 456 L351 481 Q351 491 341 493 L179 493 Q169 491 169 481 L169 456 Q171 446 178 448 Z"
          >
            <title>{DAMAGE_PART_LABELS["arka-tampon"]}</title>
          </path>
          <g pointerEvents="none">
            <rect className="glass" x="194" y="464" width="34" height="13" rx="7" />
            <rect className="glass" x="292" y="464" width="34" height="13" rx="7" />
            <rect className="small-detail" x="203" y="493" width="31" height="18" rx="6" />
            <rect className="small-detail" x="286" y="493" width="31" height="18" rx="6" />
          </g>
        </g>
      </svg>

      {onChange && activePart && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 shadow-soft">
          <p className="mb-2 text-sm font-semibold text-foreground">{damagePartLabel(activePart)}</p>
          <div className="flex flex-wrap gap-2">
            {DAMAGE_PART_STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => {
                  onChange(activePart, s.value);
                  setActivePart(null);
                }}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${DAMAGE_PART_STATUS_STYLES[s.value]} ${
                  (values[activePart] ?? "orijinal") === s.value ? "ring-2 ring-emerald-500/40" : ""
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="mb-2 text-sm font-semibold text-foreground">Orijinal Olmayan Parçalar</p>
        {nonOriginalParts.length === 0 ? (
          <p className="text-sm text-slate-500">Tüm parçalar orijinal.</p>
        ) : (
          <ul className="space-y-1.5">
            {nonOriginalParts.map((key) => {
              const status = (values[key] ?? "orijinal") as DamagePartStatus;
              return (
                <li
                  key={key}
                  className={`flex items-center justify-between rounded-lg border px-3 py-1.5 text-sm ${DAMAGE_PART_STATUS_STYLES[status]}`}
                >
                  <span className="font-medium">{DAMAGE_PART_LABELS[key]}</span>
                  <span className="text-xs opacity-80">{damagePartStatusLabel(status)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
