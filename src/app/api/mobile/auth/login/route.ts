import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { signSessionToken } from "@/lib/jwt";
import { loginSchema } from "@/lib/validation";
import { apiJson, apiError } from "@/lib/mobile-api";

// POST /api/mobile/auth/login  { email, password }
// Web loginAction ile AYNI doğrulama; farkı: çerez yerine JWT'yi yanıt
// gövdesinde döndürür (mobil "Bearer" ile saklar/gönderir).
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("E-posta veya şifre hatalı.", 422);
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.password))) {
    return apiError("E-posta veya şifre hatalı.", 401);
  }
  if (user.isBanned) {
    return apiError("Hesabınız askıya alınmıştır.", 403);
  }

  const token = await signSessionToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return apiJson({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
    },
  });
}
