import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getConversationDetail } from "@/lib/messages";

// GET /api/conversations/:id/messages
// Web sohbet ekranının canlı güncellemesi için hafif uç: oturum sahibinin
// konuşmasındaki mesajları döner. İstemci bunu periyodik çağırıp yalnızca
// mesaj listesini tazeler (sunucu bileşenini yeniden çalıştırmadan).
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const conversation = await getConversationDetail(id, session.id);
  if (!conversation) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({ messages: conversation.messages });
}
