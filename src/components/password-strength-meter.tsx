const LEVELS = [
  { label: "Zayıf", barColor: "bg-red-400", textColor: "text-red-600" },
  { label: "Orta", barColor: "bg-amber-400", textColor: "text-amber-600" },
  { label: "İyi", barColor: "bg-sky-400", textColor: "text-sky-600" },
  { label: "Güçlü", barColor: "bg-emerald-500", textColor: "text-emerald-600" },
] as const;

function scorePassword(password: string): number {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, LEVELS.length - 1);
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const score = scorePassword(password);
  const level = LEVELS[score];

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {LEVELS.map((item, index) => (
          <span
            key={item.label}
            className={`h-1.5 flex-1 rounded-full transition-colors ${index <= score ? level.barColor : "bg-slate-200"}`}
          />
        ))}
      </div>
      <p className={`mt-1 text-xs font-medium ${level.textColor}`}>Şifre gücü: {level.label}</p>
    </div>
  );
}
