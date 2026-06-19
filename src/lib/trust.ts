export type TrustTone = "good" | "medium" | "bad";

export function trustScoreTone(score: number): TrustTone {
  if (score >= 80) return "good";
  if (score >= 50) return "medium";
  return "bad";
}

export const TRUST_TONE_COLORS: Record<TrustTone, { stroke: string; text: string; bg: string }> = {
  good: { stroke: "#10b981", text: "text-emerald-700", bg: "bg-emerald-50" },
  medium: { stroke: "#f59e0b", text: "text-amber-700", bg: "bg-amber-50" },
  bad: { stroke: "#ef4444", text: "text-red-700", bg: "bg-red-50" },
};
