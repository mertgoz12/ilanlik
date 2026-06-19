"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/account-auth";
import { prisma } from "@/lib/prisma";
import { buildListingWhere, parseListingQuery } from "@/lib/listing-query";

// Hesabım > Favorilerim sayfasını yeni durumla göstermek için yeniden
// doğrulanır; ilan kartlarındaki kalp butonu bu aksiyonu çağırır.
export async function toggleFavoriteAction(listingId: string): Promise<{ favorited: boolean }> {
  const session = await requireUser();

  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId: session.id, listingId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/hesabim/favorilerim");
    return { favorited: false };
  }

  await prisma.favorite.create({ data: { userId: session.id, listingId } });
  revalidatePath("/hesabim/favorilerim");
  return { favorited: true };
}

export async function toggleSellerFollowAction(sellerId: string): Promise<{ following: boolean }> {
  const session = await requireUser();
  if (session.id === sellerId) {
    throw new Error("Kendinizi takip edemezsiniz.");
  }

  const existing = await prisma.sellerFollow.findUnique({
    where: { followerId_sellerId: { followerId: session.id, sellerId } },
  });

  if (existing) {
    await prisma.sellerFollow.delete({ where: { id: existing.id } });
    revalidatePath("/hesabim/favorilerim");
    return { following: false };
  }

  await prisma.sellerFollow.create({ data: { followerId: session.id, sellerId } });
  revalidatePath("/hesabim/favorilerim");
  return { following: true };
}

export type SaveSearchFormState = { error?: string; success?: boolean };

export async function saveSearchAction(
  _prevState: SaveSearchFormState,
  formData: FormData,
): Promise<SaveSearchFormState> {
  const session = await requireUser();
  const label = String(formData.get("label") ?? "").trim();
  const query = String(formData.get("query") ?? "").trim();

  if (!label) return { error: "Arama için bir ad girin." };
  if (label.length > 80) return { error: "Arama adı en fazla 80 karakter olabilir." };

  const where = await buildListingWhere(parseListingQuery(query));
  const lastSeenCount = await prisma.listing.count({ where });

  await prisma.savedSearch.create({
    data: { userId: session.id, label, query, lastSeenCount },
  });

  revalidatePath("/hesabim/favorilerim");
  return { success: true };
}

async function getOwnedSavedSearch(savedSearchId: string, userId: string) {
  const search = await prisma.savedSearch.findUnique({ where: { id: savedSearchId } });
  if (!search || search.userId !== userId) {
    throw new Error("Bu kayıtlı arama üzerinde işlem yapma yetkiniz yok.");
  }
  return search;
}

export async function deleteSavedSearchAction(savedSearchId: string) {
  const session = await requireUser();
  await getOwnedSavedSearch(savedSearchId, session.id);
  await prisma.savedSearch.delete({ where: { id: savedSearchId } });
  revalidatePath("/hesabim/favorilerim");
}

export async function markSavedSearchSeenAction(savedSearchId: string) {
  const session = await requireUser();
  const search = await getOwnedSavedSearch(savedSearchId, session.id);
  const where = await buildListingWhere(parseListingQuery(search.query));
  const currentCount = await prisma.listing.count({ where });
  await prisma.savedSearch.update({ where: { id: savedSearchId }, data: { lastSeenCount: currentCount } });
  revalidatePath("/hesabim/favorilerim");
}
