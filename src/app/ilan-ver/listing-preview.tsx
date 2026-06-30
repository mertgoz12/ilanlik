"use client";

import { useState } from "react";
import { EyeIcon, ImageIcon, LocationIcon } from "@/components/icons";
import { formatPrice } from "@/lib/format";

export type PreviewSpec = { label: string; value: string };

export type ListingPreviewData = {
  title: string;
  price: number;
  description?: string | null;
  il: string;
  ilce: string;
  categoryName?: string | null;
  condition?: string | null;
  isNegotiable?: boolean;
  specs?: PreviewSpec[];
  equipmentGroups?: { title: string; items: string[] }[];
  imageUrls: string[];
};

// İlan detay sayfasındaki "ilanlio.com" filigranının (orta, çapraz, yarı
// saydam) önizleme karşılığı. Burada gerçek görsel işlenmez; CSS ile bir
// katman bindirilir - amaç kullanıcıya yayında filigranın nasıl görüneceğini
// göstermektir. Gerçek kalıcı filigran yükleme sırasında uygulanır
// (bkz. src/lib/watermark.ts).
function WatermarkOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <span
        className="-rotate-[32deg] select-none whitespace-nowrap font-extrabold text-white/40"
        style={{ fontSize: "min(9vw, 2.75rem)", textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}
      >
        ilanlio.com
      </span>
    </div>
  );
}

export function ListingPreview({ data }: { data: ListingPreviewData }) {
  const [active, setActive] = useState(0);
  const images = data.imageUrls;
  const activeUrl = images[active];
  const location = [data.il, data.ilce].filter(Boolean).join(", ");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand">
        <EyeIcon className="h-4.5 w-4.5 shrink-0" />
        <p>
          <span className="font-bold">Önizleme</span> — İlanınız onaylandıktan sonra yayında bu
          şekilde görünecek. Fotoğraflarda <span className="font-semibold">ilanlio.com</span>{" "}
          filigranı otomatik eklenir.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Galeri */}
        <div className="lg:col-span-3">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100">
            {activeUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeUrl} alt={data.title} className="h-full w-full object-cover" />
                <WatermarkOverlay />
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-300">
                <ImageIcon className="h-10 w-10" />
                <span className="text-sm">Fotoğraf eklenmedi</span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`relative aspect-square overflow-hidden rounded-lg bg-slate-100 transition-all ${
                    i === active ? "ring-2 ring-brand" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <WatermarkOverlay />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Özet */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
            {data.categoryName && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                {data.categoryName}
              </span>
            )}
            <h2 className="mt-2 text-lg font-bold leading-snug text-foreground">
              {data.title || "Başlıksız ilan"}
            </h2>
            <p className="mt-2 text-2xl font-extrabold text-brand">{formatPrice(data.price)}</p>
            {data.isNegotiable && (
              <span className="mt-2 inline-flex items-center rounded-md bg-accent-light px-2 py-0.5 text-xs font-semibold text-brand">
                Pazarlığa açık
              </span>
            )}
            {location && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
                <LocationIcon className="h-4 w-4 shrink-0 text-slate-400" />
                {location}
              </p>
            )}
            {data.condition && (
              <p className="mt-1.5 text-sm text-slate-500">
                Durum: <span className="font-semibold text-slate-700">{data.condition}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Özellikler */}
      {data.specs && data.specs.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
          <h3 className="mb-3 text-sm font-bold text-foreground">Özellikler</h3>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.specs.map((spec) => (
              <div key={spec.label} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <dt className="text-xs text-slate-400">{spec.label}</dt>
                <dd className="truncate text-sm font-semibold text-slate-800">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Açıklama */}
      {data.description && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
          <h3 className="mb-2 text-sm font-bold text-foreground">Açıklama</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {data.description}
          </p>
        </div>
      )}

      {/* Donanım */}
      {data.equipmentGroups && data.equipmentGroups.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
          <h3 className="mb-3 text-sm font-bold text-foreground">Donanım</h3>
          <div className="space-y-3">
            {data.equipmentGroups.map((group) => (
              <div key={group.title}>
                <p className="mb-1.5 text-xs text-slate-400">{group.title}</p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
