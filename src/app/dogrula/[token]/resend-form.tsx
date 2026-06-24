"use client";

import { useActionState } from "react";
import { SpinnerIcon } from "@/components/icons";
import {
  resendVerificationEmailByAddressAction,
  type ResendVerificationState,
} from "@/lib/actions/email-verification-actions";

const initialState: ResendVerificationState = {};

export function ResendVerificationForm() {
  const [state, formAction, pending] = useActionState(resendVerificationEmailByAddressAction, initialState);

  if (state.ok) {
    return (
      <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        E-posta adresinize kayıtlıysa yeni bir doğrulama bağlantısı gönderildi.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2.5">
      <input
        type="email"
        name="email"
        required
        placeholder="ornek@eposta.com"
        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-foreground placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <SpinnerIcon className="h-4 w-4 animate-spin" />}
        {pending ? "Gönderiliyor..." : "Yeni Bağlantı Gönder"}
      </button>
    </form>
  );
}
