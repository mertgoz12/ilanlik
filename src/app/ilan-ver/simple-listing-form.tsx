"use client";

import { useActionState, useEffect, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { createSimpleListingAction, type SimpleListingFormState } from "./actions";
import { ImagePicker } from "@/components/image-picker";
import { LocationSelect } from "@/components/location-select";
import { errorClass, inputClass, labelClass, selectClass } from "@/components/form-ui";
import { CONDITION_VALUES } from "@/lib/validation";
import {
  AlertIcon,
  CheckIcon,
  ChevronRightIcon,
  ImageIcon,
  LocationIcon,
  TagIcon,
} from "@/components/icons";

const initialState: SimpleListingFormState = {};

// Adım numaraları StepProgress ile aynı: 2 Detaylar, 3 Fotoğraflar,
// 4 Konum & Yayınla (1 = kategori seçimi, ListingFlow'da).
const STEP_DETAILS = 2;
const STEP_PHOTOS = 3;
const STEP_LOCATION = 4;

function StepCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-soft sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-soft">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-base font-bold text-brand sm:text-lg">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{description}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

const primaryButton =
  "inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-brand shadow-soft transition-colors hover:bg-accent-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButton =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50";

export function SimpleListingForm({
  categoryId,
  step,
  onStep,
}: {
  categoryId: string;
  step: number;
  onStep: (step: number) => void;
}) {
  const [state, formAction, pending] = useActionState(createSimpleListingAction, initialState);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // Sunucu, görünmeyen bir adıma ait alanda hata döndürürse kullanıcıyı o
  // adıma geri götür ki hatayı görebilsin.
  useEffect(() => {
    const fe = state.fieldErrors;
    if (!fe) return;
    if (fe.title || fe.price || fe.condition || fe.description) onStep(STEP_DETAILS);
    else if (fe.il || fe.ilce) onStep(STEP_LOCATION);
  }, [state.fieldErrors, onStep]);

  function validateDetails(form: HTMLFormElement): boolean {
    const errs: Record<string, string> = {};
    const title = (form.elements.namedItem("title") as HTMLInputElement)?.value.trim() ?? "";
    const price = (form.elements.namedItem("price") as HTMLInputElement)?.value ?? "";
    if (title.length < 5) errs.title = "Başlık en az 5 karakter olmalı.";
    if (!price || Number(price) <= 0) errs.price = "Geçerli bir fiyat girin.";
    setLocalErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext(e: React.MouseEvent<HTMLButtonElement>, next: number) {
    if (step === STEP_DETAILS) {
      const form = e.currentTarget.form;
      if (form && !validateDetails(form)) return;
    }
    onStep(next);
  }

  // Metin alanlarında Enter'a basınca form vakitsiz gönderilmesin (son adım
  // dışında submit yok zaten, ama yine de güvenli tarafta kalalım).
  function handleKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    const target = e.target as HTMLElement;
    if (e.key === "Enter" && target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  }

  if (state.priceWarning) {
    return (
      <div className="rounded-2xl border-2 border-accent bg-accent-light/50 p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-brand">
            <AlertIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-brand">
              Girdiğiniz fiyat piyasa analizine göre yüksek görünüyor
            </p>
            <p className="mt-1 text-sm text-slate-600">
              İlanınız yayınlandı ancak incelemeye alındı. Ekibimiz fiyatınızı kısa süre içinde
              gözden geçirecek.
            </p>
          </div>
        </div>
        <Link
          href={`/ilan/${state.listingNo}`}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-700"
        >
          İlanı Görüntüle
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} onKeyDown={handleKeyDown} className="space-y-5">
      <input type="hidden" name="categoryId" value={categoryId} />

      {state.error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertIcon className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      {/* 2 - Detaylar */}
      <div className={step === STEP_DETAILS ? "" : "hidden"}>
        <StepCard
          icon={TagIcon}
          title="İlan Detayları"
          description="Ürününüzü en iyi şekilde tanıtın."
        >
          <div>
            <label htmlFor="title" className={labelClass}>
              İlan Başlığı
            </label>
            <input
              id="title"
              name="title"
              type="text"
              minLength={5}
              placeholder="Örn: iPhone 14 Pro 256 GB - Kusursuz Durumda"
              className={inputClass}
            />
            {(localErrors.title || state.fieldErrors?.title) && (
              <p className={errorClass}>{localErrors.title ?? state.fieldErrors?.title?.[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className={labelClass}>
                Fiyat (₺)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min={1}
                step={1}
                placeholder="15000"
                className={inputClass}
              />
              {(localErrors.price || state.fieldErrors?.price) && (
                <p className={errorClass}>{localErrors.price ?? state.fieldErrors?.price?.[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="condition" className={labelClass}>
                Durum
              </label>
              <select id="condition" name="condition" defaultValue="" className={selectClass}>
                <option value="">Belirtilmemiş</option>
                {CONDITION_VALUES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {state.fieldErrors?.condition && (
                <p className={errorClass}>{state.fieldErrors.condition[0]}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              İlan Açıklaması <span className="font-normal text-slate-400">(opsiyonel)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              placeholder="İlanınız hakkında alıcılara aktarmak istediğiniz detayları yazın..."
              className={inputClass}
            />
            {state.fieldErrors?.description && (
              <p className={errorClass}>{state.fieldErrors.description[0]}</p>
            )}
          </div>
        </StepCard>

        <div className="mt-5 flex justify-end">
          <button type="button" onClick={(e) => handleNext(e, STEP_PHOTOS)} className={primaryButton}>
            Devam Et
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 3 - Fotoğraflar */}
      <div className={step === STEP_PHOTOS ? "" : "hidden"}>
        <StepCard
          icon={ImageIcon}
          title="Fotoğraflar"
          description="Net ve aydınlık fotoğraflar ilanınızın daha hızlı satılmasını sağlar."
        >
          <ImagePicker />
        </StepCard>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button type="button" onClick={() => onStep(STEP_DETAILS)} className={secondaryButton}>
            Geri
          </button>
          <button type="button" onClick={(e) => handleNext(e, STEP_LOCATION)} className={primaryButton}>
            Devam Et
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 4 - Konum & Yayınla */}
      <div className={step === STEP_LOCATION ? "" : "hidden"}>
        <StepCard
          icon={LocationIcon}
          title="Konum & Yayınla"
          description="İlanınızın gösterileceği konumu seçin."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LocationSelect required />
          </div>
          {state.fieldErrors?.il && <p className={errorClass}>{state.fieldErrors.il[0]}</p>}
          {state.fieldErrors?.ilce && <p className={errorClass}>{state.fieldErrors.ilce[0]}</p>}
        </StepCard>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button type="button" onClick={() => onStep(STEP_PHOTOS)} className={secondaryButton}>
            Geri
          </button>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-7 py-3 text-sm font-bold text-brand shadow-soft transition-colors hover:bg-accent-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              "İlan yayınlanıyor..."
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                İlanı Yayınla
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
