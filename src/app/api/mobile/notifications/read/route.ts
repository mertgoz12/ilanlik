import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { markAllNotificationsRead } from "@/lib/notifications";

// POST /api/mobile/notifications/read - tümünü okundu işaretle.
export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);
  await markAllNotificationsRead(user.id);
  return apiJson({ ok: true });
}
