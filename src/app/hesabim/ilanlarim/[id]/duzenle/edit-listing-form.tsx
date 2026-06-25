"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FormSection, errorClass, inputClass, labelClass, selectClass } from "@/components/form-ui";
import { LocationSelect } from "@/components/location-select";
import { PencilIcon } from "@/components/icons";
import { CONDITION_VALUES } from "@/lib/validation";
import { updateListingAction, type EditListingFormState } from "../../actions";

type EditListingFormProps = {
  listing: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    condition: string | null;
    brand: string | null;
    il: string;
    ilce: string;
  };
};

const initialState: EditListingFormState = {};

export function EditListingForm({ listing }: EditListingFormProps) {
  const action = updateListingAction.bind(null, listing.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <FormSection title="İlan Bilgileri" icon={PencilIcon} accent="blue">
        {state.error && <p className={errorClass}>{state.error}</p>}

        <div>
          <label htmlFor="title" className={labelClass}>
            Başlık
          </label>
          <input id="title" name="title" type="text" defaultValue={listing.title} required className={inputClass} />
          {state.fieldErrors?.title && <p className={errorClass}>{state.fieldErrors.title[0]}</p>}
        </div>

        <div>
          <label htmlFor="price" className={labelClass}>
            Fiyat (TL)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={1}
            step="1"
            defaultValue={listing.price}
            required
            className={inputClass}
          />
          {state.fieldErrors?.price && <p className={errorClass}>{state.fieldErrors.price[0]}</p>}
        </div>

        {listing.brand === null && (
          <div>
            <label htmlFor="condition" className={labelClass}>
              Durum
            </label>
            <select id="condition" name="condition" defaultValue={listing.condition ?? ""} className={selectClass}>
              <option value="">Belirtilmemiş</option>
              {CONDITION_VALUES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {state.fieldErrors?.condition && <p className={errorClass}>{state.fieldErrors.condition[0]}</p>}
          </div>
        )}

        <div>
          <label htmlFor="description" className={labelClass}>
            Açıklama
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            defaultValue={listing.description ?? ""}
            className={inputClass}
          />
          {state.fieldErrors?.description && <p className={errorClass}>{state.fieldErrors.description[0]}</p>}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <LocationSelect defaultIl={listing.il} defaultIlce={listing.ilce} required />
        </div>
        {(state.fieldErrors?.il || state.fieldErrors?.ilce) && (
          <p className={errorClass}>{state.fieldErrors.il?.[0] ?? state.fieldErrors.ilce?.[0]}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-brand shadow-sm transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Kaydediliyor..." : "Kaydet"}
          </button>
          <Link
            href="/hesabim/ilanlarim"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Vazgeç
          </Link>
        </div>
      </FormSection>
    </form>
  );
}
