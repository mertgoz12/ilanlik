"use client";

import { useActionState, useEffect } from "react";
import { useToast } from "@/components/admin/toast";
import { FormSection, errorClass, inputClass, labelClass } from "@/components/form-ui";
import { LocationSelect } from "@/components/location-select";
import { UserIcon } from "@/components/icons";
import { AvatarForm } from "./avatar-form";
import { updateProfileAction, type ProfileFormState } from "./actions";

const initialState: ProfileFormState = {};

type ProfileFormProps = {
  name: string;
  email: string;
  phone: string | null;
  il: string | null;
  ilce: string | null;
  avatarUrl: string | null;
};

export function ProfileForm({ name, email, phone, il, ilce, avatarUrl }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
  const { showToast } = useToast();

  useEffect(() => {
    if (state.success) {
      showToast({ variant: "success", message: "Profil bilgileriniz güncellendi." });
    }
  }, [state.success, showToast]);

  return (
    <form action={formAction}>
      <FormSection
        title="Profil Bilgileri"
        description="Hesabınızla ilişkili temel bilgiler."
        icon={UserIcon}
      >
        <AvatarForm avatarUrl={avatarUrl} name={name} />

        {state.error && <p className={errorClass}>{state.error}</p>}

        <div>
          <label htmlFor="name" className={labelClass}>
            Ad Soyad
          </label>
          <input id="name" name="name" type="text" defaultValue={name} required className={inputClass} />
          {state.fieldErrors?.name && <p className={errorClass}>{state.fieldErrors.name[0]}</p>}
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            E-posta
          </label>
          <input id="email" type="email" value={email} disabled className={inputClass} />
          <p className="mt-1 text-xs text-slate-400">
            E-posta adresinizi değiştirmek için destek ile iletişime geçin.
          </p>
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Telefon
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={phone ?? ""}
            placeholder="05XX XXX XX XX"
            className={inputClass}
          />
          {state.fieldErrors?.phone && <p className={errorClass}>{state.fieldErrors.phone[0]}</p>}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <LocationSelect defaultIl={il ?? ""} defaultIlce={ilce ?? ""} />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-brand shadow-sm transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </FormSection>
    </form>
  );
}
