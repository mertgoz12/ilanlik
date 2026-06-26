import type { ComponentType } from "react";
import { ACCENT_ICON_STYLES, type Accent } from "@/components/admin/accent";

export const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

export const selectClass = inputClass + " appearance-none";

export const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export const errorClass = "mt-1 text-sm text-red-600";

export function FormSection({
  title,
  description,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  accent?: Accent;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-soft sm:p-8">
      <div className="mb-6 flex items-start gap-3">
        {Icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ACCENT_ICON_STYLES[accent ?? "emerald"]}`}>
            <Icon className="h-4.5 w-4.5" />
          </span>
        )}
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
