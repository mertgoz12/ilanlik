import type { ComponentType } from "react";
import { TrendDownIcon, TrendUpIcon } from "@/components/icons";
import { ACCENT_GLOW_STYLES, ACCENT_ICON_STYLES, type Accent } from "./accent";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  highlight?: boolean;
  icon?: ComponentType<{ className?: string }>;
  accent?: Accent;
  trend?: { direction: "up" | "down"; label: string };
};

export function StatCard({ label, value, hint, highlight, icon: Icon, accent = "emerald", trend }: StatCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border p-5 shadow-soft transition-shadow hover:shadow-soft-lg ${
        highlight ? "border-amber-200 bg-amber-50" : "border-slate-100 bg-white"
      }`}
    >
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${ACCENT_GLOW_STYLES[accent]} to-transparent blur-2xl transition-transform duration-300 group-hover:scale-110`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{value}</p>
        </div>
        {Icon && (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ACCENT_ICON_STYLES[accent]}`}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      {(hint || trend) && (
        <div className="relative mt-2 flex items-center gap-1.5">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                trend.direction === "up" ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {trend.direction === "up" ? <TrendUpIcon className="h-3.5 w-3.5" /> : <TrendDownIcon className="h-3.5 w-3.5" />}
              {trend.label}
            </span>
          )}
          {hint && <p className="text-xs text-slate-400">{hint}</p>}
        </div>
      )}
    </div>
  );
}
