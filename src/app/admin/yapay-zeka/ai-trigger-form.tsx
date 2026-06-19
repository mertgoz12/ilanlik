"use client";

import { useActionState } from "react";
import { inputClass, labelClass } from "@/components/form-ui";
import { AlertIcon, CheckCircleIcon, SparkleIcon, SpinnerIcon } from "@/components/icons";
import { triggerAiReportAction, type TriggerAiReportState } from "./actions";

const initialState: TriggerAiReportState = {};

export function AiTriggerForm() {
  const [state, formAction, pending] = useActionState(triggerAiReportAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="listingNo" className={labelClass}>
          İlan Numarası
        </label>
        <input
          id="listingNo"
          name="listingNo"
          type="text"
          required
          placeholder="Örn: 1313717965"
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <SpinnerIcon className="h-4 w-4 animate-spin-slow" /> : <SparkleIcon className="h-4 w-4" />}
        {pending ? "Oluşturuluyor..." : "Raporu Tetikle"}
      </button>

      {state.error && (
        <p className="flex items-start gap-1.5 text-sm text-red-600 sm:basis-full">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="flex items-start gap-1.5 text-sm text-emerald-700 sm:basis-full">
          <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {state.success}
        </p>
      )}
    </form>
  );
}
