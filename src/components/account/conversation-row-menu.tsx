"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@/components/icons";
import {
  blockUserFromConversationAction,
  deleteConversationAction,
  type ConversationActionResult,
} from "@/app/hesabim/mesajlar/actions";

type Props = {
  conversationId: string;
  otherUserName: string;
};

// Mesaj kutusu satırındaki üç nokta menüsü: konuşmayı sil / kullanıcıyı engelle.
// Satırdaki <Link> gezinmesini tetiklememek için buton onu sarmalayan div'in
// dışında (kardeş) ve tıklamalar durdurulur.
export function ConversationRowMenu({ conversationId, otherUserName }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run(action: (fd: FormData) => Promise<ConversationActionResult>, confirmMsg: string) {
    setOpen(false);
    if (!window.confirm(confirmMsg)) return;
    const fd = new FormData();
    fd.set("conversationId", conversationId);
    startTransition(async () => {
      const res = await action(fd);
      if (res?.error) {
        window.alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label="Konuşma seçenekleri"
        disabled={pending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="5" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="12" cy="19" r="1.6" />
        </svg>
      </button>

      {open && (
        <>
          {/* Dışarı tıklayınca kapat */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }}
          />
          <div className="absolute right-0 top-8 z-20 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                run(
                  deleteConversationAction,
                  "Bu konuşma yalnızca senin listenden kaldırılacak. Karşı taraf etkilenmez. Emin misin?",
                );
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              <TrashIcon className="h-4 w-4 text-slate-400" />
              Konuşmayı sil
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                run(
                  blockUserFromConversationAction,
                  `${otherUserName} engellensin mi? Bu kullanıcının ilanları sana gösterilmez ve mesajlaşamazsınız.`,
                );
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
              </svg>
              Kullanıcıyı engelle
            </button>
          </div>
        </>
      )}
    </div>
  );
}
