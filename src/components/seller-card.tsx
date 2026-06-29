"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/format";
import { reportListingAction, type ReportListingState } from "@/app/ilan/[listingNo]/actions";
import {
  openListingConversationAction,
  type SubmitOfferState,
} from "@/app/hesabim/mesajlar/actions";
import { toggleSellerFollowAction } from "@/lib/social-actions";
import { Avatar } from "./avatar";
import { ListingChatWidget } from "./listing-chat-widget";
import { OfferDialog } from "./offer-dialog";
import { errorClass, inputClass } from "./form-ui";
import { CheckIcon, FlagIcon, MessageIcon, PhoneIcon, TagIcon, UsersIcon } from "./icons";

type SellerCardProps = {
  name: string;
  avatarUrl: string | null;
  createdAt: Date | string;
  phone: string | null;
  listingId: string;
  listingNo: string;
  listingTitle: string;
  listingPrice: number;
  listingImageUrl: string | null;
  sellerId: string;
  currentUserId: string | null;
  isFollowing?: boolean;
  // İlan pazarlığa açık mı (ikinci el) — "Teklif Ver" butonu bununla görünür.
  isNegotiable?: boolean;
};

const initialReportState: ReportListingState = {};

export function SellerCard({
  name,
  avatarUrl,
  createdAt,
  phone,
  listingId,
  listingNo,
  listingTitle,
  listingPrice,
  listingImageUrl,
  sellerId,
  currentUserId,
  isFollowing = false,
  isNegotiable = false,
}: SellerCardProps) {
  const router = useRouter();
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [following, setFollowing] = useState(isFollowing);
  const [, startFollowTransition] = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);

  const [reportState, reportAction, reportPending] = useActionState(
    async (_prevState: ReportListingState, formData: FormData) =>
      reportListingAction(listingId, _prevState, formData),
    initialReportState,
  );
  const isOwnListing = currentUserId === sellerId;
  const loginHref = `/giris?callbackUrl=${encodeURIComponent(`/ilan/${listingNo}`)}`;

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

  // Teklif gönderilince oluşan/güncellenen konuşmaya götür (alıcı teklifini ve
  // satıcının yanıtını orada takip eder).
  function handleOfferSubmitted(state: SubmitOfferState) {
    if (state.conversationId) router.push(`/hesabim/mesajlar?c=${state.conversationId}`);
  }

  // "Teklif Ver" butonu: yalnız pazarlığa açık ilanda ve kendi ilanı değilse.
  // Giriş yoksa girişe yönlendirir; varsa teklif penceresini açar.
  function OfferButton({ className = "" }: { className?: string }) {
    if (!isNegotiable || isOwnListing) return null;
    if (!currentUserId) {
      return (
        <Link
          href={loginHref}
          className={`flex w-full items-center justify-center gap-2 rounded-lg border border-accent bg-accent-light px-4 py-2.5 text-sm font-bold text-brand transition-colors hover:bg-accent/30 ${className}`}
        >
          <TagIcon className="h-4 w-4" />
          Teklif Ver
        </Link>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setOfferOpen(true)}
        className={`flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-brand shadow-soft transition-colors hover:bg-accent-dark hover:text-white ${className}`}
      >
        <TagIcon className="h-4 w-4" />
        Teklif Ver
      </button>
    );
  }

  // Giriş yoksa: girişe yönlendir. Masaüstünde widget'ı aç, mobilde tam ekran
  // sohbete (mesajlar sayfası) yönlendir - aynı butonun iki sürümü.
  function MessageButtons({ className = "" }: { className?: string }) {
    if (!currentUserId) {
      return (
        <Link
          href={loginHref}
          className={`flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 ${className}`}
        >
          <MessageIcon className="h-4 w-4" />
          Mesaj Gönder
        </Link>
      );
    }
    return (
      <>
        {/* Masaüstü: alttan açılan sohbet kutusu */}
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className={`hidden w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-700 md:flex ${className}`}
        >
          <MessageIcon className="h-4 w-4" />
          Mesaj Gönder
        </button>
        {/* Mobil: tam ekran sohbete yönlendir */}
        <form action={openListingConversationAction} className={`w-full md:hidden ${className}`}>
          <input type="hidden" name="listingId" value={listingId} />
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-700"
          >
            <MessageIcon className="h-4 w-4" />
            Mesaj Gönder
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <section ref={cardRef} className="rounded-lg bg-white p-4 shadow-soft sm:p-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Satıcı</h2>
        <div className="flex items-center gap-3">
          <Avatar name={name} src={avatarUrl} size="md" />
          <div>
            <p className="text-sm font-semibold text-foreground">{name}</p>
            <p className="text-xs text-slate-400">Üyelik: {formatDate(createdAt)}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {!isOwnListing && <OfferButton />}
          {!isOwnListing && <MessageButtons />}

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
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand/20 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-100"
              >
                <PhoneIcon className="h-4 w-4" />
                {phone}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setPhoneRevealed(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand/20 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-100"
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

      {/* Mobilde mesaj/telefon butonlarına ulaşmak için galeri + fiyat kartını
          geçmek gerekmesin diye, alt navigasyon çubuğunun (BottomNav, h-16)
          hemen üstüne sabitlenmiş kısayol çubuğu. */}
      {!isOwnListing && (
        <div className="fixed inset-x-0 bottom-16 z-20 flex flex-col gap-2 border-t border-slate-200 bg-white p-3 shadow-soft-lg md:hidden">
          <OfferButton />
          <div className="flex gap-2">
          {!currentUserId ? (
            <Link
              href={loginHref}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              <MessageIcon className="h-4 w-4" />
              Mesaj Gönder
            </Link>
          ) : (
            <form action={openListingConversationAction} className="flex-1">
              <input type="hidden" name="listingId" value={listingId} />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white shadow-sm"
              >
                <MessageIcon className="h-4 w-4" />
                Mesaj Gönder
              </button>
            </form>
          )}

          {phone &&
            (phoneRevealed ? (
              <a
                href={`tel:${phone}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand/20 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand"
              >
                <PhoneIcon className="h-4 w-4" />
                Ara
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setPhoneRevealed(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand/20 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand"
              >
                <PhoneIcon className="h-4 w-4" />
                Telefonu Göster
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Masaüstü sohbet kutusu - yalnız md+ ekranda görünür (bileşen içinde
          hidden md:block); chatOpen ile mount edilir. */}
      {!isOwnListing && currentUserId && chatOpen && (
        <ListingChatWidget
          listingId={listingId}
          listingNo={listingNo}
          listingTitle={listingTitle}
          listingPrice={listingPrice}
          listingImageUrl={listingImageUrl}
          sellerName={name}
          sellerAvatarUrl={avatarUrl}
          currentUserId={currentUserId}
          isNegotiable={isNegotiable}
          onClose={() => setChatOpen(false)}
        />
      )}

      {/* Teklif penceresi - ilk teklif (listingId ile); başarıyla gönderince
          konuşmaya yönlendirir. */}
      {!isOwnListing && currentUserId && isNegotiable && (
        <OfferDialog
          open={offerOpen}
          onClose={() => setOfferOpen(false)}
          listingId={listingId}
          listingPrice={listingPrice}
          onSubmitted={handleOfferSubmitted}
        />
      )}
    </>
  );
}
