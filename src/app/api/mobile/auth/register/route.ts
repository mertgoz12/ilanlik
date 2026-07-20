import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signSessionToken } from "@/lib/jwt";
import { registerSchema } from "@/lib/validation";
import { sendInitialVerificationEmail } from "@/lib/email-verification";
import { apiJson, apiError } from "@/lib/mobile-api";

// POST /api/mobile/auth/register  { name, email, phone?, password, passwordConfirm, termsAccepted }
// Web registerAction ile AYNI doğrulama/oluşturma; JWT'yi yanıt gövdesinde
// döndürür. Doğrulama e-postası web'deki gibi denenir (başarısızlık kaydı
// engellemez - kullanıcı sonra tekrar gönderebilir).
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(fieldErrors).flat()[0] ?? "Bilgileri kontrol edin.";
    return apiJson({ error: firstError, fieldErrors }, { status: 422 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return apiJson(
      { error: "Bu e-posta adresi zaten kayıtlı.", fieldErrors: { email: ["Bu e-posta adresi zaten kayıtlı."] } },
      { status: 409 },
    );
  }

  const hashed = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashed,
      phone: parsed.data.phone || null,
      emailVerified: false,
    },
  });

  const emailResult = await sendInitialVerificationEmail(user);
  if (!emailResult.ok) {
    console.error("Mobil kayıt: doğrulama e-postası gönderilemedi:", emailResult.error);
  }

  const token = await signSessionToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return apiJson({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
  });
}
