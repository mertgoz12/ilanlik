"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AuthPasswordInput } from "@/components/auth-password-input";
import { PasswordStrengthMeter } from "@/components/password-strength-meter";
import { AlertIcon, CheckCircleIcon, SpinnerIcon } from "@/components/icons";
import { resetPasswordAction, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const action = resetPasswordAction.bind(null, token);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [password, setPassword] = useState("");

  if (state.success) {
    return (
      <div className="space-y-4 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircleIcon className="h-6 w-6" />
        </span>
        <p className="text-sm text-slate-600">
          Şifreniz başarıyla güncellendi. Şimdi yeni şifrenizle giriş yapabilirsiniz.
        </p>
        <Link
          href="/giris"
          className="inline-flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-900"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertIcon className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div>
        <AuthPasswordInput
          id="password"
          name="password"
          label="Yeni Şifre"
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
        label="Yeni Şifre (Tekrar)"
        autoComplete="new-password"
        required
        placeholder="••••••••"
        error={state.fieldErrors?.passwordConfirm?.[0]}
      />

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <SpinnerIcon className="h-4 w-4 animate-spin" />}
        {pending ? "Kaydediliyor..." : "Şifreyi Güncelle"}
      </button>
    </form>
  );
}
