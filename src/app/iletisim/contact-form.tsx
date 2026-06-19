"use client";

import { useActionState } from "react";
import { submitContactMessage, type ContactFormState } from "./actions";
import { errorClass, inputClass, labelClass } from "@/components/form-ui";
import { CheckCircleIcon, AlertIcon } from "@/components/icons";

const initialState: ContactFormState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactMessage, initialState);

  if (state.success) {
    return (
      <div className="flex items-start gap-3 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
        <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-600" />
        <p>Mesajınız bize ulaştı. En kısa sürede size dönüş yapacağız.</p>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Ad Soyad
          </label>
          <input id="name" name="name" type="text" required className={inputClass} placeholder="Adınız Soyadınız" />
          {state.fieldErrors?.name && <p className={errorClass}>{state.fieldErrors.name[0]}</p>}
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            E-posta
          </label>
          <input id="email" name="email" type="email" required className={inputClass} placeholder="ornek@eposta.com" />
          {state.fieldErrors?.email && <p className={errorClass}>{state.fieldErrors.email[0]}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="subject" className={labelClass}>
          Konu
        </label>
        <input id="subject" name="subject" type="text" required className={inputClass} placeholder="Mesajınızın konusu" />
        {state.fieldErrors?.subject && <p className={errorClass}>{state.fieldErrors.subject[0]}</p>}
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Mesaj
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={inputClass}
          placeholder="Mesajınızı buraya yazın..."
        />
        {state.fieldErrors?.message && <p className={errorClass}>{state.fieldErrors.message[0]}</p>}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Gönderiliyor..." : "Mesaj Gönder"}
      </button>
    </form>
  );
}
