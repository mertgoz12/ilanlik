import { CheckIcon } from "@/components/icons";

const STEPS = [
  { n: 1, label: "Kategori" },
  { n: 2, label: "Fotoğraflar" },
  { n: 3, label: "Detaylar" },
  { n: 4, label: "Konum" },
  { n: 5, label: "Önizleme" },
] as const;

// /ilan-ver akışının üst ilerleme göstergesi. current = aktif adım (1-5);
// önceki adımlar tamamlanmış (tik) olarak işaretlenir.
export function StepProgress({ current }: { current: number }) {
  return (
    <nav
      aria-label="İlan verme adımları"
      className="rounded-2xl bg-white p-4 shadow-soft sm:p-5"
    >
      <ol className="flex items-center">
        {STEPS.map((step, i) => {
          const done = step.n < current;
          const active = step.n === current;
          const isLast = i === STEPS.length - 1;
          return (
            <li
              key={step.n}
              className={`flex items-center ${isLast ? "" : "flex-1"}`}
            >
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 ${
                    done
                      ? "bg-brand text-white"
                      : active
                        ? "bg-brand text-white ring-4 ring-accent/30"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {done ? <CheckIcon className="h-4.5 w-4.5" /> : step.n}
                </span>
                <span
                  className={`whitespace-nowrap text-[10px] font-semibold sm:text-xs ${
                    active
                      ? "text-brand"
                      : done
                        ? "text-brand-600"
                        : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <span
                  className={`mx-1.5 -mt-5 h-0.5 flex-1 rounded-full transition-colors duration-200 sm:mx-2.5 ${
                    done ? "bg-brand" : "bg-slate-200"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
