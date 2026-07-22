import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";

// POST /api/mobile/me/location  { il, ilce }
// Uygulama, konumdan tespit ettiği il/ilçeyi kaydeder - "yakınında yeni ilan"
// bildirimleri bu ilçeye göre gönderilir.
export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  let body: { il?: string; ilce?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { il: body.il || null, ilce: body.ilce || null },
  });

  return apiJson({ ok: true });
}
