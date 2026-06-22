"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { Mail, Phone, User } from "lucide-react";
import { checkEmailExistsAction, registerAction, type RegisterState } from "./actions";
import { AlertIcon, SpinnerIcon } from "@/components/icons";
import { AuthInput } from "@/components/auth-input";
import { AuthPasswordInput } from "@/components/auth-password-input";
import { PasswordStrengthMeter } from "@/components/password-strength-meter";
import { SocialAuthButtons } from "@/components/social-auth-buttons";

const initialState: RegisterState = {};
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [checking, startChecking] = useTransition();
  const [password, setPassword] = useState("");

  function handleContinue() {
    setEmailNotice(null);
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setEmailNotice("Geçerli bir e-posta adresi girin.");
      return;
    }
    startChecking(async () => {
      const result = await checkEmailExistsAction(trimmed);
      if (result.exists) {
        setEmailNotice("Bu e-posta adresiyle zaten bir hesap var.");
        return;
      }
      setStep(2);
    });
  }

  // 1. ADIM: sahibinden tarzı sade başlangıç - sadece e-posta.
  if (step === 1) {
    return (
      <div className="space-y-4">
        <AuthInput
          id="email"
          name="email"
          type="email"
          label="E-posta"
          icon={Mail}
          autoComplete="email"
          required
          placeholder="ornek@eposta.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleContinue();
            }
          }}
        />
        {emailNotice && (
          <p className="flex items-center gap-1.5 text-sm text-red-600">
            <AlertIcon className="h-4 w-4 shrink-0" />
            {emailNotice}{" "}
            {emailNotice.includes("zaten") && (
              <Link href="/giris" className="font-semibold text-brand hover:text-accent-dark">
                Giriş yap
              </Link>
            )}
          </p>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={checking}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {checking && <SpinnerIcon className="h-4 w-4 animate-spin" />}
          {checking ? "Kontrol ediliyor..." : "E-posta ile Hesap Aç"}
        </button>

        <SocialAuthButtons actionLabel="ile hesap aç" />

        <p className="text-center text-sm text-slate-500">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="font-semibold text-brand hover:text-accent-dark">
            Giriş Yap
          </Link>
        </p>
      </div>
    );
  }

  // 2. ADIM: e-posta onaylandı, kalan bilgiler isteniyor.
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="email" value={email} />

      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2.5 text-sm">
        <span className="truncate text-slate-600">{email}</span>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="shrink-0 font-semibold text-brand hover:text-accent-dark"
        >
          Değiştir
        </button>
      </div>

      {state.error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertIcon className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}
      {state.fieldErrors?.email && <p className="text-sm text-red-600">{state.fieldErrors.email[0]}</p>}

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
        {pending ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
      </button>
    </form>
  );
}
