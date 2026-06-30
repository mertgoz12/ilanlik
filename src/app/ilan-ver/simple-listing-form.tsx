"use client";

import { useActionState, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { createSimpleListingAction, type SimpleListingFormState } from "./actions";
import { HiddenFileInput, SortableImagePicker } from "@/components/sortable-image-picker";
import { LocationSelect } from "@/components/location-select";
import { errorClass, inputClass, labelClass, selectClass } from "@/components/form-ui";
import { CONDITION_VALUES } from "@/lib/validation";
import { ListingPreview, type ListingPreviewData } from "./listing-preview";
import { SubmittedScreen } from "./submitted-screen";
import {
  AlertIcon,
  CheckIcon,
  ChevronRightIcon,
  EyeIcon,
  ImageIcon,
  LocationIcon,
  TagIcon,
} from "@/components/icons";

const initialState: SimpleListingFormState = {};

// Adım numaraları StepProgress ile aynı: 2 Detaylar, 3 Fotoğraflar,
// 4 Konum, 5 Önizleme (1 = kategori seçimi, ListingFlow'da).
const STEP_DETAILS = 2;
const STEP_PHOTOS = 3;
const STEP_LOCATION = 4;
const STEP_PREVIEW = 5;

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
  categoryName,
  step,
  onStep,
}: {
  categoryId: string;
  categoryName: string;
  step: number;
  onStep: (step: number) => void;
}) {
  const [state, formAction, pending] = useActionState(createSimpleListingAction, initialState);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  // Fotoğraflar adımlar arası kaybolmasın diye form düzeyinde tutulur; gerçek
  // gönderilen input (HiddenFileInput) bu sırayla senkron tutulur.
  const [photos, setPhotos] = useState<File[]>([]);
  // Durum + pazarlık ("Teklif Ver") tercihi. İkinci el seçilince pazarlık
  // varsayılan açık, Sıfır seçilince kapanır (kullanıcı yine değiştirebilir).
  const [condition, setCondition] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  // Önizleme adımında gösterilecek anlık görüntü: form alanları (uncontrolled
  // olduğundan) önizlemeye geçerken DOM'dan okunup buraya alınır.
  const [preview, setPreview] = useState<{
    title: string;
    price: number;
    description: string;
    il: string;
    ilce: string;
  } | null>(null);

  // Önizleme galerisi için yerel fotoğraf URL'leri (yükleme yapmadan gösterim).
  const imageUrls = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos]);
  useEffect(() => {
    return () => imageUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [imageUrls]);

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

  function capturePreview(form: HTMLFormElement) {
    const getVal = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? "";
    setPreview({
      title: getVal("title").trim(),
      price: Number(getVal("price")) || 0,
      description: getVal("description").trim(),
      il: getVal("il"),
      ilce: getVal("ilce"),
    });
  }

  function handleNext(e: React.MouseEvent<HTMLButtonElement>, next: number) {
    if (step === STEP_DETAILS) {
      const form = e.currentTarget.form;
      if (form && !validateDetails(form)) return;
    }
    if (next === STEP_PREVIEW) {
      const form = e.currentTarget.form;
      if (form) capturePreview(form);
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

  if (state.submitted) {
    return <SubmittedScreen />;
  }

  return (
    <form action={formAction} onKeyDown={handleKeyDown} className="space-y-5">
      <input type="hidden" name="categoryId" value={categoryId} />
      {/* Gerçek gönderilen "images" inputu - adımlar arası mount kalır. */}
      <HiddenFileInput files={photos} />

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
              <select
                id="condition"
                name="condition"
                value={condition}
                onChange={(e) => {
                  const v = e.target.value;
                  setCondition(v);
                  // İkinci el -> pazarlık varsayılan açık; Sıfır/boş -> kapalı.
                  setNegotiable(v === "İkinci El");
                }}
                className={selectClass}
              >
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

          {/* Pazarlık (Teklif Ver) tercihi */}
          <input type="hidden" name="isNegotiable" value={negotiable ? "true" : "false"} />
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <input
              type="checkbox"
              checked={negotiable}
              onChange={(e) => setNegotiable(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand focus:ring-brand"
            />
            <span className="text-sm">
              <span className="font-semibold text-foreground">Pazarlığa açık (teklif alınır)</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Açıkken alıcılar ilan sayfanızdan size fiyat teklifi gönderebilir; teklifi kabul
                edebilir, reddedebilir veya karşı teklif verebilirsiniz.
              </span>
            </span>
          </label>

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
          <SortableImagePicker files={photos} onFilesChange={setPhotos} idPrefix="ilan" />
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
          <button type="button" onClick={(e) => handleNext(e, STEP_PREVIEW)} className={primaryButton}>
            <EyeIcon className="h-4 w-4" />
            Önizle
          </button>
        </div>
      </div>

      {/* 5 - Önizleme & Onaya Gönder */}
      <div className={step === STEP_PREVIEW ? "" : "hidden"}>
        <StepCard
          icon={EyeIcon}
          title="Önizleme"
          description="İlanınızı yayınlamadan önce son kez gözden geçirin."
        >
          {preview && (
            <ListingPreview
              data={{
                title: preview.title,
                price: preview.price,
                description: preview.description,
                il: preview.il,
                ilce: preview.ilce,
                categoryName,
                condition: condition || null,
                isNegotiable: negotiable,
                imageUrls,
              }}
            />
          )}
        </StepCard>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button type="button" onClick={() => onStep(STEP_LOCATION)} className={secondaryButton}>
            Geri / Düzenle
          </button>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-7 py-3 text-sm font-bold text-brand shadow-soft transition-colors hover:bg-accent-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              "Gönderiliyor..."
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                Onaya Gönder
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
