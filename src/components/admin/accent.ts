export type Accent = "emerald" | "indigo" | "amber" | "blue" | "slate" | "red" | "violet";

export const ACCENT_ICON_STYLES: Record<Accent, string> = {
  emerald: "bg-emerald-100 text-emerald-600",
  indigo: "bg-indigo-100 text-indigo-600",
  amber: "bg-amber-100 text-amber-600",
  blue: "bg-blue-100 text-blue-600",
  slate: "bg-slate-100 text-slate-600",
  red: "bg-red-100 text-red-600",
  violet: "bg-violet-100 text-violet-600",
};

export const ACCENT_GLOW_STYLES: Record<Accent, string> = {
  emerald: "from-emerald-400/20",
  indigo: "from-indigo-400/20",
  amber: "from-amber-400/20",
  blue: "from-blue-400/20",
  slate: "from-slate-400/20",
  red: "from-red-400/20",
  violet: "from-violet-400/20",
};
