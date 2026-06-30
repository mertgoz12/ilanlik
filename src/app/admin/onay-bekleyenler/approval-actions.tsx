"use client";

import { useState } from "react";
import { CheckIcon, SpinnerIcon, XCircleIcon } from "@/components/icons";
import { useToast } from "@/components/admin/toast";

type ApprovalActionsProps = {
  listingTitle: string;
  approve: () => Promise<void>;
  reject: (reason: string) => Promise<void>;
};

// Onay bekleyen ilan için "Onayla" (yeşil) ve "Reddet" (kırmızı) kontrolleri.
// Reddetme, satır içinde bir sebep kutusu açar - sebep zorunludur.
export function ApprovalActions({ listingTitle, approve, reject }: ApprovalActionsProps) {
  const { showToast } = useToast();
  const [mode, setMode] = useState<"idle" | "rejecting">("idle");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);

  async function handleApprove() {
    setPending("approve");
    try {
      await approve();
      showToast({ variant: "success", message: `"${listingTitle}" onaylandı ve yayına alındı.` });
    } catch {
      showToast({ variant: "error", message: "İlan onaylanamadı. Lütfen tekrar deneyin." });
    } finally {
      setPending(null);
    }
  }

  async function handleReject() {
    if (!reason.trim()) {
      showToast({ variant: "error", message: "Lütfen bir red sebebi yazın." });
      return;
    }
    setPending("reject");
    try {
      await reject(reason.trim());
      showToast({ variant: "success", message: `"${listingTitle}" reddedildi ve kullanıcıya bildirildi.` });
      setMode("idle");
      setReason("");
    } catch {
      showToast({ variant: "error", message: "İlan reddedilemedi. Lütfen tekrar deneyin." });
    } finally {
      setPending(null);
    }
  }

  if (mode === "rejecting") {
    return (
      <div className="w-full space-y-2 sm:w-64">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          autoFocus
          placeholder="Red sebebini yazın (kullanıcıya gösterilecek)..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={handleReject}
            disabled={pending !== null}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-60"
          >
            {pending === "reject" ? <SpinnerIcon className="h-3.5 w-3.5 animate-spin-slow" /> : <XCircleIcon className="h-3.5 w-3.5" />}
            Reddet ve bildir
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("idle");
              setReason("");
            }}
            disabled={pending !== null}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Vazgeç
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-wrap gap-1.5 sm:w-44 sm:flex-col">
      <button
        type="button"
        onClick={handleApprove}
        disabled={pending !== null}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:opacity-60"
      >
        {pending === "approve" ? <SpinnerIcon className="h-3.5 w-3.5 animate-spin-slow" /> : <CheckIcon className="h-3.5 w-3.5" />}
        Onayla
      </button>
      <button
        type="button"
        onClick={() => setMode("rejecting")}
        disabled={pending !== null}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        <XCircleIcon className="h-3.5 w-3.5" />
        Reddet
      </button>
    </div>
  );
}
