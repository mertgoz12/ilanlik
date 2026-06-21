"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Mail, Phone, User } from "lucide-react";
import { registerAction, type RegisterState } from "./actions";
import { AlertIcon, SpinnerIcon } from "@/components/icons";
import { AuthInput } from "@/components/auth-input";
import { AuthPasswordInput } from "@/components/auth-password-input";
import { PasswordStrengthMeter } from "@/components/password-strength-meter";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  const [password, setPassword] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertIcon className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <AuthInput
        id="name"
        name="name"
        type="text"
        label="Ad Soyad"
        icon={User}
        autoComplete="name"
        required
        placeholder="Adınız Soyadınız"
        error={state.fieldErrors?.name?.[0]}
      />

      <AuthInput
        id="email"
        name="email"
        type="email"
        label="E-posta"
        icon={Mail}
        autoComplete="email"
        required
        placeholder="ornek@eposta.com"
        error={state.fieldErrors?.email?.[0]}
      />

      <AuthInput
        id="phone"
        name="phone"
        type="tel"
        label="Telefon (opsiyonel)"
        icon={Phone}
        autoComplete="tel"
        placeholder="05xx xxx xx xx"
        error={state.fieldErrors?.phone?.[0]}
      />

      <div>
        <AuthPasswordInput
          id="password"
          name="password"
          label="Şifre"
          autoComplete="new-password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={state.fieldErrors?.password?.[0]}
        />
        <PasswordStrengthMeter password={password} />
      </div>

      <AuthPasswordInput
        id="passwordConfirm"
        name="passwordConfirm"
        label="Şifre (Tekrar)"
        autoComplete="new-password"
        required
        placeholder="••••••••"
        error={state.fieldErrors?.passwordConfirm?.[0]}
      />

      <div>
        <label className="flex items-start gap-2.5 text-sm text-slate-600">
          <input
            type="checkbox"
            name="termsAccepted"
            required
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand focus:ring-brand/30"
          />
          <span>
            <Link href="/kullanim-kosullari" className="font-semibold text-brand hover:text-accent-dark">
              Kullanım Koşulları
            </Link>{" "}
            ve{" "}
            <Link href="/kvkk" className="font-semibold text-brand hover:text-accent-dark">
              KVKK
            </Link>{" "}
            metnini okudum, kabul ediyorum.
          </span>
        </label>
        {state.fieldErrors?.termsAccepted && (
          <p className="mt-1.5 text-sm text-red-600">{state.fieldErrors.termsAccepted[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <SpinnerIcon className="h-4 w-4 animate-spin" />}
        {pending ? "Hesap oluşturuluyor..." : "Üye Ol"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Zaten hesabın var mı?{" "}
        <Link href="/giris" className="font-semibold text-brand hover:text-accent-dark">
          Giriş Yap
        </Link>
      </p>
    </form>
  );
}
