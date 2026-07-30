import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { expireStaleOptions } from "@/lib/listing-options";

const HISTORY_LIMIT = 20;

// GET /api/mobile/me/options
// "Opsiyonladıklarım" ekranı: aktif opsiyonlar (rezerve edilen ilanlar) +
// opsiyon geçmişi. Web /hesabim/opsiyonlarim ile aynı veriler.
export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  await expireStaleOptions();

  const [activeRows, historyRows] = await Promise.all([
    prisma.listing.findMany({
      where: { optionHolderId: user.id, optionStatus: "opsiyonlandi" },
      orderBy: { optionStartAt: "desc" },
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
    }),
    prisma.listingOption.findMany({
      where: { buyerId: user.id, status: "bitti" },
      orderBy: { endedAt: "desc" },
      take: HISTORY_LIMIT,
      include: { listing: { select: { title: true, listingNo: true } } },
    }),
  ]);

  const active = activeRows.map((l) => ({
    id: l.id,
    listingNo: l.listingNo,
    title: l.title,
    price: l.price,
    imageUrl: l.images[0]?.url ?? null,
    optionEndAt: l.optionEndAt ? l.optionEndAt.toISOString() : null,
  }));

  const history = historyRows.map((o) => ({
    id: o.id,
    title: o.listing.title,
    listingNo: o.listing.listingNo,
    durationHours: o.durationHours,
    endReason: o.endReason,
    endedAt: o.endedAt ? o.endedAt.toISOString() : null,
  }));

  return apiJson({ active, history });
}
