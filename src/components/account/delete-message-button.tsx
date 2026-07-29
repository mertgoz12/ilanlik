"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteMessageAction, type DeleteMessageState } from "@/app/hesabim/mesajlar/actions";

const initial: DeleteMessageState = {};

// Kendi metin mesajının yanında beliren küçük sil butonu (hover'da görünür).
export function DeleteMessageButton({ messageId }: { messageId: string }) {
  const [, action, pending] = useActionState(deleteMessageAction, initial);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Bu mesajı silmek istiyor musunuz? İki taraftan da silinir.")) e.preventDefault();
      }}
      className="self-center"
    >
      <input type="hidden" name="messageId" value={messageId} />
      <button
        type="submit"
        disabled={pending}
        title="Mesajı sil"
        aria-label="Mesajı sil"
        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 disabled:opacity-40 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}
