import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { hashPassword, verifyPassword } from "@/lib/password";
import { changePasswordSchema } from "@/lib/validation";

// POST /api/mobile/me/password  { currentPassword, newPassword, newPasswordConfirm }
export async function POST(request: Request) {
  const session = await getMobileUser(request);
  if (!session) return apiError("Giriş yapmalısınız.", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0] ?? "Bilgileri kontrol edin.";
    return apiError(first, 422);
  }

  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { password: true } });
  if (!user) return apiError("Kullanıcı bulunamadı.", 404);

  const valid = await verifyPassword(parsed.data.currentPassword, user.password);
  if (!valid) return apiError("Mevcut şifreniz hatalı.", 403);

  const hashed = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: session.id }, data: { password: hashed } });
  return apiJson({ ok: true });
}
