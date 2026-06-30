"use client";

import { useActionState, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createSimpleListingAction, type SimpleListingFormState } from "./actions";
import { suggestListingFromPhotosAction } from "./ai-fill-action";
import type { GeminiFillSuggestion } from "@/lib/gemini-fill";
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
  SparkleIcon,
  SpinnerIcon,
  TagIcon,
} from "@/components/icons";

const initialState: SimpleListingFormState = {};

// Adım numaraları StepProgress ile aynı: 2 Fotoğraflar, 3 Detaylar,
// 4 Konum, 5 Önizleme (1 = kategori seçimi, ListingFlow'da). Fotoğraf adımı
// bilerek detaylardan ÖNCE gelir: kullanıcı önce fotoğraf yükleyip (isterse)
// yapay zekayla doldurabilsin, sonra dolu detay adımına ilerlesin; doldurma
// için geri dönmek zorunda kalmasın.
const STEP_PHOTOS = 2;
const STEP_DETAILS = 3;
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
  const formRef = useRef<HTMLFormElement>(null);
  // Fotoğraflar adımlar arası kaybolmasın diye form düzeyinde tutulur; gerçek
  // gönderilen input (HiddenFileInput) bu sırayla senkron tutulur.
  const [photos, setPhotos] = useState<File[]>([]);
  // Durum + pazarlık ("Teklif Ver") tercihi. İkinci el seçilince pazarlık
  // varsayılan açık, Sıfır seçilince kapanır (kullanıcı yine değiştirebilir).
  const [condition, setCondition] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  // OPSİYONEL "Yapay Zeka ile Doldur" (Gemini) durumu. aiResult set olduğunda
  // detay adımında bir özet/uyarı şeridi gösterilir; öneriler forma doldurulur
  // ama kullanıcı her alanı serbestçe düzenleyebilir.
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{
    suggestion: GeminiFillSuggestion;
    categoryId: string | null;
    categoryName: string | null;
  } | null>(null);
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

  // OPSİYONEL yapay zeka doldurma: yüklenen fotoğrafları sunucuya gönderir,
  // dönen önerileri (uncontrolled) form alanlarına yazar ve kullanıcıyı kontrol
  // etmesi için detay adımına götürür. Limit/hata olursa yalnızca uyarı gösterir,
  // form bozulmaz; kullanıcı her zaman elle doldurmaya devam edebilir.
  async function handleAiFill() {
    if (photos.length === 0) {
      setAiError("Önce en az bir fotoğraf yükleyin.");
      return;
    }
    setAiError(null);
    setAiLoading(true);
    try {
      const fd = new FormData();
      photos.forEach((file) => fd.append("images", file));
      fd.set("categoryName", categoryName);
      const result = await suggestListingFromPhotosAction(fd);
      if (!result.ok) {
        setAiError(result.error);
        return;
      }

      const s = result.suggestion;
      const form = formRef.current;
      if (form) {
        const setField = (name: string, value: string) => {
          const el = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
          if (el) el.value = value;
        };
        if (s.title) setField("title", s.title);
        if (s.description) setField("description", s.description);
        // Fiyat: tahmini aralığın ortası önerilir (yoksa tek uç). Kesin değil,
        // şeritte "tahmin" uyarısı gösterilir; kullanıcı mutlaka kontrol etmeli.
        const mid =
          s.priceMin && s.priceMax
            ? Math.round((s.priceMin + s.priceMax) / 2)
            : s.priceMin ?? s.priceMax;
        if (mid) setField("price", String(mid));
      }
      if (s.condition) {
        setCondition(s.condition);
        setNegotiable(s.condition === "İkinci El");
      }

      setAiResult({ suggestion: s, categoryId: result.categoryId, categoryName: result.categoryName });
      setLocalErrors({});
      onStep(STEP_DETAILS);
    } catch {
      setAiError("Yapay zeka şu an yanıt veremedi. Lütfen bilgileri elle doldurun.");
    } finally {
      setAiLoading(false);
    }
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
    <form ref={formRef} action={formAction} onKeyDown={handleKeyDown} className="space-y-5">
      <input type="hidden" name="categoryId" value={categoryId} />
      {/* Gerçek gönderilen "images" inputu - adımlar arası mount kalır. */}
      <HiddenFileInput files={photos} />

      {state.error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertIcon className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      {/* 3 - Detaylar (fotoğraftan SONRA) */}
      <div className={step === STEP_DETAILS ? "" : "hidden"}>
        {aiResult && (
          <div className="mb-4 rounded-2xl border border-accent/40 bg-accent-light/60 p-4 text-sm text-brand shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <SparkleIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-dark" />
                <div>
                  <p className="font-semibold">Yapay zeka önerileri forma dolduruldu.</p>
                  <p className="mt-0.5 text-xs text-brand/80">
                    Lütfen her alanı kontrol edip gerekirse düzenleyin. Öneriler tahmin
                    içerebilir; son karar size aittir.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiResult(null)}
                aria-label="Kapat"
                className="shrink-0 rounded-md p-1 text-brand/50 transition-colors hover:bg-white/60 hover:text-brand"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-1.5 text-xs">
              {aiResult.categoryName && (
                <p>
                  <span className="font-semibold">Önerilen kategori:</span> {aiResult.categoryName}
                  {aiResult.categoryName !== categoryName && (
                    <span className="text-brand/70">
                      {" "}
                      — değiştirmek için yukarıdan kategoriyi düzenleyebilirsiniz.
                    </span>
                  )}
                </p>
              )}
              {(aiResult.suggestion.brand || aiResult.suggestion.model) && (
                <p>
                  <span className="font-semibold">Marka / Model:</span>{" "}
                  {[aiResult.suggestion.brand, aiResult.suggestion.model].filter(Boolean).join(" ")}
                </p>
              )}
              {(aiResult.suggestion.priceMin || aiResult.suggestion.priceMax) && (
                <p>
                  <span className="font-semibold">Tahmini fiyat aralığı:</span>{" "}
                  {aiResult.suggestion.priceMin?.toLocaleString("tr-TR") ?? "?"} –{" "}
                  {aiResult.suggestion.priceMax?.toLocaleString("tr-TR") ?? "?"} ₺{" "}
                  <span className="font-medium text-amber-700">(tahmin, kontrol edin)</span>
                </p>
              )}
              {aiResult.suggestion.features.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="font-semibold">Özellikler:</span>
                  {aiResult.suggestion.features.map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-brand"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
              {aiResult.suggestion.note && (
                <p className="flex items-start gap-1.5 pt-0.5 text-amber-700">
                  <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {aiResult.suggestion.note}
                </p>
              )}
            </div>
          </div>
        )}

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

        <div className="mt-5 flex items-center justify-between gap-3">
          <button type="button" onClick={() => onStep(STEP_PHOTOS)} className={secondaryButton}>
            Geri
          </button>
          <button type="button" onClick={(e) => handleNext(e, STEP_LOCATION)} className={primaryButton}>
            Devam Et
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2 - Fotoğraflar (detaylardan ÖNCE) */}
      <div className={step === STEP_PHOTOS ? "" : "hidden"}>
        <StepCard
          icon={ImageIcon}
          title="Fotoğraflar"
          description="Net ve aydınlık fotoğraflar ilanınızın daha hızlı satılmasını sağlar."
        >
          <SortableImagePicker files={photos} onFilesChange={setPhotos} idPrefix="ilan" />

          {/* OPSİYONEL yapay zeka doldurma. Tamamen kullanıcının isteğine bağlı:
              basmazsa hiçbir yapay zeka çağrısı yapılmaz, ilanı elle doldurur. */}
          <div className="rounded-xl border border-accent/30 bg-accent-light/50 p-4">
            <div className="flex items-start gap-2.5">
              <SparkleIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent-dark" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand">Yapay zeka ilanı sizin için doldursun</p>
                <p className="mt-0.5 text-xs text-slate-600">
                  Fotoğraflarınızı inceleyip başlık, kategori, açıklama ve tahmini fiyat
                  önerir. İsteğe bağlıdır; öneriler forma dolar, dilediğiniz gibi düzenlersiniz.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAiFill}
              disabled={aiLoading || photos.length === 0}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-soft transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {aiLoading ? (
                <>
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                  Fotoğraflar inceleniyor...
                </>
              ) : (
                <>
                  <SparkleIcon className="h-4 w-4" />
                  {aiResult ? "Yeniden Doldur" : "Yapay Zeka ile Doldur"}
                </>
              )}
            </button>
            {photos.length === 0 && (
              <p className="mt-2 text-xs text-slate-500">Önce en az bir fotoğraf yükleyin.</p>
            )}
            {aiError && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                <AlertIcon className="h-3.5 w-3.5 shrink-0" />
                {aiError}
              </p>
            )}
            {aiResult && !aiError && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700">
                <CheckIcon className="h-3.5 w-3.5 shrink-0" />
                Öneriler dolduruldu — sonraki adımda kontrol edip düzenleyebilirsiniz.
              </p>
            )}
          </div>
        </StepCard>

        <div className="mt-5 flex justify-end">
          <button type="button" onClick={() => onStep(STEP_DETAILS)} className={primaryButton}>
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
          <button type="button" onClick={() => onStep(STEP_DETAILS)} className={secondaryButton}>
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
