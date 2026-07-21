import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { getNotifications, getUnreadNotificationCount } from "@/lib/notifications";

// GET /api/mobile/notifications - kullanıcının bildirimleri + okunmamış sayısı.
export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  const [rows, unreadCount] = await Promise.all([
    getNotifications(user.id),
    getUnreadNotificationCount(user.id),
  ]);

  const notifications = rows.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    link: n.link,
    read: n.readAt !== null,
    createdAt: n.createdAt.toISOString(),
  }));

  return apiJson({ notifications, unreadCount });
}
