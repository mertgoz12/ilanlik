import { TRUST_TONE_COLORS, trustScoreTone } from "@/lib/trust";

const SIZES = {
  sm: { box: 40, stroke: 4, font: "text-[11px]" },
  md: { box: 56, stroke: 5, font: "text-sm" },
  lg: { box: 112, stroke: 8, font: "text-3xl" },
} as const;

type TrustBadgeProps = {
  score: number;
  size?: keyof typeof SIZES;
  className?: string;
};

export function TrustBadge({ score, size = "md", className = "" }: TrustBadgeProps) {
  const { box, stroke, font } = SIZES[size];
  const tone = trustScoreTone(score);
  const colors = TRUST_TONE_COLORS[tone];

  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: box, height: box }}
    >
      <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} className="-rotate-90">
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={`absolute font-bold ${font} ${colors.text}`}>{score}</span>
    </div>
  );
}
