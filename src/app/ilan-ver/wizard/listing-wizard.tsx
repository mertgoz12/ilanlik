"use client";

import { useActionState, useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { createListingAction, type ListingFormState } from "../actions";
import { AlertIcon, CheckIcon, CloseIcon } from "@/components/icons";
import { HiddenFileInput } from "@/components/sortable-image-picker";
import { ProgressIndicator } from "./progress-indicator";
import { Step1VehicleInfo } from "./step1-vehicle-info";
import { Step2Damage } from "./step2-damage";
import { Step3Equipment } from "./step3-equipment";
import { Step4PhotosDescription } from "./step4-photos-description";
import { Step5PricePreview } from "./step5-price-preview";
import { DEFAULT_WIZARD_STATE, clearDraft, loadDraft, saveDraft, type WizardState } from "./wizard-types";
import type { VehicleCatalogBrand } from "@/lib/vehicle-catalog";
import { validateStep1, validateStep4, validateStep5 } from "./wizard-validation";

const initialState: ListingFormState = {};

const primaryButtonClass =
  "inline-flex flex-1 items-center justify-center rounded-lg bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-initial sm:py-3 sm:text-sm";

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-sm";

function HiddenFields({ wizard }: { wizard: WizardState }) {
  return (
    <>
      <input type="hidden" name="brand" value={wizard.brand} />
      <input type="hidden" name="model" value={wizard.model} />
      <input type="hidden" name="series" value={wizard.series} />
      <input type="hidden" name="year" value={wizard.year} />
      <input type="hidden" name="km" value={wizard.km} />
      <input type="hidden" name="fuelType" value={wizard.fuelType} />
      <input type="hidden" name="transmission" value={wizard.transmission} />
      <input type="hidden" name="bodyType" value={wizard.bodyType} />
      <input type="hidden" name="color" value={wizard.color} />
      <input type="hidden" name="engineVolume" value={wizard.engineVolume} />
      <input type="hidden" name="enginePower" value={wizard.enginePower} />
      <input type="hidden" name="drivetrain" value={wizard.drivetrain} />
      <input type="hidden" name="vehicleCondition" value={wizard.vehicleCondition} />
      <input type="hidden" name="doorCount" value={wizard.doorCount} />
      <input type="hidden" name="plateOrigin" value={wizard.plateOrigin} />
      <input type="hidden" name="fromWho" value={wizard.fromWho} />
      <input type="hidden" name="exchange" value={wizard.exchange} />
      <input type="hidden" name="warranty" value={wizard.warranty} />
      <input type="hidden" name="trimId" value={wizard.trimId} />
      <input type="hidden" name="damageInfo" value={JSON.stringify(wizard.damageInfo)} />
      <input type="hidden" name="tramerAmount" value={wizard.noTramer ? "" : wizard.tramerAmount} />
      <input type="hidden" name="equipment" value={JSON.stringify(wizard.equipment)} />
      <input type="hidden" name="title" value={wizard.title} />
      <input type="hidden" name="description" value={wizard.description} />
      <input type="hidden" name="price" value={wizard.price} />
    </>
  );
}

export function ListingWizard({
  categoryId,
  categoryName,
  catalog,
  defaultFromWho,
}: {
  categoryId: string;
  categoryName: string;
  catalog: VehicleCatalogBrand[];
  defaultFromWho?: string;
}) {
  const [state, formAction, pending] = useActionState(createListingAction, initialState);
  const [step, setStep] = useState(1);
  const [wizard, setWizard] = useState<WizardState>(() => ({
    ...DEFAULT_WIZARD_STATE,
    fromWho: defaultFromWho ?? "",
  }));
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRestoredBanner, setShowRestoredBanner] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saved">("idle");
  const skipNextSave = useRef(true);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setWizard(draft.wizard);
      setStep(draft.step);
      setShowRestoredBanner(true);
    }
  }, []);

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      saveDraft(step, wizard);
      setDraftStatus("saved");
    }, 600);
    return () => clearTimeout(timeout);
  }, [wizard, step]);

  function handleChange(patch: Partial<WizardState>) {
    setWizard((w) => ({ ...w, ...patch }));
    setErrors((e) => {
      if (Object.keys(e).length === 0) return e;
      const next = { ...e };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  }

  function goNext() {
    const stepErrors = step === 1 ? validateStep1(wizard) : step === 4 ? validateStep4(wizard) : {};
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(5, s + 1));
  }

  function goPrev() {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  }

  function handleSubmitClick(e: MouseEvent<HTMLButtonElement>) {
    const stepErrors = validateStep5(wizard);
    if (Object.keys(stepErrors).length > 0) {
      e.preventDefault();
      setErrors(stepErrors);
      return;
    }
    clearDraft();
  }

  return (
    <div className="space-y-6">
      {showRestoredBanner && (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4 shrink-0" />
            Taslağınız geri yüklendi. Not: Fotoğraflar taslakta saklanmaz, lütfen yeniden ekleyin.
          </span>
          <button
            type="button"
            onClick={() => setShowRestoredBanner(false)}
            aria-label="Kapat"
            className="shrink-0 text-emerald-600 transition-colors hover:text-emerald-800"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {state.priceWarning ? (
        <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800">
                Girdiğiniz fiyat piyasa analizine göre yüksek görünüyor
              </p>
              <p className="mt-1 text-sm text-amber-700">
                İlanınız yayınlandı ancak incelemeye alındı. Ekibimiz fiyatınızı kısa süre içinde
                gözden geçirecek.
              </p>
            </div>
          </div>
          <Link href={`/ilan/${state.listingNo}`} className={primaryButtonClass}>
            İlanı Görüntüle
          </Link>
        </div>
      ) : (
        <>
          <ProgressIndicator current={step} />

          <form action={formAction} className="space-y-6">
        <input type="hidden" name="categoryId" value={categoryId} />
        <HiddenFields wizard={wizard} />
        <HiddenFileInput files={photos} />

        {state.error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertIcon className="h-4 w-4 shrink-0" />
            {state.error}
          </div>
        )}

        {step === 1 && (
          <Step1VehicleInfo categoryName={categoryName} wizard={wizard} onChange={handleChange} errors={errors} catalog={catalog} />
        )}
        {step === 2 && <Step2Damage wizard={wizard} onChange={handleChange} />}
        {step === 3 && <Step3Equipment wizard={wizard} onChange={handleChange} />}
        {step === 4 && (
          <Step4PhotosDescription
            wizard={wizard}
            onChange={handleChange}
            photos={photos}
            onPhotosChange={setPhotos}
            errors={errors}
          />
        )}
        {step === 5 && <Step5PricePreview wizard={wizard} onChange={handleChange} photos={photos} errors={errors} />}

        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={goPrev} disabled={step === 1} className={secondaryButtonClass}>
            Geri
          </button>
          {step < 5 ? (
            <button type="button" onClick={goNext} className={primaryButtonClass}>
              İleri
            </button>
          ) : (
            <button type="submit" disabled={pending} onClick={handleSubmitClick} className={primaryButtonClass}>
              {pending ? "İlan yayınlanıyor..." : "İlanı Yayınla"}
            </button>
          )}
        </div>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
          {draftStatus === "saved" ? (
            <>
              <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
              Taslağınız kaydedildi.
            </>
          ) : (
            "Değişiklikleriniz taslak olarak otomatik kaydedilir."
          )}
        </p>
          </form>
        </>
      )}
    </div>
  );
}
