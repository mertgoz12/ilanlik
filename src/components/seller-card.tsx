"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { reportListingAction, type ReportListingState } from "@/app/ilan/[listingNo]/actions";
import { startConversationAction, type MessageFormState } from "@/app/hesabim/mesajlar/actions";
import { toggleSellerFollowAction } from "@/lib/social-actions";
import { MAX_MESSAGE_LENGTH } from "@/lib/message-filters";
import { errorClass, inputClass } from "./form-ui";
import { CheckIcon, FlagIcon, MessageIcon, PhoneIcon, UserIcon, UsersIcon } from "./icons";

type SellerCardProps = {
  name: string;
  createdAt: Date | string;
  phone: string | null;
  listingId: string;
  listingNo: string;
  sellerId: string;
  currentUserId: string | null;
  isFollowing?: boolean;
};

const initialReportState: ReportListingState = {};
const initialMessageState: MessageFormState = {};

export function SellerCard({
  name,
  createdAt,
  phone,
  listingId,
  listingNo,
  sellerId,
  currentUserId,
  isFollowing = false,
}: SellerCardProps) {
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [following, setFollowing] = useState(isFollowing);
  const [, startFollowTransition] = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);

  function focusMessageForm() {
    setShowMessageForm(true);
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  const [reportState, reportAction, reportPending] = useActionState(
    async (_prevState: ReportListingState, formData: FormData) =>
      reportListingAction(listingId, _prevState, formData),
    initialReportState,
  );
  const [messageState, messageAction, messagePending] = useActionState(
    startConversationAction,
    initialMessageState,
  );
  const isOwnListing = currentUserId === sellerId;

  function handleFollowClick() {
    setFollowing((prev) => !prev);
    startFollowTransition(async () => {
      try {
        await toggleSellerFollowAction(sellerId);
      } catch {
        setFollowing((prev) => !prev);
      }
    });
  }

  return (
    <>
    <section ref={cardRef} className="rounded-lg bg-white p-4 shadow-soft sm:p-6">
      <h2 className="mb-3 text-sm font-semibold text-foreground">Satıcı</h2>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <UserIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs text-slate-400">Üyelik: {formatDate(createdAt)}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {!isOwnListing &&
          (!currentUserId ? (
            <Link
              href={`/giris?callbackUrl=${encodeURIComponent(`/ilan/${listingNo}`)}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <MessageIcon className="h-4 w-4" />
              Mesaj Gönder
            </Link>
          ) : showMessageForm ? (
            <form action={messageAction} className="space-y-2">
              <input type="hidden" name="listingId" value={listingId} />
              <textarea
                name="body"
                required
                minLength={1}
                maxLength={MAX_MESSAGE_LENGTH}
                rows={3}
                placeholder="Satıcıya mesajınızı yazın..."
                className={inputClass}
              />
              {messageState.error && <p className={errorClass}>{messageState.error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={messagePending}
                  className="flex-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {messagePending ? "Gönderiliyor..." : "Gönder"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMessageForm(false)}
                  className="rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  İptal
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowMessageForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <MessageIcon className="h-4 w-4" />
              Mesaj Gönder
            </button>
          ))}

        {!isOwnListing && currentUserId && (
          <button
            type="button"
            onClick={handleFollowClick}
            aria-pressed={following}
            className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
              following
                ? "border-accent bg-accent-light text-brand hover:bg-accent/20"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <UsersIcon className="h-4 w-4" />
            {following ? "Takip Ediliyor" : "Satıcıyı Takip Et"}
          </button>
        )}

        {phone &&
          (phoneRevealed ? (
            <a
              href={`tel:${phone}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
            >
              <PhoneIcon className="h-4 w-4" />
              {phone}
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setPhoneRevealed(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
            >
              <PhoneIcon className="h-4 w-4" />
              Telefonu Göster
            </button>
          ))}
      </div>

      {reportState.success ? (
        <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <CheckIcon className="h-3.5 w-3.5" />
          Şikayetiniz alındı, incelenecektir.
        </p>
      ) : showReportForm ? (
        <form action={reportAction} className="mt-4 space-y-2">
          <textarea
            name="reason"
            required
            minLength={10}
            maxLength={1000}
            rows={3}
            placeholder="Bu ilanla ilgili sorunu kısaca açıklayın..."
            className={inputClass}
          />
          {reportState.error && <p className={errorClass}>{reportState.error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={reportPending}
              className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {reportPending ? "Gönderiliyor..." : "Şikayeti Gönder"}
            </button>
            <button
              type="button"
              onClick={() => setShowReportForm(false)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              İptal
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowReportForm(true)}
          className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-red-600"
        >
          <FlagIcon className="h-3.5 w-3.5" />
          İlanı Şikayet Et
        </button>
      )}
    </section>

    {/* Mobilde mesaj/telefon butonlarına ulaşmak için önce galeri + fiyat
        kartını geçmek gerekmesin diye, alt navigasyon çubuğunun (BottomNav,
        h-16) hemen üstüne sabitlenmiş bir kısayol çubuğu - aynı state'i
        (phoneRevealed/showMessageForm) paylaşır, ayrı bir form açmaz. */}
    {!isOwnListing && (
      <div className="fixed inset-x-0 bottom-16 z-20 flex gap-2 border-t border-slate-200 bg-white p-3 shadow-soft-lg md:hidden">
        {!currentUserId ? (
          <Link
            href={`/giris?callbackUrl=${encodeURIComponent(`/ilan/${listingNo}`)}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
          >
            <MessageIcon className="h-4 w-4" />
            Mesaj Gönder
          </Link>
        ) : (
          <button
            type="button"
            onClick={focusMessageForm}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
          >
            <MessageIcon className="h-4 w-4" />
            Mesaj Gönder
          </button>
        )}

        {phone &&
          (phoneRevealed ? (
            <a
              href={`tel:${phone}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm"
            >
              <PhoneIcon className="h-4 w-4" />
              Ara
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setPhoneRevealed(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm"
            >
              <PhoneIcon className="h-4 w-4" />
              Telefonu Göster
            </button>
          ))}
      </div>
    )}
    </>
  );
}
