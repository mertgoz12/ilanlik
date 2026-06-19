"use client";

import { useActionState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, ImageIcon } from "@/components/icons";
import { RelativeTime } from "@/components/relative-time";
import { useUnreadMessages } from "@/components/unread-messages-context";
import { formatPrice } from "@/lib/format";
import { sendMessageAction, type MessageFormState } from "@/app/hesabim/mesajlar/actions";
import type { ConversationDetail } from "@/lib/messages";

type ConversationThreadProps = {
  conversation: ConversationDetail;
  currentUserId: string;
};

const initialState: MessageFormState = {};

export function ConversationThread({ conversation, currentUserId }: ConversationThreadProps) {
  const [state, formAction, pending] = useActionState(sendMessageAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const otherUser = conversation.buyerId === currentUserId ? conversation.seller : conversation.buyer;
  const listingImage = conversation.listing.images[0]?.url ?? null;
  const { markRead } = useUnreadMessages();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [conversation.messages.length]);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  // Sunucu bu konuşmayı yüklerken okunmamış mesajları DB'de okundu olarak
  // işaretledi (bkz. mesajlar/page.tsx); navbar rozetini de aynı miktarda
  // anında düşürerek sayfa yenilenmeden senkron tutuyoruz.
  useEffect(() => {
    const unread = conversation.messages.filter(
      (m) => m.senderId !== currentUserId && m.readAt === null,
    ).length;
    markRead(unread);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <Link href="/hesabim/mesajlar" className="text-slate-400 hover:text-slate-600 md:hidden">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {listingImage ? (
            <Image src={listingImage} alt="" fill sizes="40px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <ImageIcon className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{otherUser.name}</p>
          <Link
            href={`/ilan/${conversation.listing.listingNo}`}
            target="_blank"
            className="truncate text-xs text-slate-400 hover:text-brand hover:underline"
          >
            {conversation.listing.title} · {formatPrice(conversation.listing.price)}
          </Link>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
        {conversation.messages.map((message) => {
          const isOwn = message.senderId === currentUserId;
          return (
            <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                  isOwn ? "bg-brand text-white" : "bg-slate-100 text-foreground"
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
        })}
      </div>

      <form ref={formRef} action={formAction} className="border-t border-slate-100 p-3">
        <input type="hidden" name="conversationId" value={conversation.id} />
        {state.error && <p className="mb-2 text-xs font-medium text-red-600">{state.error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            name="body"
            required
            rows={1}
            placeholder="Mesajınızı yazın..."
            className="flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/10"
          />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Gönder
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-400">
          Güvenliğiniz için telefon numarası veya dış bağlantı paylaşmayın; iletişimi platform üzerinden sürdürün.
        </p>
      </form>
    </div>
  );
}
