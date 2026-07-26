import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";

// POST /api/mobile/me/push-token  { token: string | null }
// Mobil uygulama giriş sonrası Expo push token'ını kaydeder; çıkışta null gönderip
// temizler. Aynı token başka kullanıcıdaysa (cihaz el değiştirdi) ondan alınır.
export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  let body: { token?: string | null };
  try {
    body = await request.json();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }

  const token = typeof body.token === "string" ? body.token.trim() : null;

  try {
    if (token) {
      // Bu token başka kullanıcıya bağlıysa çöz (cihaz tek kullanıcıya push alsın).
      await prisma.user.updateMany({
        where: { pushToken: token, id: { not: user.id } },
        data: { pushToken: null },
      });
    }
    await prisma.user.update({ where: { id: user.id }, data: { pushToken: token } });
  } catch (err) {
    console.error("[push-token] save failed:", err);
    return apiError("Token kaydedilemedi.", 500);
  }

  return apiJson({ ok: true });
}
