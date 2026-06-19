"use client";

import { errorClass, FormSection, inputClass, labelClass, selectClass } from "@/components/form-ui";
import {
  BODY_TYPES,
  COLORS,
  DOOR_COUNTS,
  DRIVETRAINS,
  EXCHANGE_OPTIONS,
  FROM_WHO_OPTIONS,
  FUEL_TYPES,
  PLATE_ORIGINS,
  TRANSMISSIONS,
  VEHICLE_CONDITIONS,
  WARRANTY_OPTIONS,
} from "@/lib/car-data";
import type { VehicleCatalogBrand } from "@/lib/vehicle-catalog";
import { fieldClass, type WizardState } from "./wizard-types";

const OTHER = "__other__";
const currentYear = new Date().getFullYear();

type Step1Props = {
  categoryName: string;
  wizard: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  errors: Record<string, string>;
  catalog: VehicleCatalogBrand[];
};

function isReal(id: string) {
  return id !== "" && id !== OTHER;
}

export function Step1VehicleInfo({ categoryName, wizard, onChange, errors, catalog }: Step1Props) {
  const selectedBrand = isReal(wizard.brandId)
    ? catalog.find((b) => b.id === wizard.brandId)
    : undefined;
  const selectedModel =
    selectedBrand && isReal(wizard.modelId)
      ? selectedBrand.models.find((m) => m.id === wizard.modelId)
      : undefined;
  const selectedGen =
    selectedModel && isReal(wizard.generationId)
      ? selectedModel.generations.find((g) => g.id === wizard.generationId)
      : undefined;
  const trimDerived =
    selectedGen !== undefined && isReal(wizard.trimId)
      ? selectedGen.trims.some((t) => t.id === wizard.trimId)
      : false;

  const brandIsOther = wizard.brandId === OTHER;
  const brandIsReal = isReal(wizard.brandId);
  const modelIsOther = wizard.modelId === OTHER;
  const modelIsReal = isReal(wizard.modelId);
  const genIsReal = isReal(wizard.generationId);

  // Whether to show the cascading generation / trim selects
  const showGenSelect = brandIsReal && !modelIsOther;
  const showTrimSelect = brandIsReal && modelIsReal && genIsReal;

  // Year dropdown: full range 1990–currentYear (descending). When a generation
  // is selected, narrow to that generation's window if it fits within range.
  const genYearEnd = selectedGen?.yearEnd ?? currentYear;
  const genYearStart = selectedGen?.yearStart ?? 1990;
  const yearMin = genIsReal ? Math.max(genYearStart, 1990) : 1990;
  const yearMax = genIsReal ? Math.min(genYearEnd, currentYear) : currentYear;
  const yearOptions: number[] = Array.from(
    { length: yearMax - yearMin + 1 },
    (_, i) => yearMax - i,
  );

  function handleBrandChange(value: string) {
    const patch: Partial<WizardState> = {
      brandId: value,
      brand: "",
      modelId: "",
      model: "",
      generationId: "",
      trimId: "",
      series: "",
      fuelType: "",
      transmission: "",
      engineVolume: "",
      enginePower: "",
      drivetrain: "",
      year: "",
    };
    if (value !== OTHER && value !== "") {
      const b = catalog.find((x) => x.id === value);
      patch.brand = b?.name ?? "";
    }
    onChange(patch);
  }

  function handleModelChange(value: string) {
    const patch: Partial<WizardState> = {
      modelId: value,
      model: "",
      generationId: "",
      trimId: "",
      series: "",
      fuelType: "",
      transmission: "",
      engineVolume: "",
      enginePower: "",
      drivetrain: "",
      year: "",
    };
    if (value !== OTHER && value !== "") {
      const m = selectedBrand?.models.find((x) => x.id === value);
      patch.model = m?.name ?? "";
    }
    onChange(patch);
  }

  function handleGenerationChange(value: string) {
    onChange({
      generationId: value,
      trimId: "",
      series: "",
      fuelType: "",
      transmission: "",
      engineVolume: "",
      enginePower: "",
      drivetrain: "",
      year: "",
    });
  }

  function handleTrimChange(value: string) {
    if (value === OTHER || value === "") {
      onChange({ trimId: value, series: "", fuelType: "", transmission: "", engineVolume: "", enginePower: "", drivetrain: "" });
      return;
    }
    const trim = selectedGen?.trims.find((t) => t.id === value);
    if (!trim) return;
    onChange({
      trimId: value,
      series: trim.name,
      fuelType: trim.fuelType,
      transmission: trim.transmission,
      engineVolume: trim.engineVolume ?? "",
      enginePower: trim.enginePower ?? "",
      drivetrain: trim.drivetrain ?? "",
    });
  }

  return (
    <div className="space-y-6">
      <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
        Kategori: <span className="ml-1 font-medium text-slate-800">{categoryName}</span>
      </span>

      <FormSection title="Araç Bilgileri" description="Listeden seçin; her seçim bir sonraki seçeneği doldurur.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Marka */}
          <div>
            <label htmlFor="brand-catalog" className={labelClass}>
              Marka
            </label>
            <select
              id="brand-catalog"
              value={wizard.brandId}
              onChange={(e) => handleBrandChange(e.target.value)}
              className={fieldClass(selectClass, errors.brand)}
            >
              <option value="">Marka seçin</option>
              {catalog.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
              <option value={OTHER}>— Diğer / Listede yok</option>
            </select>
            {brandIsOther && (
              <input
                id="brand"
                type="text"
                value={wizard.brand}
                onChange={(e) => onChange({ brand: e.target.value })}
                placeholder="Marka adını girin"
                className={`mt-2 ${fieldClass(inputClass, errors.brand)}`}
              />
            )}
            {errors.brand && <p className={errorClass}>{errors.brand}</p>}
          </div>

          {/* Model */}
          <div>
            <label htmlFor="model-field" className={labelClass}>
              Model
            </label>
            {brandIsOther ? (
              <input
                id="model-field"
                type="text"
                value={wizard.model}
                onChange={(e) => onChange({ model: e.target.value })}
                placeholder="Model adını girin"
                className={fieldClass(inputClass, errors.model)}
              />
            ) : (
              <>
                <select
                  id="model-field"
                  value={wizard.modelId}
                  onChange={(e) => handleModelChange(e.target.value)}
                  disabled={!brandIsReal}
                  className={fieldClass(selectClass, errors.model)}
                >
                  <option value="">{brandIsReal ? "Model seçin" : "Önce marka seçin"}</option>
                  {selectedBrand?.models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                  {brandIsReal && <option value={OTHER}>— Diğer / Listede yok</option>}
                </select>
                {modelIsOther && (
                  <input
                    id="model-manual"
                    type="text"
                    value={wizard.model}
                    onChange={(e) => onChange({ model: e.target.value })}
                    placeholder="Model adını girin"
                    className={`mt-2 ${fieldClass(inputClass, errors.model)}`}
                  />
                )}
              </>
            )}
            {errors.model && <p className={errorClass}>{errors.model}</p>}
          </div>

          {/* Seri / Jenerasyon (only when catalog model is selected) */}
          {showGenSelect && (
            <div>
              <label htmlFor="generation-field" className={labelClass}>
                Seri / Jenerasyon{" "}
                <span className="font-normal text-slate-400">(opsiyonel)</span>
              </label>
              <select
                id="generation-field"
                value={wizard.generationId}
                onChange={(e) => handleGenerationChange(e.target.value)}
                disabled={!modelIsReal}
                className={selectClass}
              >
                <option value="">
                  {modelIsReal ? "Jenerasyon seçin" : "Önce model seçin"}
                </option>
                {selectedModel?.generations.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.yearStart}–{g.yearEnd ?? "günümüz"})
                  </option>
                ))}
                {modelIsReal && <option value={OTHER}>— Diğer / Listede yok</option>}
              </select>
            </div>
          )}

          {/* Yıl */}
          <div>
            <label htmlFor="year" className={labelClass}>
              Yıl
            </label>
            <select
              id="year"
              value={wizard.year}
              onChange={(e) => onChange({ year: e.target.value })}
              className={fieldClass(selectClass, errors.year)}
            >
              <option value="">Yıl seçin</option>
              {yearOptions.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
            {errors.year && <p className={errorClass}>{errors.year}</p>}
          </div>

          {/* Motor & Donanım Paketi (only when generation from catalog is selected) */}
          {showTrimSelect && (
            <div className="sm:col-span-2">
              <label htmlFor="trim-field" className={labelClass}>
                Motor & Donanım Paketi{" "}
                <span className="font-normal text-slate-400">(opsiyonel)</span>
              </label>
              <select
                id="trim-field"
                value={wizard.trimId}
                onChange={(e) => handleTrimChange(e.target.value)}
                className={selectClass}
              >
                <option value="">Seçin (opsiyonel)</option>
                {selectedGen?.trims.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.fuelType}, {t.transmission})
                  </option>
                ))}
                <option value={OTHER}>— Diğer / Listede yok</option>
              </select>
              {trimDerived && (
                <p className="mt-1 text-xs text-emerald-600">
                  ✓ Seri/Paket ve teknik özellikler seçiminize göre otomatik dolduruldu.
                </p>
              )}
            </div>
          )}

          {/* Seri / Paket */}
          <div>
            <label htmlFor="series" className={labelClass}>
              Seri / Paket{" "}
              <span className="font-normal text-slate-400">(opsiyonel)</span>
            </label>
            <input
              id="series"
              type="text"
              value={wizard.series}
              onChange={trimDerived ? () => {} : (e) => onChange({ series: e.target.value })}
              disabled={trimDerived}
              placeholder={trimDerived ? undefined : "Örn: 1.6 TDI Comfortline"}
              className={inputClass}
            />
          </div>

          {/* Kilometre */}
          <div>
            <label htmlFor="km" className={labelClass}>
              Kilometre
            </label>
            <input
              id="km"
              type="number"
              min={0}
              max={2000000}
              value={wizard.km}
              onChange={(e) => onChange({ km: e.target.value })}
              placeholder="125000"
              className={fieldClass(inputClass, errors.km)}
            />
            {errors.km && <p className={errorClass}>{errors.km}</p>}
          </div>

          {/* Araç Durumu */}
          <div>
            <label htmlFor="vehicleCondition" className={labelClass}>
              Araç Durumu <span className="font-normal text-slate-400">(opsiyonel)</span>
            </label>
            <select
              id="vehicleCondition"
              value={wizard.vehicleCondition}
              onChange={(e) => onChange({ vehicleCondition: e.target.value })}
              className={selectClass}
            >
              <option value="">Seçin</option>
              {VEHICLE_CONDITIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Kapı Sayısı */}
          <div>
            <label htmlFor="doorCount" className={labelClass}>
              Kapı Sayısı <span className="font-normal text-slate-400">(opsiyonel)</span>
            </label>
            <select
              id="doorCount"
              value={wizard.doorCount}
              onChange={(e) => onChange({ doorCount: e.target.value })}
              className={selectClass}
            >
              <option value="">Seçin</option>
              {DOOR_COUNTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Teknik Özellikler"
        description={
          trimDerived
            ? "Motor ve donanım paketi seçiminize göre otomatik dolduruldu."
            : brandIsOther || modelIsOther
              ? "Marka/model kataloğumuzda bulunmuyor. Teknik özellikleri aşağıdan manuel girin."
              : undefined
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="fuelType" className={labelClass}>
              Yakıt Tipi
            </label>
            <select
              id="fuelType"
              value={wizard.fuelType}
              onChange={trimDerived ? () => {} : (e) => onChange({ fuelType: e.target.value })}
              disabled={trimDerived}
              className={fieldClass(selectClass, errors.fuelType)}
            >
              <option value="" disabled>
                Seçin
              </option>
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            {errors.fuelType && <p className={errorClass}>{errors.fuelType}</p>}
          </div>

          <div>
            <label htmlFor="transmission" className={labelClass}>
              Vites Tipi
            </label>
            <select
              id="transmission"
              value={wizard.transmission}
              onChange={trimDerived ? () => {} : (e) => onChange({ transmission: e.target.value })}
              disabled={trimDerived}
              className={fieldClass(selectClass, errors.transmission)}
            >
              <option value="" disabled>
                Seçin
              </option>
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.transmission && <p className={errorClass}>{errors.transmission}</p>}
          </div>

          <div>
            <label htmlFor="color" className={labelClass}>
              Renk{" "}
              <span className="font-normal text-slate-400">(opsiyonel)</span>
            </label>
            <select
              id="color"
              value={wizard.color}
              onChange={(e) => onChange({ color: e.target.value })}
              className={selectClass}
            >
              <option value="">Renk seçin</option>
              {COLORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="engineVolume" className={labelClass}>
              Motor Hacmi{" "}
              <span className="font-normal text-slate-400">(opsiyonel)</span>
            </label>
            <input
              id="engineVolume"
              type="text"
              value={wizard.engineVolume}
              onChange={trimDerived ? () => {} : (e) => onChange({ engineVolume: e.target.value })}
              disabled={trimDerived}
              placeholder={trimDerived ? undefined : "Örn: 1.6"}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="enginePower" className={labelClass}>
              Motor Gücü{" "}
              <span className="font-normal text-slate-400">(opsiyonel)</span>
            </label>
            <input
              id="enginePower"
              type="text"
              value={wizard.enginePower}
              onChange={trimDerived ? () => {} : (e) => onChange({ enginePower: e.target.value })}
              disabled={trimDerived}
              placeholder={trimDerived ? undefined : "Örn: 116 hp"}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="drivetrain" className={labelClass}>
              Çekiş{" "}
              <span className="font-normal text-slate-400">(opsiyonel)</span>
            </label>
            <select
              id="drivetrain"
              value={wizard.drivetrain}
              onChange={trimDerived ? () => {} : (e) => onChange({ drivetrain: e.target.value })}
              disabled={trimDerived}
              className={selectClass}
            >
              <option value="">Seçin</option>
              {DRIVETRAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bodyType" className={labelClass}>
              Kasa Tipi{" "}
              <span className="font-normal text-slate-400">(opsiyonel)</span>
            </label>
            <select
              id="bodyType"
              value={wizard.bodyType}
              onChange={(e) => onChange({ bodyType: e.target.value })}
              className={selectClass}
            >
              <option value="">Seçin</option>
              {BODY_TYPES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormSection>

      <FormSection title="Satış Bilgileri">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="plateOrigin" className={labelClass}>
              Plaka / Uyruk <span className="font-normal text-slate-400">(opsiyonel)</span>
            </label>
            <select
              id="plateOrigin"
              value={wizard.plateOrigin}
              onChange={(e) => onChange({ plateOrigin: e.target.value })}
              className={selectClass}
            >
              <option value="">Seçin</option>
              {PLATE_ORIGINS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fromWho" className={labelClass}>
              Kimden <span className="font-normal text-slate-400">(opsiyonel)</span>
            </label>
            <select
              id="fromWho"
              value={wizard.fromWho}
              onChange={(e) => onChange({ fromWho: e.target.value })}
              className={selectClass}
            >
              <option value="">Seçin</option>
              {FROM_WHO_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="exchange" className={labelClass}>
              Takas <span className="font-normal text-slate-400">(opsiyonel)</span>
            </label>
            <select
              id="exchange"
              value={wizard.exchange}
              onChange={(e) => onChange({ exchange: e.target.value })}
              className={selectClass}
            >
              <option value="">Seçin</option>
              {EXCHANGE_OPTIONS.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="warranty" className={labelClass}>
              Garanti <span className="font-normal text-slate-400">(opsiyonel)</span>
            </label>
            <select
              id="warranty"
              value={wizard.warranty}
              onChange={(e) => onChange({ warranty: e.target.value })}
              className={selectClass}
            >
              <option value="">Seçin</option>
              {WARRANTY_OPTIONS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormSection>
    </div>
  );
}
