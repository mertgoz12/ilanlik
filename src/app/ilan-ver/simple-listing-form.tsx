"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createSimpleListingAction, type SimpleListingFormState } from "./actions";
import { ImagePicker } from "@/components/image-picker";
import { LocationSelect } from "@/components/location-select";
import { errorClass, FormSection, inputClass, labelClass } from "@/components/form-ui";
import { AlertIcon } from "@/components/icons";

const initialState: SimpleListingFormState = {};

export function SimpleListingForm({ categoryId }: { categoryId: string }) {
  const [state, formAction, pending] = useActionState(createSimpleListingAction, initialState);

  if (state.priceWarning) {
    return (
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
        <Link
          href={`/ilan/${state.listingNo}`}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
        >
          İlanı Görüntüle
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="categoryId" value={categoryId} />

      {state.error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertIcon className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <FormSection title="İlan Bilgileri" description="İlanınızın temel bilgilerini girin.">
        <div>
          <label htmlFor="title" className={labelClass}>
            İlan Başlığı
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            minLength={5}
            placeholder="Örn: Eşyalı 2+1 Kiralık Daire"
            className={inputClass}
          />
          {state.fieldErrors?.title && <p className={errorClass}>{state.fieldErrors.title[0]}</p>}
        </div>

        <div>
          <label htmlFor="price" className={labelClass}>
            Fiyat (₺)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            min={1}
            step={1}
            placeholder="15000"
            className={inputClass}
          />
          {state.fieldErrors?.price && <p className={errorClass}>{state.fieldErrors.price[0]}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LocationSelect required />
          {state.fieldErrors?.il && <p className={errorClass}>{state.fieldErrors.il[0]}</p>}
          {state.fieldErrors?.ilce && <p className={errorClass}>{state.fieldErrors.ilce[0]}</p>}
        </div>
      </FormSection>

      <FormSection title="Açıklama">
        <div>
          <label htmlFor="description" className={labelClass}>
            İlan Açıklaması <span className="font-normal text-slate-400">(opsiyonel)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            placeholder="İlanınız hakkında alıcılara aktarmak istediğiniz detayları yazın..."
            className={inputClass}
          />
          {state.fieldErrors?.description && (
            <p className={errorClass}>{state.fieldErrors.description[0]}</p>
          )}
        </div>
      </FormSection>

      <FormSection title="Fotoğraflar" description="İlanınızın fotoğraflarını ekleyin.">
        <ImagePicker />
      </FormSection>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "İlan yayınlanıyor..." : "İlanı Yayınla"}
        </button>
      </div>
    </form>
  );
}
