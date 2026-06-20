"use server";

import { prisma } from "@/lib/prisma";
import { isComingSoonSlug, searchSelectableCategories } from "@/lib/categories";

export type CategorySuggestion = {
  slug: string;
  name: string;
  groupName: string;
};

export type ListingSuggestion = {
  listingNo: string;
  title: string;
  price: number;
  imageUrl: string | null;
};

export type SearchSuggestions = {
  categories: CategorySuggestion[];
  listings: ListingSuggestion[];
};

// 1-2 harfte veritabanını taramak hem yavaş hem anlamsız sonuç verir; arama
// kutusu en az bu kadar karakter yazılana kadar sunucuya hiç istek atmaz.
const MIN_QUERY_LENGTH = 2;
const CATEGORY_LIMIT = 5;
const LISTING_LIMIT = 5;
const POPULAR_CATEGORY_LIMIT = 8;

const VISIBLE_LISTING_WHERE = { status: "active", optionStatus: { not: "opsiyonlandi" } } as const;

export async function getSearchSuggestionsAction(query: string): Promise<SearchSuggestions> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return { categories: [], listings: [] };
  }

  const categories = searchSelectableCategories(trimmed, CATEGORY_LIMIT);

  const listings = await prisma.listing.findMany({
    where: { ...VISIBLE_LISTING_WHERE, title: { contains: trimmed, mode: "insensitive" } },
    select: {
      listingNo: true,
      title: true,
      price: true,
      images: { take: 1, orderBy: { order: "asc" }, select: { url: true } },
    },
    orderBy: { createdAt: "desc" },
    take: LISTING_LIMIT,
  });

  return {
    categories,
    listings: listings.map((listing) => ({
      listingNo: listing.listingNo,
      title: listing.title,
      price: listing.price,
      imageUrl: listing.images[0]?.url ?? null,
    })),
  };
}

// Arama kutusu boşken (henüz yazılmamışken) gösterilecek öneriler - gerçek
// arama geçmişi loglamak yerine, mevcut aktif ilan dağılımından en kalabalık
// kategoriler "popüler" kabul edilir.
export async function getPopularSearchesAction(): Promise<{ categories: CategorySuggestion[] }> {
  const grouped = await prisma.listing.groupBy({
    by: ["categoryId"],
    where: VISIBLE_LISTING_WHERE,
    _count: { categoryId: true },
    orderBy: { _count: { categoryId: "desc" } },
    take: POPULAR_CATEGORY_LIMIT * 2,
  });
  if (grouped.length === 0) return { categories: [] };

  const categoryRows = await prisma.category.findMany({
    where: { id: { in: grouped.map((g) => g.categoryId) } },
    select: { id: true, slug: true, name: true, parent: { select: { name: true } } },
  });
  const rowById = new Map(categoryRows.map((row) => [row.id, row]));

  const categories: CategorySuggestion[] = [];
  for (const group of grouped) {
    const row = rowById.get(group.categoryId);
    if (!row || isComingSoonSlug(row.slug)) continue;
    categories.push({ slug: row.slug, name: row.name, groupName: row.parent?.name ?? row.name });
    if (categories.length >= POPULAR_CATEGORY_LIMIT) break;
  }

  return { categories };
}
