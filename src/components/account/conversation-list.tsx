import Image from "next/image";
import Link from "next/link";
import { RelativeTime } from "@/components/relative-time";
import { ImageIcon, InboxIcon } from "@/components/icons";
import type { ConversationListItem } from "@/lib/messages";

type ConversationListProps = {
  conversations: ConversationListItem[];
  activeId?: string;
  currentUserId: string;
};

export function ConversationList({ conversations, activeId, currentUserId }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-slate-400">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
          <InboxIcon className="h-6 w-6" />
        </span>
        <p className="text-sm">Henüz bir mesajınız yok.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
      {conversations.map((c) => {
        const active = c.id === activeId;
        const unread = c.unreadCount > 0;
        return (
          <Link
            key={c.id}
            href={`/hesabim/mesajlar?c=${c.id}`}
            className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${active ? "bg-accent-light" : ""}`}
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              {c.listingImageUrl ? (
                <Image src={c.listingImageUrl} alt="" fill sizes="48px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className={`truncate text-sm ${unread ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                  {c.otherUserName}
                </p>
                {c.lastMessage && (
                  <RelativeTime
                    date={c.lastMessage.createdAt}
                    className="shrink-0 text-[11px] text-slate-400"
                  />
                )}
              </div>
              <p className="truncate text-xs text-slate-400">{c.listingTitle}</p>
              {c.lastMessage && (
                <p className={`mt-0.5 truncate text-xs ${unread ? "font-semibold text-foreground" : "text-slate-500"}`}>
                  {c.lastMessage.senderId === currentUserId ? "Siz: " : ""}
                  {c.lastMessage.body}
                </p>
              )}
            </div>
            {unread && (
              <span className="ml-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                {c.unreadCount > 9 ? "9+" : c.unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
