import { prisma } from "@/lib/prisma";
import { apiJson, apiError } from "@/lib/mobile-api";
import { analyzeListing, loadAnalysisContext } from "@/lib/mobile-analysis";
import { parseAiAnalysis } from "@/lib/ai-analysis";

// GET /api/mobile/listings/:listingNo
// İlan detay ekranı: tam ilan + görseller + kategori + satıcı özeti.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ listingNo: string }> },
) {
  const { listingNo } = await params;

  const l = await prisma.listing.findUnique({
    where: { listingNo },
    include: {
      images: { orderBy: { order: "asc" } },
      category: { include: { parent: { select: { name: true, slug: true } } } },
      user: { select: { id: true, name: true, phone: true, avatarUrl: true, createdAt: true } },
      _count: { select: { images: true } },
    },
  });

  if (!l || l.status !== "active") {
    return apiError("İlan bulunamadı.", 404);
  }

  // Görüntülenme sayacını artır (web ilan detayı ile aynı davranış) - hata
  // olsa da yanıtı bloklamaz.
  prisma.listing.update({ where: { id: l.id }, data: { views: { increment: 1 } } }).catch(() => {});

  // Güven puanı + fiyat/ekspertiz analizi (web ilan detayı ile birebir).
  const ctx = await loadAnalysisContext();
  const analysis = analyzeListing({ ...l, photoCount: l._count.images }, ctx);
  const ekspertiz = parseAiAnalysis(l.aiAnalysis)?.ekspertiz_raporu ?? null;

  const listing = {
    id: l.id,
    listingNo: l.listingNo,
    title: l.title,
    description: l.description,
    price: l.price,
    condition: l.condition,
    il: l.il,
    ilce: l.ilce,
    isFeatured: l.isFeatured,
    isNegotiable: l.isNegotiable,
    views: l.views,
    createdAt: l.createdAt.toISOString(),
    // Vasıta alanları (diğer kategorilerde null)
    brand: l.brand,
    model: l.model,
    year: l.year,
    km: l.km,
    fuelType: l.fuelType,
    transmission: l.transmission,
    bodyType: l.bodyType,
    color: l.color,
    images: l.images.map((img) => ({ id: img.id, url: img.url })),
    category: {
      name: l.category.name,
      slug: l.category.slug,
      parentName: l.category.parent?.name ?? null,
    },
    seller: {
      id: l.user.id,
      name: l.user.name,
      phone: l.user.phone,
      avatarUrl: l.user.avatarUrl,
      memberSince: l.user.createdAt.toISOString(),
    },
    // Yapay zeka / güven puanı (web AiReportCard ile aynı veriler)
    trustScore: analysis.tutarlilik_analizi.guven_puani,
    priceStatus: analysis.fiyat_analizi.fiyat_durumu,
    analysis,
    ekspertiz,
  };

  return apiJson({ listing });
}
