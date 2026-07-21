import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { buildListingWhere, parseListingQuery } from "@/lib/listing-query";

// GET /api/mobile/saved-searches - kayıtlı aramalar + güncel/yeni eşleşme sayısı.
export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  const searches = await prisma.savedSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const savedSearches = await Promise.all(
    searches.map(async (s) => {
      const where = await buildListingWhere(parseListingQuery(s.query));
      const currentCount = await prisma.listing.count({ where });
      return {
        id: s.id,
        label: s.label,
        query: s.query,
        currentCount,
        newCount: Math.max(0, currentCount - s.lastSeenCount),
        createdAt: s.createdAt.toISOString(),
      };
    }),
  );

  return apiJson({ savedSearches });
}

// POST /api/mobile/saved-searches  { label, query }
export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  let body: { label?: string; query?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }
  const label = (body.label ?? "").trim();
  const query = (body.query ?? "").trim();
  if (!label) return apiError("Arama için bir ad girin.");
  if (label.length > 80) return apiError("Arama adı en fazla 80 karakter olabilir.");

  const where = await buildListingWhere(parseListingQuery(query));
  const lastSeenCount = await prisma.listing.count({ where });

  await prisma.savedSearch.create({ data: { userId: user.id, label, query, lastSeenCount } });
  return apiJson({ ok: true });
}
