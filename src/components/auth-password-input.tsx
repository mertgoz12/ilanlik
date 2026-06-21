"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

type AuthPasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function AuthPasswordInput({ label, error, id, className, ...inputProps }: AuthPasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <Lock className="h-4.5 w-4.5" />
        </span>
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={`w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-11 text-sm text-foreground placeholder:text-slate-400 transition-colors focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10 ${
            error ? "border-red-300" : "border-slate-200"
          } ${className ?? ""}`}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
        >
          {visible ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
