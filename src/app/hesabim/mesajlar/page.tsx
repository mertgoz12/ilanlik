import { MessageCircle } from "lucide-react";
import { requireUserPage } from "@/lib/account-auth";
import { getConversationDetail, getUserConversations, markConversationRead } from "@/lib/messages";
import { PageHeader } from "@/components/admin/page-header";
import { ConversationList } from "@/components/account/conversation-list";
import { ConversationThread } from "@/components/account/conversation-thread";
import { InboxIcon } from "@/components/icons";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const session = await requireUserPage("/hesabim/mesajlar");
  const sp = await searchParams;

  const conversations = await getUserConversations(session.id);

  let activeConversation = null;
  if (sp.c) {
    activeConversation = await getConversationDetail(sp.c, session.id);
    if (activeConversation) {
      await markConversationRead(activeConversation.id, session.id);
    }
  }

  const showList = !sp.c;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={MessageCircle}
        title="Mesajlar"
        description="Alıcı ve satıcılarla olan görüşmeleriniz."
        accent="blue"
      />

      <div className="flex h-[calc(100vh-260px)] min-h-[460px] overflow-hidden rounded-xl bg-white shadow-soft">
        <div
          className={`${showList ? "flex" : "hidden"} w-full shrink-0 flex-col md:flex md:w-80 md:border-r md:border-slate-100`}
        >
          <ConversationList conversations={conversations} activeId={sp.c} currentUserId={session.id} />
        </div>
        <div className={`${showList ? "hidden" : "flex"} min-w-0 flex-1 flex-col md:flex`}>
          {activeConversation ? (
            <ConversationThread conversation={activeConversation} currentUserId={session.id} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-slate-400">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                <InboxIcon className="h-6 w-6" />
              </span>
              <p className="text-sm">Görüntülemek için bir konuşma seçin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
