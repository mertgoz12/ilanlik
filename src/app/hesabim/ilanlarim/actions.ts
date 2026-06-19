"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/account-auth";
import { prisma } from "@/lib/prisma";
import { editListingSchema } from "@/lib/validation";

// Sahiplik doğrulaması her zaman taze veritabanı durumuna göre yapılır; arayüz
// başkasının ilanı için bu aksiyonları göstermese de server action seviyesinde
// yeniden kontrol edilir (ikinci savunma katmanı).
async function getOwnedListing(listingId: string, userId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, userId: true, status: true, title: true, listingNo: true },
  });
  if (!listing || listing.userId !== userId) {
    throw new Error("Bu ilan üzerinde işlem yapma yetkiniz yok.");
  }
  return listing;
}

function revalidateListingPaths(listingNo?: string) {
  revalidatePath("/hesabim/ilanlarim");
  revalidatePath("/hesabim");
  revalidatePath("/hesabim/favorilerim");
  revalidatePath("/");
  if (listingNo) revalidatePath(`/ilan/${listingNo}`);
}

export async function publishListingAction(listingId: string) {
  const session = await requireUser();
  const listing = await getOwnedListing(listingId, session.id);
  if (listing.status === "pending_review") {
    throw new Error("İnceleme bekleyen bir ilanı doğrudan yayına alamazsınız.");
  }
  await prisma.listing.update({ where: { id: listingId }, data: { status: "active" } });
  revalidateListingPaths(listing.listingNo);
}

export async function unpublishListingAction(listingId: string) {
  const session = await requireUser();
  const listing = await getOwnedListing(listingId, session.id);
  await prisma.listing.update({ where: { id: listingId }, data: { status: "pasif" } });
  revalidateListingPaths(listing.listingNo);
}

export async function deleteListingAction(listingId: string) {
  const session = await requireUser();
  const listing = await getOwnedListing(listingId, session.id);
  await prisma.listing.delete({ where: { id: listingId } });
  revalidateListingPaths(listing.listingNo);
}

export type EditListingFormState = {
  error?: string;
  fieldErrors?: {
    title?: string[];
    description?: string[];
    price?: string[];
    il?: string[];
    ilce?: string[];
  };
};

export async function updateListingAction(
  listingId: string,
  _prevState: EditListingFormState,
  formData: FormData,
): Promise<EditListingFormState> {
  const session = await requireUser();
  const listing = await getOwnedListing(listingId, session.id);

  const parsed = editListingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    il: formData.get("il"),
    ilce: formData.get("ilce"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      price: parsed.data.price,
      il: parsed.data.il,
      ilce: parsed.data.ilce,
    },
  });

  revalidateListingPaths(listing.listingNo);
  redirect("/hesabim/ilanlarim");
}
