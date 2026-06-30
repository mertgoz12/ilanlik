"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { uploadHeroImageAction, type HeroSlideFormState } from "@/app/admin/banner/actions";
import { useToast } from "@/components/admin/toast";
import { errorClass, FormSection, inputClass, labelClass } from "@/components/form-ui";
import { ImageIcon, SpinnerIcon, TagIcon } from "@/components/icons";

export type HeroSlideFormInitial = {
  imageUrl: string;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  isActive: boolean;
};

type HeroSlideFormProps = {
  action: (prevState: HeroSlideFormState, formData: FormData) => Promise<HeroSlideFormState>;
  initialSlide?: HeroSlideFormInitial;
  submitLabel: string;
};

const initialState: HeroSlideFormState = {};

export function HeroSlideForm({ action, initialSlide, submitLabel }: HeroSlideFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const { showToast } = useToast();

  const [imageUrl, setImageUrl] = useState(initialSlide?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [isActive, setIsActive] = useState(initialSlide?.isActive ?? true);
  const imageInputRef = useRef<HTMLInputElement>(null);

  async function handleImageFile(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.set("image", file);
    try {
      const result = await uploadHeroImageAction(formData);
      if (result.url) setImageUrl(result.url);
      else showToast({ variant: "error", message: result.error ?? "Görsel yüklenemedi." });
    } catch {
      showToast({ variant: "error", message: "Görsel yüklenemedi." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="isActive" value={isActive ? "true" : "false"} />

      {state.error && (
        <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.error}</div>
      )}

      <FormSection title="Slayt İçeriği" icon={TagIcon} accent="violet">
        <div>
          <label className={labelClass}>Arka Plan Görseli</label>
          {imageUrl ? (
            <div className="group relative aspect-[16/6] w-full max-w-2xl overflow-hidden rounded-lg bg-slate-100">
              <Image src={imageUrl} alt="" fill className="object-cover" sizes="672px" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                aria-label="Görseli kaldır"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-soft hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading}
              className="flex aspect-[16/6] w-full max-w-2xl flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? <SpinnerIcon className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
              {uploading ? "Yükleniyor..." : "Banner Görseli Yükle"}
              <span className="text-xs font-normal text-slate-400">Geniş (yatay) görseller önerilir · JPG, PNG, WEBP · maks. 8MB</span>
            </button>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageFile(file);
              e.target.value = "";
            }}
          />
          {state.fieldErrors?.imageUrl && <p className={errorClass}>{state.fieldErrors.imageUrl[0]}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="title">
            Başlık
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={initialSlide?.title}
            placeholder="Örn: Aracını Saniyeler İçinde İlana Çevir"
            className={inputClass}
          />
          {state.fieldErrors?.title && <p className={errorClass}>{state.fieldErrors.title[0]}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="subtitle">
            Alt Metin <span className="font-normal text-slate-400">(opsiyonel)</span>
          </label>
          <input
            id="subtitle"
            name="subtitle"
            defaultValue={initialSlide?.subtitle ?? ""}
            placeholder="Örn: Yapay zeka destekli, güvenli ve ücretsiz ilan deneyimi."
            className={inputClass}
          />
          {state.fieldErrors?.subtitle && <p className={errorClass}>{state.fieldErrors.subtitle[0]}</p>}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="buttonText">
              Buton Metni <span className="font-normal text-slate-400">(opsiyonel)</span>
            </label>
            <input
              id="buttonText"
              name="buttonText"
              defaultValue={initialSlide?.buttonText ?? ""}
              placeholder="Örn: Hemen İlan Ver"
              className={inputClass}
            />
            {state.fieldErrors?.buttonText && <p className={errorClass}>{state.fieldErrors.buttonText[0]}</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="buttonLink">
              Buton Linki <span className="font-normal text-slate-400">(opsiyonel)</span>
            </label>
            <input
              id="buttonLink"
              name="buttonLink"
              defaultValue={initialSlide?.buttonLink ?? ""}
              placeholder="Örn: /ilan-ver"
              className={`${inputClass} font-mono`}
            />
            <p className="mt-1 text-xs text-slate-400">Site içi yol (/ilan-ver) veya tam adres (https://...).</p>
            {state.fieldErrors?.buttonLink && <p className={errorClass}>{state.fieldErrors.buttonLink[0]}</p>}
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
          />
          <span className="text-sm">
            <span className="font-semibold text-foreground">Aktif</span>
            <span className="ml-1 text-slate-500">— işaretliyse slayt ana sayfada gösterilir.</span>
          </span>
        </label>
      </FormSection>

      <button
        type="submit"
        disabled={pending || !imageUrl}
        className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <SpinnerIcon className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}
