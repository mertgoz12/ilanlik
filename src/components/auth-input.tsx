import type { ComponentType, InputHTMLAttributes } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: ComponentType<{ className?: string }>;
  error?: string;
};

export function AuthInput({ label, icon: Icon, error, id, className, ...inputProps }: AuthInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <input
          id={id}
          className={`w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-slate-400 transition-colors focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10 ${
            error ? "border-red-300" : "border-slate-200"
          } ${className ?? ""}`}
          {...inputProps}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
