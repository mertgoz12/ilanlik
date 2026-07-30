import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { createOption, endOption } from "@/lib/listing-options";

// POST /api/mobile/listings/:listingNo/option
// Alıcı ilanı seçtiği süre (durationHours) kadar rezerve eder. Web'deki
// createOptionAction ile aynı iş kuralları (bkz. src/lib/listing-options.ts).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ listingNo: string }> },
) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Bu ürünü opsiyonlamak için giriş yapmalısınız.", 401);

  const { listingNo } = await params;
  const body = await request.json().catch(() => null);
  const durationHours = Number(body?.durationHours);
  if (!Number.isFinite(durationHours) || durationHours <= 0) {
    return apiError("Lütfen bir opsiyon süresi seçin.");
  }

  const listing = await prisma.listing.findUnique({
    where: { listingNo },
    select: { id: true },
  });
  if (!listing) return apiError("İlan bulunamadı.", 404);

  const result = await createOption({ listingId: listing.id, buyerId: user.id, durationHours });
  if (!result.ok) return apiError(result.error);

  return apiJson({ ok: true });
}

// DELETE /api/mobile/listings/:listingNo/option
// Opsiyonu sonlandırır: alıcı ("vazgeç") veya satıcı. Gerçek yetki kontrolü
// endOption() içinde yapılır.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ listingNo: string }> },
) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  const { listingNo } = await params;
  const listing = await prisma.listing.findUnique({
    where: { listingNo },
    select: { id: true },
  });
  if (!listing) return apiError("İlan bulunamadı.", 404);

  const result = await endOption({ listingId: listing.id, actingUserId: user.id });
  if (!result.ok) return apiError(result.error);

  return apiJson({ ok: true });
}
