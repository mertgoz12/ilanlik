import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";

const MIN_REASON = 10;
const MAX_REASON = 1000;

// POST /api/mobile/listings/:listingNo/report  { reason }
// Kullanıcı şikayeti oluşturur; admin Moderasyon Kuyruğu "pending" kayıtları
// listeler (web reportListingAction ile aynı mantık ve doğrulama).
export async function POST(request: Request, { params }: { params: Promise<{ listingNo: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Şikayet göndermek için giriş yapmalısınız.", 401);

  const { listingNo } = await params;

  let body: { reason?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }

  const reason = String(body.reason ?? "").trim();
  if (reason.length < MIN_REASON) {
    return apiError("Lütfen şikayet sebebinizi en az 10 karakterle açıklayın.");
  }
  if (reason.length > MAX_REASON) {
    return apiError("Açıklama en fazla 1000 karakter olabilir.");
  }

  const listing = await prisma.listing.findUnique({
    where: { listingNo },
    select: { id: true, userId: true },
  });
  if (!listing) return apiError("İlan bulunamadı.", 404);
  if (listing.userId === user.id) return apiError("Kendi ilanınızı şikayet edemezsiniz.");

  await prisma.listingReport.create({
    data: { listingId: listing.id, userId: user.id, reason },
  });

  return apiJson({ ok: true });
}
