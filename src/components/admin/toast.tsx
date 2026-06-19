"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircleIcon, CloseIcon, InfoIcon, XCircleIcon } from "@/components/icons";

export type ToastVariant = "success" | "error" | "info";

export type ToastInput = {
  variant?: ToastVariant;
  title?: string;
  message: string;
};

type ToastItem = ToastInput & { id: number };

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<
  ToastVariant,
  { icon: typeof CheckCircleIcon; wrap: string; iconWrap: string }
> = {
  success: {
    icon: CheckCircleIcon,
    wrap: "border-emerald-200",
    iconWrap: "bg-emerald-100 text-emerald-600",
  },
  error: {
    icon: XCircleIcon,
    wrap: "border-red-200",
    iconWrap: "bg-red-100 text-red-600",
  },
  info: {
    icon: InfoIcon,
    wrap: "border-indigo-200",
    iconWrap: "bg-indigo-100 text-indigo-600",
  },
};

const TOAST_DURATION_MS = 4500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idCounter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: ToastInput) => {
      idCounter.current += 1;
      const id = idCounter.current;
      setToasts((prev) => [...prev, { ...toast, id }]);
      setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
        {toasts.map((toast) => {
          const variant = toast.variant ?? "success";
          const styles = VARIANT_STYLES[variant];
          const Icon = styles.icon;
          return (
            <div
              key={toast.id}
              role="status"
              className={`animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white p-4 shadow-soft-lg ${styles.wrap}`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${styles.iconWrap}`}>
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                {toast.title && <p className="text-sm font-semibold text-foreground">{toast.title}</p>}
                <p className="text-sm text-slate-600">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Bildirimi kapat"
                className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast, ToastProvider içinde kullanılmalıdır.");
  return ctx;
}
