import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { resendVerificationEmail } from "@/lib/email-verification";

// POST /api/mobile/auth/resend-verification - oturumdaki kullanıcıya yeni
// doğrulama e-postası gönderir (web resendVerificationEmail ile aynı).
export async function POST(request: Request) {
  const session = await getMobileUser(request);
  if (!session) return apiError("Giriş yapmalısınız.", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { email: true, emailVerified: true },
  });
  if (!user) return apiError("Kullanıcı bulunamadı.", 404);
  if (user.emailVerified) return apiJson({ ok: true, alreadyVerified: true });

  const result = await resendVerificationEmail(user.email);
  if (!result.ok) {
    return apiError(result.error ?? "E-posta gönderilemedi.", 400);
  }
  return apiJson({ ok: true });
}
