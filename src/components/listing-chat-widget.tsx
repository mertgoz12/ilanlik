"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Avatar } from "./avatar";
import { RelativeTime } from "./relative-time";
import { ChevronDownIcon, CloseIcon, ImageIcon, SendIcon } from "./icons";
import { useUnreadMessages } from "./unread-messages-context";
import { MAX_MESSAGE_LENGTH } from "@/lib/message-filters";
import { formatPrice } from "@/lib/format";
import {
  fetchListingThread,
  sendListingMessageAction,
  type ChatWidgetMessage,
  type SendListingMessageState,
} from "@/app/hesabim/mesajlar/actions";

const POLL_INTERVAL_MS = 5000;
const initialSendState: SendListingMessageState = {};

type ListingChatWidgetProps = {
  listingId: string;
  listingNo: string;
  listingTitle: string;
  listingPrice: number;
  listingImageUrl: string | null;
  sellerName: string;
  sellerAvatarUrl: string | null;
  currentUserId: string;
  onClose: () => void;
};

// İlan detay sayfasında, masaüstünde sağ alttan açılan Messenger tarzı sohbet
// kutusu. Mevcut mesajlaşma altyapısına bağlıdır; mesajları periyodik olarak
// yeniler (basit polling). Mobilde render edilmez (SellerCard mobilde tam
// ekran sohbete yönlendirir).
export function ListingChatWidget({
  listingId,
  listingNo,
  listingTitle,
  listingPrice,
  listingImageUrl,
  sellerName,
  sellerAvatarUrl,
  currentUserId,
  onClose,
}: ListingChatWidgetProps) {
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatWidgetMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const conversationIdRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { markRead } = useUnreadMessages();

  const [sendState, sendAction, sending] = useActionState(
    sendListingMessageAction,
    initialSendState,
  );

  const refresh = useCallback(async () => {
    try {
      const data = await fetchListingThread(listingId);
      conversationIdRef.current = data.conversationId;
      setMessages(data.messages);
      if (data.markedRead > 0) markRead(data.markedRead);
    } catch {
      // sessizce geç - bir sonraki yenilemede tekrar denenir
    } finally {
      setLoading(false);
    }
  }, [listingId, markRead]);

  // Açılışta yükle + minimize değilken periyodik yenile.
  useEffect(() => {
    void refresh();
    if (minimized) return;
    const id = setInterval(() => void refresh(), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh, minimized]);

  // Gönderim başarılı olunca formu temizle ve hemen yenile (kendi mesajını göster).
  useEffect(() => {
    if (sendState.sentAt) {
      if (sendState.conversationId) conversationIdRef.current = sendState.conversationId;
      formRef.current?.reset();
      void refresh();
    }
  }, [sendState.sentAt, sendState.conversationId, refresh]);

  // Yeni mesajda en alta kaydır.
  useEffect(() => {
    if (!minimized) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, minimized]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter gönderir, Shift+Enter yeni satır.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 hidden w-[22rem] overflow-hidden rounded-2xl bg-white shadow-soft-lg ring-1 ring-slate-200 md:block">
      {/* Başlık: satıcı + ilan + küçült/kapat */}
      <div className="flex items-center gap-2.5 bg-brand px-3.5 py-3 text-white">
        <Avatar name={sellerName} src={sellerAvatarUrl} size="sm" className="ring-2 ring-white/20" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{sellerName}</p>
          <Link
            href={`/ilan/${listingNo}`}
            className="truncate text-[11px] text-white/70 transition-colors hover:text-accent"
          >
            {listingTitle} · {formatPrice(listingPrice)}
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setMinimized((m) => !m)}
          aria-label={minimized ? "Sohbeti aç" : "Sohbeti küçült"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${minimized ? "rotate-180" : ""}`} />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Sohbeti kapat"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      {!minimized && (
        <>
          {/* Mesaj geçmişi */}
          <div ref={scrollRef} className="h-72 space-y-2 overflow-y-auto bg-slate-50/60 p-3.5">
            {loading ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Yükleniyor...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-slate-100">
                  {listingImageUrl ? (
                    <Image src={listingImageUrl} alt="" fill sizes="48px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-foreground">{sellerName}</span> ile sohbeti başlatın.
                  İlanla ilgili sorularınızı yazın.
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex items-end gap-1.5 ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar
                      name={message.senderName}
                      src={message.senderAvatarUrl}
                      size="xs"
                      className="mb-0.5 shrink-0"
                    />
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                        isOwn ? "bg-brand text-white" : "bg-white text-foreground ring-1 ring-slate-200"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.body}</p>
                      <RelativeTime
                        date={message.createdAt}
                        showTime
                        className={`mt-1 block text-right text-[10px] ${isOwn ? "text-white/60" : "text-slate-400"}`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Yazma alanı */}
          <form ref={formRef} action={sendAction} className="border-t border-slate-100 p-2.5">
            <input type="hidden" name="listingId" value={listingId} />
            {sendState.error && (
              <p className="mb-1.5 px-1 text-[11px] font-medium text-red-600">{sendState.error}</p>
            )}
            <div className="flex items-end gap-2">
              <textarea
                name="body"
                required
                rows={1}
                maxLength={MAX_MESSAGE_LENGTH}
                onKeyDown={handleKeyDown}
                placeholder="Mesajınızı yazın..."
                className="max-h-24 flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
              />
              <button
                type="submit"
                disabled={sending}
                aria-label="Gönder"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-brand shadow-soft transition-colors hover:bg-accent-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <SendIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 px-1 text-[10px] text-slate-400">
              Güvenliğiniz için iletişimi platform üzerinden sürdürün.
            </p>
          </form>
        </>
      )}
    </div>
  );
}
