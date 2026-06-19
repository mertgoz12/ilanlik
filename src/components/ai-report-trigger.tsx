"use client";

import { useActionState } from "react";
import { generateAiReportAction, type GenerateAiReportState } from "@/app/ilan/[listingNo]/actions";
import type { AiReportPricingMode } from "@/lib/analysis-config";
import { SparkleIcon } from "./icons";

const initialState: GenerateAiReportState = {};

const BUTTON_LABELS: Record<AiReportPricingMode, string> = {
  ucretsiz: "Ücretsiz Yapay Zeka Ekspertiz Raporu Oluştur",
  ucretli: "Detaylı Yapay Zeka Raporu Oluştur",
};

export function AiReportTrigger({
  listingNo,
  pricingMode,
}: {
  listingNo: string;
  pricingMode: AiReportPricingMode;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prevState: GenerateAiReportState, _formData: FormData) => generateAiReportAction(listingNo),
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <SparkleIcon className="h-4 w-4" />
        {pending ? "Rapor oluşturuluyor..." : BUTTON_LABELS[pricingMode]}
      </button>
      {state.error && (
        <p className={`text-sm ${state.paymentRequired ? "text-slate-500" : "text-red-600"}`}>{state.error}</p>
      )}
    </form>
  );
}
