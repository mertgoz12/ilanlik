"use client";

import { useActionState } from "react";
import { formatPrice } from "@/lib/format";
import { OFFER_STATUS_LABELS, type OfferView } from "@/lib/offers";
import { respondOfferAction, type RespondOfferState } from "@/app/hesabim/mesajlar/actions";
import { CheckIcon, CloseIcon } from "./icons";

const initialState: RespondOfferState = {};

const STATUS_STYLES: Record<OfferView["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  countered: "bg-slate-200 text-slate-600",
};

type OfferBubbleProps = {
  offer: OfferView;
  currentUserId: string;
  // Karşı/yeni teklif penceresini açar (varsa). Tutarı ön-doldurmak için
  // mevcut teklif tutarı geçilir.
  onCounter?: (currentAmount: number) => void;
};

// Mesajlaşma akışında bir teklifi gösteren özel baloncuk. Bekleyen ve karşı
// tarafa ait bir teklif ise Kabul Et / Reddet / Karşı (Yeni) Teklif aksiyonları
// gösterilir. Pazarlık karşılıklı olduğundan satıcı da alıcı da aynı baloncuğu
// görür; aksiyonlar yalnızca "teklifi vermeyen" tarafa çıkar.
export function OfferBubble({ offer, currentUserId, onCounter }: OfferBubbleProps) {
  const [state, action, pending] = useActionState(respondOfferAction, initialState);

  const isOwn = offer.createdById === currentUserId;
  const isPending = offer.status === "pending";
  // Teklifi veren satıcıysa bu bir "karşı teklif"tir; alıcı yanıt verirken yeni
  // teklifi de "yeni teklif" olarak adlandırırız.
  const counterLabel = offer.role === "seller" ? "Yeni Teklif Ver" : "Karşı Teklif Ver";

  return (
    <div className="w-full max-w-[280px] rounded-2xl border border-accent/40 bg-accent-light/40 p-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {isOwn ? "Sizin teklifiniz" : offer.role === "seller" ? "Satıcı teklifi" : "Alıcı teklifi"}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLES[offer.status]}`}
        >
          {OFFER_STATUS_LABELS[offer.status]}
        </span>
      </div>

      <p className="mt-1 font-display text-xl font-bold text-brand">{formatPrice(offer.amount)}</p>

      {offer.note && <p className="mt-1 text-xs text-slate-600">{offer.note}</p>}

      {isPending && isOwn && (
        <p className="mt-2 text-xs font-medium text-slate-500">Karşı tarafın yanıtı bekleniyor…</p>
      )}

      {isPending && !isOwn && (
        <div className="mt-3 space-y-2">
          <form action={action} className="flex gap-2">
            <input type="hidden" name="offerId" value={offer.id} />
            <button
              type="submit"
              name="decision"
              value="accept"
              disabled={pending}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-green-600 px-2.5 py-2 text-xs font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
            >
              <CheckIcon className="h-3.5 w-3.5" />
              Kabul Et
            </button>
            <button
              type="submit"
              name="decision"
              value="reject"
              disabled={pending}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-600 px-2.5 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              <CloseIcon className="h-3.5 w-3.5" />
              Reddet
            </button>
          </form>
          {onCounter && (
            <button
              type="button"
              onClick={() => onCounter(offer.amount)}
              className="w-full rounded-lg border border-brand/30 bg-white px-2.5 py-2 text-xs font-bold text-brand transition-colors hover:bg-brand hover:text-white"
            >
              {counterLabel}
            </button>
          )}
          {state.error && <p className="text-[11px] font-medium text-red-600">{state.error}</p>}
        </div>
      )}
    </div>
  );
}
