import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";

// GET /api/mobile/me - güncel kullanıcı bilgisi (e-posta doğrulama durumu
// dahil). Uygulama, e-posta doğrulandıktan sonra durumu tazelemek için çağırır.
export async function GET(request: Request) {
  const session = await getMobileUser(request);
  if (!session) return apiError("Giriş yapmalısınız.", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, emailVerified: true },
  });
  if (!user) return apiError("Kullanıcı bulunamadı.", 404);

  return apiJson({ user });
}
