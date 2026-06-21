"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { loginAction, type LoginState } from "./actions";
import { AlertIcon, SpinnerIcon } from "@/components/icons";
import { AuthInput } from "@/components/auth-input";
import { AuthPasswordInput } from "@/components/auth-password-input";

const initialState: LoginState = {};

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />

      {state.error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertIcon className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

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

      <AuthPasswordInput
        id="password"
        name="password"
        label="Şifre"
        autoComplete="current-password"
        required
        placeholder="••••••••"
        error={state.fieldErrors?.password?.[0]}
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            name="rememberMe"
            defaultChecked
            className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand/30"
          />
          Beni hatırla
        </label>
        <Link href="/sifremi-unuttum" className="text-sm font-medium text-brand hover:text-accent-dark">
          Şifremi unuttum
        </Link>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <SpinnerIcon className="h-4 w-4 animate-spin" />}
        {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Hesabın yok mu?{" "}
        <Link href="/kayit" className="font-semibold text-brand hover:text-accent-dark">
          Üye Ol
        </Link>
      </p>
    </form>
  );
}
