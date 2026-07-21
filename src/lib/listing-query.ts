import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import { collectSlugs, findCategory } from "./categories";

export type ListingSearchParams = Record<string, string | undefined>;

// Anasayfa (/) ve Favori Aramalarım (kayıtlı arama eşleşme sayısı) tarafından
// paylaşılan filtre mantığı: aynı querystring her zaman aynı `where`'i üretir.
export async function buildListingWhere(sp: ListingSearchParams): Promise<Prisma.ListingWhereInput> {
  // Sadece aktif ilanlar gösterilir; pasif, incelemede ve silinmiş ilanlar dışlanır.
  // Opsiyonlanmış ilanlar da geçici olarak (opsiyon süresince) listelemeden gizlenir.
  const where: Prisma.ListingWhereInput = { status: "active", optionStatus: { not: "opsiyonlandi" } };

  if (sp.q) {
    // Kelime veya ilan numarası: başlık/marka/model + ilan numarasında arar.
    // mode: "insensitive" -> büyük/küçük harf duyarsız (Postgres varsayılanı
    // duyarlı; "lenovo" aramasi "Lenovo"yu bulmalı).
    where.OR = [
      { title: { contains: sp.q, mode: "insensitive" } },
      { brand: { contains: sp.q, mode: "insensitive" } },
      { model: { contains: sp.q, mode: "insensitive" } },
      { listingNo: { contains: sp.q } },
    ];
  }
  if (sp.brand) where.brand = sp.brand;
  if (sp.model) where.model = sp.model;
  if (sp.il) where.il = sp.il;
  if (sp.ilce) where.ilce = sp.ilce;
  if (sp.fuelType) where.fuelType = sp.fuelType;
  if (sp.condition) where.condition = sp.condition;

  if (sp.minYear || sp.maxYear) {
    where.year = {
      ...(sp.minYear ? { gte: Number(sp.minYear) } : {}),
      ...(sp.maxYear ? { lte: Number(sp.maxYear) } : {}),
    };
  }
  if (sp.minPrice || sp.maxPrice) {
    where.price = {
      ...(sp.minPrice ? { gte: Number(sp.minPrice) } : {}),
      ...(sp.maxPrice ? { lte: Number(sp.maxPrice) } : {}),
    };
  }

  // İlan tarihi filtresi: sp.tarih = son N gün ("1" | "2" | "7" | "15" | "30").
  const tarihGun = Number(sp.tarih);
  if (Number.isFinite(tarihGun) && tarihGun > 0) {
    where.createdAt = { gte: new Date(Date.now() - tarihGun * 24 * 60 * 60 * 1000) };
  }

  if (sp.kategori) {
    const node = findCategory(sp.kategori);
    if (node) {
      const slugs = collectSlugs(node);
      const cats = await prisma.category.findMany({
        where: { slug: { in: slugs } },
        select: { id: true },
      });
      where.categoryId = { in: cats.map((c) => c.id) };
    }
  }

  return where;
}

// Kayıtlı bir aramanın querystring'ini (örn. "kategori=otomobil&brand=BMW")
// tekrar arama parametrelerine çevirir.
export function parseListingQuery(query: string): ListingSearchParams {
  return Object.fromEntries(new URLSearchParams(query));
}
