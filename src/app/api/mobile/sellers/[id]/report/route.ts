import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";

const MIN = 10;
const MAX = 1000;

// POST /api/mobile/sellers/:id/report  { reason } -> kullanıcı şikayeti.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Şikayet için giriş yapmalısınız.", 401);

  const { id } = await params;
  if (id === user.id) return apiError("Kendinizi şikayet edemezsiniz.");

  let body: { reason?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }
  const reason = String(body.reason ?? "").trim();
  if (reason.length < MIN) return apiError("Lütfen sebebi en az 10 karakterle açıklayın.");
  if (reason.length > MAX) return apiError("Açıklama en fazla 1000 karakter olabilir.");

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!target) return apiError("Kullanıcı bulunamadı.", 404);

  await prisma.userReport.create({ data: { reporterId: user.id, reportedUserId: id, reason } });
  return apiJson({ ok: true });
}
