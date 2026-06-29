import { prisma } from "./prisma";

export type ConversationListItem = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingNo: string;
  listingImageUrl: string | null;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  lastMessage: { body: string; createdAt: Date; senderId: string } | null;
  unreadCount: number;
  updatedAt: Date;
};

export async function getUserConversations(userId: string): Promise<ConversationListItem[]> {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    orderBy: { updatedAt: "desc" },
    include: {
      listing: {
        select: { id: true, title: true, listingNo: true, images: { orderBy: { order: "asc" }, take: 1 } },
      },
      buyer: { select: { id: true, name: true, avatarUrl: true } },
      seller: { select: { id: true, name: true, avatarUrl: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return Promise.all(
    conversations.map(async (c) => {
      const otherUser = c.buyerId === userId ? c.seller : c.buyer;
      const unreadCount = await prisma.message.count({
        where: { conversationId: c.id, senderId: { not: userId }, readAt: null },
      });
      return {
        id: c.id,
        listingId: c.listing.id,
        listingTitle: c.listing.title,
        listingNo: c.listing.listingNo,
        listingImageUrl: c.listing.images[0]?.url ?? null,
        otherUserId: otherUser.id,
        otherUserName: otherUser.name,
        otherUserAvatarUrl: otherUser.avatarUrl,
        lastMessage: c.messages[0]
          ? { body: c.messages[0].body, createdAt: c.messages[0].createdAt, senderId: c.messages[0].senderId }
          : null,
        unreadCount,
        updatedAt: c.updatedAt,
      };
    }),
  );
}

export async function getConversationDetail(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          listingNo: true,
          price: true,
          isNegotiable: true,
          images: { orderBy: { order: "asc" }, take: 1 },
        },
      },
      buyer: { select: { id: true, name: true, avatarUrl: true } },
      seller: { select: { id: true, name: true, avatarUrl: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true } },
          offer: {
            select: { id: true, amount: true, status: true, role: true, createdById: true, note: true },
          },
        },
      },
    },
  });

  if (!conversation) return null;
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) return null;

  return conversation;
}

export type ConversationDetail = NonNullable<Awaited<ReturnType<typeof getConversationDetail>>>;

export async function markConversationRead(conversationId: string, userId: string) {
  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  // Navbar her sayfada bu fonksiyonu çağırır; Prisma client şema ile senkron
  // değilse (örn. geliştirme sunucusu yeniden başlatılmadıysa) tüm siteyi
  // çökertmek yerine rozet sessizce 0 gösterilsin.
  try {
    return await prisma.message.count({
      where: {
        conversation: { OR: [{ buyerId: userId }, { sellerId: userId }] },
        senderId: { not: userId },
        readAt: null,
      },
    });
  } catch {
    return 0;
  }
}
