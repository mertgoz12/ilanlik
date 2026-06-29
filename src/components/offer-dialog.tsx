"use client";

import { useActionState, useEffect, useRef } from "react";
import { formatPrice } from "@/lib/format";
import { submitOfferAction, type SubmitOfferState } from "@/app/hesabim/mesajlar/actions";
import { CloseIcon } from "./icons";

const initialState: SubmitOfferState = {};

type OfferDialogProps = {
  open: boolean;
  onClose: () => void;
  listingPrice: number;
  // İlk teklif (ilan detayı) için listingId; konuşma içi teklif/karşı teklif
  // için conversationId verilir (en az biri dolu olmalı).
  listingId?: string;
  conversationId?: string;
  defaultAmount?: number;
  title?: string;
  // Başarılı gönderim sonrası (örn. konuşmaya yönlendir / yenile).
  onSubmitted?: (state: SubmitOfferState) => void;
};

// İkinci el ilan pazarlığında tutar girme penceresi. Hem ilk teklif (alıcı,
// ilan detayı) hem karşı teklif / yeni teklif (konuşma içi) için kullanılır.
export function OfferDialog({
  open,
  onClose,
  listingPrice,
  listingId,
  conversationId,
  defaultAmount,
  title = "Teklif Ver",
  onSubmitted,
}: OfferDialogProps) {
  const [state, action, pending] = useActionState(submitOfferAction, initialState);
  const handledAt = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (state.ok && state.at && state.at !== handledAt.current) {
      handledAt.current = state.at;
      onSubmitted?.(state);
      onClose();
    }
  }, [state, onSubmitted, onClose]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-soft-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-brand">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3 rounded-xl bg-slate-50 px-4 py-3 text-sm">
          <span className="text-slate-500">İlan fiyatı: </span>
          <span className="font-bold text-foreground">{formatPrice(listingPrice)}</span>
        </div>

        <form action={action} className="space-y-3">
          {listingId && <input type="hidden" name="listingId" value={listingId} />}
          {conversationId && <input type="hidden" name="conversationId" value={conversationId} />}

          <div>
            <label htmlFor="offer-amount" className="mb-1 block text-sm font-semibold text-slate-700">
              Teklifiniz (₺)
            </label>
            <input
              id="offer-amount"
              name="amount"
              type="number"
              min={1}
              step={1}
              required
              autoFocus
              defaultValue={defaultAmount ?? ""}
              placeholder="Örn: 8500"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
            />
          </div>

          <div>
            <label htmlFor="offer-note" className="mb-1 block text-sm font-semibold text-slate-700">
              Not <span className="font-normal text-slate-400">(opsiyonel)</span>
            </label>
            <textarea
              id="offer-note"
              name="note"
              rows={2}
              maxLength={500}
              placeholder="Kısa bir mesaj ekleyebilirsiniz..."
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
            />
          </div>

          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-brand shadow-soft transition-colors hover:bg-accent-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Gönderiliyor..." : "Teklifi Gönder"}
          </button>
          <p className="text-center text-[11px] text-slate-400">
            Güvenliğiniz için iletişimi platform üzerinden sürdürün.
          </p>
        </form>
      </div>
    </div>
  );
}
