"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveSearchAction, type SaveSearchFormState } from "@/lib/social-actions";
import { errorClass, inputClass } from "./form-ui";
import { BellIcon, CheckIcon } from "./icons";

const initialState: SaveSearchFormState = {};

export function SaveSearchButton({ query, isLoggedIn }: { query: string; isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(saveSearchAction, initialState);

  if (!isLoggedIn) {
    return (
      <Link
        href={`/giris?callbackUrl=${encodeURIComponent("/")}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
      >
        <BellIcon className="h-4 w-4" />
        Aramayı Kaydet
      </Link>
    );
  }

  if (state.success) {
    return (
      <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
        <CheckIcon className="h-4 w-4" />
        Arama kaydedildi
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
      >
        <BellIcon className="h-4 w-4" />
        Aramayı Kaydet
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="query" value={query} />
      <input
        name="label"
        type="text"
        required
        maxLength={80}
        placeholder="Bu arama için bir ad girin"
        className={`${inputClass} w-56`}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-brand shadow-sm transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Kaydediliyor..." : "Kaydet"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-xs font-semibold text-slate-500 hover:text-slate-700"
      >
        Vazgeç
      </button>
      {state.error && <p className={`${errorClass} w-full`}>{state.error}</p>}
    </form>
  );
}
