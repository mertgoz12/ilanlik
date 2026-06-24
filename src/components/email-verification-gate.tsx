"use client";

import { useActionState } from "react";
import { AlertIcon, SpinnerIcon } from "@/components/icons";
import {
  resendVerificationEmailAction,
  type ResendVerificationState,
} from "@/lib/actions/email-verification-actions";

const initialState: ResendVerificationState = {};

// İlan ver sayfasında e-postası doğrulanmamış kullanıcıya gösterilen
// engelleyici uyarı - formun yerine geçer, kullanıcı doğrulamadan ilan
// veremez (gerçek yetki kontrolü server action'larda da tekrarlanır).
export function EmailVerificationGate() {
  const [state, formAction, pending] = useActionState(
    async (_prevState: ResendVerificationState, _formData: FormData) => resendVerificationEmailAction(),
    initialState,
  );

  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-white p-8 text-center shadow-soft">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-brand">
        <AlertIcon className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-foreground">E-postanı Doğrulamalısın</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        İlan verebilmek için önce e-posta adresini doğrulaman gerekiyor. Kayıt olurken gönderdiğimiz
        e-postadaki bağlantıya tıkla.
      </p>
      {state.ok ? (
        <p className="mt-4 text-sm font-medium text-emerald-600">Doğrulama e-postası tekrar gönderildi.</p>
      ) : (
        <form action={formAction} className="mt-4">
          {state.error && <p className="mb-2 text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending && <SpinnerIcon className="h-4 w-4 animate-spin" />}
            {pending ? "Gönderiliyor..." : "Doğrulama E-postasını Tekrar Gönder"}
          </button>
        </form>
      )}
    </div>
  );
}
