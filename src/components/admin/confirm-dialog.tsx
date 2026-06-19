"use client";

import { useEffect } from "react";
import { AlertIcon, InfoIcon, SpinnerIcon } from "@/components/icons";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Onayla",
  cancelLabel = "Vazgeç",
  tone = "default",
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onCancel();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, pending, onCancel]);

  if (!open) return null;

  const isDanger = tone === "danger";
  const Icon = isDanger ? AlertIcon : InfoIcon;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="animate-overlay-in absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={() => !pending && onCancel()}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="animate-modal-in relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-soft-lg"
      >
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full ${
            isDanger ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <h2 id="confirm-dialog-title" className="mt-4 text-base font-semibold text-foreground">
          {title}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
              isDanger ? "bg-red-600 hover:bg-red-500" : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            {pending && <SpinnerIcon className="h-4 w-4 animate-spin-slow" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
