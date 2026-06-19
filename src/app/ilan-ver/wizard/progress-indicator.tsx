import { CheckIcon } from "@/components/icons";

export const STEP_LABELS = ["Araç Bilgileri", "Parça Durumu", "Donanım", "Fotoğraf ve Açıklama", "Fiyat ve Önizleme"];

export function ProgressIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-start">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isCompleted = step < current;
        const isLast = i === STEP_LABELS.length - 1;

        return (
          <li key={step} className={`flex items-start ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : isCompleted
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {isCompleted ? <CheckIcon className="h-4 w-4" /> : step}
              </span>
              <span
                className={`hidden text-center text-xs font-medium sm:inline ${
                  isActive ? "text-emerald-700" : isCompleted ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div className={`mt-4 h-px flex-1 ${isCompleted ? "bg-emerald-300" : "bg-slate-200"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
