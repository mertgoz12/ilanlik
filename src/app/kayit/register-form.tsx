"use client";

import { useActionState } from "react";
import { registerAction, type RegisterState } from "./actions";
import { AlertIcon } from "@/components/icons";
import { errorClass, inputClass, labelClass } from "@/components/form-ui";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertIcon className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="name" className={labelClass}>
          Ad Soyad
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className={inputClass}
          placeholder="Adınız Soyadınız"
        />
        {state.fieldErrors?.name && (
          <p className={errorClass}>{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
          placeholder="ornek@eposta.com"
        />
        {state.fieldErrors?.email && (
          <p className={errorClass}>{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          Telefon <span className="font-normal text-slate-400">(opsiyonel)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className={inputClass}
          placeholder="05xx xxx xx xx"
        />
        {state.fieldErrors?.phone && (
          <p className={errorClass}>{state.fieldErrors.phone[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className={labelClass}>
            Şifre
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className={inputClass}
            placeholder="••••••••"
          />
          {state.fieldErrors?.password && (
            <p className={errorClass}>{state.fieldErrors.password[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="passwordConfirm" className={labelClass}>
            Şifre (Tekrar)
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            required
            className={inputClass}
            placeholder="••••••••"
          />
          {state.fieldErrors?.passwordConfirm && (
            <p className={errorClass}>{state.fieldErrors.passwordConfirm[0]}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Hesap oluşturuluyor..." : "Üye Ol"}
      </button>
    </form>
  );
}
