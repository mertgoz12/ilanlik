"use client";

import { useActionState, useEffect, useRef } from "react";
import { useToast } from "@/components/admin/toast";
import { FormSection, errorClass, inputClass, labelClass } from "@/components/form-ui";
import { ShieldCheckIcon } from "@/components/icons";
import { changePasswordAction, type PasswordFormState } from "./actions";

const initialState: PasswordFormState = {};

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      showToast({ variant: "success", message: "Şifreniz güncellendi." });
      formRef.current?.reset();
    }
  }, [state.success, showToast]);

  return (
    <form ref={formRef} action={formAction}>
      <FormSection
        title="Şifre Değiştir"
        description="Hesap güvenliğiniz için güçlü bir şifre seçin."
        icon={ShieldCheckIcon}
        accent="indigo"
      >
        {state.error && <p className={errorClass}>{state.error}</p>}

        <div>
          <label htmlFor="currentPassword" className={labelClass}>
            Mevcut Şifre
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
          {state.fieldErrors?.currentPassword && (
            <p className={errorClass}>{state.fieldErrors.currentPassword[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="newPassword" className={labelClass}>
            Yeni Şifre
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={inputClass}
          />
          {state.fieldErrors?.newPassword && <p className={errorClass}>{state.fieldErrors.newPassword[0]}</p>}
        </div>

        <div>
          <label htmlFor="newPasswordConfirm" className={labelClass}>
            Yeni Şifre (Tekrar)
          </label>
          <input
            id="newPasswordConfirm"
            name="newPasswordConfirm"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={inputClass}
          />
          {state.fieldErrors?.newPasswordConfirm && (
            <p className={errorClass}>{state.fieldErrors.newPasswordConfirm[0]}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-brand shadow-sm transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </div>
      </FormSection>
    </form>
  );
}
