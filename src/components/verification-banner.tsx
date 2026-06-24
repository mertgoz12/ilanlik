"use client";

import { useActionState } from "react";
import { AlertIcon, SpinnerIcon } from "@/components/icons";
import {
  resendVerificationEmailAction,
  type ResendVerificationState,
} from "@/lib/actions/email-verification-actions";

const initialState: ResendVerificationState = {};

// Hesabım > Özet sayfasında e-postası doğrulanmamış kullanıcıya gösterilen
// kompakt hatırlatma şeridi - ilan-ver/page.tsx'teki EmailVerificationGate'in
// daha küçük, engellemeyen bir versiyonu.
export function VerificationBanner() {
  const [state, formAction, pending] = useActionState(
    async (_prevState: ResendVerificationState, _formData: FormData) => resendVerificationEmailAction(),
    initialState,
  );

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-accent/30 bg-accent-light px-4 py-3 text-sm text-brand sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5">
        <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          E-posta adresini henüz doğrulamadın. Doğrulamadan <strong className="font-semibold">ilan veremezsin</strong>.
        </p>
      </div>

      {state.ok ? (
        <span className="shrink-0 text-xs font-semibold text-emerald-700">Tekrar gönderildi ✓</span>
      ) : (
        <form action={formAction} className="shrink-0">
          {state.error && <p className="mb-1 text-xs text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending && <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />}
            {pending ? "Gönderiliyor..." : "Tekrar Gönder"}
          </button>
        </form>
      )}
    </div>
  );
}
