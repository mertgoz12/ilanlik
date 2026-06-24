"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { AuthInput } from "@/components/auth-input";
import { SpinnerIcon } from "@/components/icons";
import { requestPasswordResetAction, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  if (state.sent) {
    return (
      <div className="space-y-4 text-center">
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          E-posta adresiniz sistemde kayıtlıysa, şifre sıfırlama bağlantısını gönderdik. Gelen kutunuzu
          (ve spam klasörünü) kontrol edin.
        </p>
        <Link href="/giris" className="text-sm font-semibold text-brand hover:text-accent-dark">
          Giriş sayfasına dön
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <AuthInput
        id="email"
        name="email"
        type="email"
        label="E-posta"
        icon={Mail}
        autoComplete="email"
        required
        placeholder="ornek@eposta.com"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <SpinnerIcon className="h-4 w-4 animate-spin" />}
        {pending ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
      </button>

      <p className="text-center text-sm text-slate-500">
        <Link href="/giris" className="font-semibold text-brand hover:text-accent-dark">
          Giriş sayfasına dön
        </Link>
      </p>
    </form>
  );
}
