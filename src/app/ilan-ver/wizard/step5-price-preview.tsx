"use client";

import { useEffect, useMemo } from "react";
import { CarDiagram } from "@/components/car-diagram";
import { errorClass, FormSection, inputClass, labelClass } from "@/components/form-ui";
import { LocationSelect } from "@/components/location-select";
import { ListingCard } from "@/components/listing-card";
import { DAMAGE_STATUS_STYLES, EQUIPMENT_GROUPS, damageStatusLabel, deriveDamageStatus } from "@/lib/car-data";
import { formatKm, formatPrice } from "@/lib/format";
import type { ListingWithImages } from "@/lib/types";
import { fieldClass, type WizardState } from "./wizard-types";
import { effectiveTitle } from "./wizard-validation";

type Step5Props = {
  wizard: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  photos: File[];
  errors: Record<string, string>;
};

export function Step5PricePreview({ wizard, onChange, photos, errors }: Step5Props) {
  const priceDigits = wizard.price.replace(/\D/g, "");
  const priceNumber = priceDigits ? Number(priceDigits) : 0;
  const formattedPrice = priceDigits ? new Intl.NumberFormat("tr-TR").format(priceNumber) : "";

  const tramerAmount = wizard.noTramer ? 0 : Number(wizard.tramerAmount) || 0;
  const damageStatus = deriveDamageStatus(tramerAmount);
  const title = effectiveTitle(wizard) || "Başlıksız ilan";

  const imageUrls = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos]);
  useEffect(() => {
    return () => imageUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [imageUrls]);

  const previewListing: ListingWithImages = {
    id: "preview",
    listingNo: "preview",
    title,
    description: wizard.description || null,
    condition: null,
    price: priceNumber,
    brand: wizard.brand || null,
    model: wizard.model || null,
    series: wizard.series || null,
    year: wizard.year ? Number(wizard.year) : null,
    km: wizard.km ? Number(wizard.km) : null,
    fuelType: wizard.fuelType || null,
    transmission: wizard.transmission || null,
    bodyType: wizard.bodyType || null,
    color: wizard.color || null,
    enginePower: wizard.enginePower || null,
    engineVolume: wizard.engineVolume || null,
    drivetrain: wizard.drivetrain || null,
    vehicleCondition: wizard.vehicleCondition || null,
    doorCount: wizard.doorCount || null,
    plateOrigin: wizard.plateOrigin || null,
    fromWho: wizard.fromWho || null,
    exchange: wizard.exchange || null,
    warranty: wizard.warranty || null,
    vehicleTrimRawSpecs: null,
    damageStatus,
    damageInfo: JSON.stringify(wizard.damageInfo),
    tramerAmount: tramerAmount || null,
    equipment: JSON.stringify(wizard.equipment),
    il: wizard.il,
    ilce: wizard.ilce,
    isFeatured: false,
    views: 0,
    isDemo: false,
    status: "active",
    aiAnalysis: null,
    aiReportStatus: null,
    flagResolvedAt: null,
    optionStatus: "bosta",
    optionHolderId: null,
    optionStartAt: null,
    optionEndAt: null,
    categoryId: "preview",
    userId: "preview",
    createdAt: new Date(),
    updatedAt: new Date(),
    category: { id: "preview", name: "Önizleme", slug: "preview", order: 0, parentId: null },
    images: imageUrls.map((url, i) => ({ id: `preview-${i}`, url, order: i, listingId: "preview" })),
    _count: { images: imageUrls.length },
  };

  const specEntries: { label: string; value: string }[] = [
    { label: "Marka", value: wizard.brand || "-" },
    { label: "Model", value: wizard.model || "-" },
    ...(wizard.series ? [{ label: "Seri / Paket", value: wizard.series }] : []),
    { label: "Yıl", value: wizard.year || "-" },
    { label: "Kilometre", value: wizard.km ? formatKm(Number(wizard.km)) : "-" },
    { label: "Yakıt Tipi", value: wizard.fuelType || "-" },
    { label: "Vites", value: wizard.transmission || "-" },
    ...(wizard.vehicleCondition ? [{ label: "Araç Durumu", value: wizard.vehicleCondition }] : []),
    ...(wizard.bodyType ? [{ label: "Kasa Tipi", value: wizard.bodyType }] : []),
    ...(wizard.color ? [{ label: "Renk", value: wizard.color }] : []),
    ...(wizard.enginePower ? [{ label: "Motor Gücü", value: wizard.enginePower }] : []),
    ...(wizard.engineVolume ? [{ label: "Motor Hacmi", value: wizard.engineVolume }] : []),
    ...(wizard.drivetrain ? [{ label: "Çekiş", value: wizard.drivetrain }] : []),
    ...(wizard.doorCount ? [{ label: "Kapı Sayısı", value: wizard.doorCount }] : []),
    ...(wizard.plateOrigin ? [{ label: "Plaka / Uyruk", value: wizard.plateOrigin }] : []),
    ...(wizard.fromWho ? [{ label: "Kimden", value: wizard.fromWho }] : []),
    ...(wizard.exchange ? [{ label: "Takas", value: wizard.exchange }] : []),
    ...(wizard.warranty ? [{ label: "Garanti", value: wizard.warranty }] : []),
  ];

  const equipmentGroupsWithSelection = EQUIPMENT_GROUPS.map((group) => ({
    title: group.title,
    items: group.items.filter((item) => wizard.equipment.includes(item.key)),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-6">
      <FormSection title="Fiyat ve Konum">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className={labelClass}>
              Fiyat (₺)
            </label>
            <div className="relative">
              <input
                id="price"
                type="text"
                inputMode="numeric"
                value={formattedPrice}
                onChange={(e) => onChange({ price: e.target.value.replace(/\D/g, "") })}
                placeholder="850.000"
                className={fieldClass(inputClass, errors.price) + " pr-8"}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-400">
                ₺
              </span>
            </div>
            {errors.price && <p className={errorClass}>{errors.price}</p>}
          </div>

          <div className="hidden sm:block" />

          <LocationSelect
            required
            defaultIl={wizard.il}
            defaultIlce={wizard.ilce}
            onIlChange={(il) => onChange({ il, ilce: "" })}
            onIlceChange={(ilce) => onChange({ ilce })}
          />
          {errors.il && <p className={errorClass}>{errors.il}</p>}
          {errors.ilce && <p className={errorClass}>{errors.ilce}</p>}
        </div>
      </FormSection>

      <FormSection title="İlan Önizlemesi" description="İlanınız ana sayfada bu şekilde görünecek.">
        <div className="max-w-sm">
          <ListingCard listing={previewListing} />
        </div>
      </FormSection>

      <FormSection title="Detay Önizlemesi" description="İlan detay sayfanız bu bilgileri gösterecek.">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{formatPrice(priceNumber)}</p>
            <p className="mt-1 text-sm text-slate-500">
              {wizard.il || "İl"}{wizard.ilce ? `, ${wizard.ilce}` : ""}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {specEntries.map((spec) => (
              <div key={spec.label} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <dt className="text-xs text-slate-400">{spec.label}</dt>
                <dd className="text-sm font-semibold text-slate-800">{spec.value}</dd>
              </div>
            ))}
          </dl>

          {wizard.description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{wizard.description}</p>
          )}

          <div className="border-t border-slate-100 pt-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">Hasar, Boya ve Değişen Bilgisi</p>
              <span className={`rounded-md border px-2.5 py-1 text-sm font-semibold ${DAMAGE_STATUS_STYLES[damageStatus]}`}>
                {damageStatusLabel(damageStatus)}
              </span>
            </div>
            {tramerAmount > 0 && (
              <p className="mb-3 text-sm text-slate-600">
                TRAMER hasar kaydı tutarı: <span className="font-semibold">{formatPrice(tramerAmount)}</span>
              </p>
            )}
            <CarDiagram values={wizard.damageInfo} />
          </div>

          {equipmentGroupsWithSelection.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <p className="mb-3 text-sm font-semibold text-foreground">Donanım</p>
              <div className="space-y-3">
                {equipmentGroupsWithSelection.map((group) => (
                  <div key={group.title}>
                    <p className="mb-1.5 text-xs text-slate-400">{group.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item.key}
                          className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                        >
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </FormSection>
    </div>
  );
}
