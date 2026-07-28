import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { verifyPassword } from "@/lib/password";

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

// DELETE /api/mobile/me  { password? } - hesabı kalıcı olarak siler.
// Şifreli hesaplarda kimlik doğrulama için şifre istenir; Google hesapları
// (şifresiz) oturum yeterli olduğu için doğrudan silinir. İlgili tüm veriler
// (ilanlar, mesajlar, teklifler, favoriler...) FK cascade ile silinir.
export async function DELETE(request: Request) {
  const session = await getMobileUser(request);
  if (!session) return apiError("Giriş yapmalısınız.", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, password: true, googleId: true },
  });
  if (!user) return apiError("Kullanıcı bulunamadı.", 404);

  // Şifresi olan hesaplarda şifre doğrulaması zorunlu.
  const hasPassword = !!user.password;
  if (hasPassword) {
    let body: { password?: string };
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const pw = String(body.password ?? "");
    if (!pw) return apiError("Hesabı silmek için şifrenizi girin.", 400);
    const ok = await verifyPassword(pw, user.password);
    if (!ok) return apiError("Şifre hatalı.", 401);
  }

  await prisma.user.delete({ where: { id: user.id } });
  return apiJson({ ok: true });
}
