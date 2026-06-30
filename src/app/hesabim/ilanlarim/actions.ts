"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/account-auth";
import { prisma } from "@/lib/prisma";
import { editListingSchema } from "@/lib/validation";
import { MAX_IMAGES_PER_LISTING, deleteListingPhotoBlob, uploadListingPhoto } from "@/lib/listing-photos";

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

// Reddedilen bir ilanı düzeltmeden olduğu gibi tekrar admin onayına gönderir.
// (Düzenleme akışı da rejected -> pending_review yapar, bkz. updateListingAction.)
export async function resubmitListingAction(listingId: string) {
  const session = await requireUser();
  const listing = await getOwnedListing(listingId, session.id);
  if (listing.status !== "rejected") {
    throw new Error("Yalnızca reddedilen ilanlar tekrar onaya gönderilebilir.");
  }
  await prisma.listing.update({
    where: { id: listingId },
    data: { status: "pending_review", rejectionReason: null, reviewedAt: null },
  });
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
    condition?: string[];
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
    condition: formData.get("condition"),
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
      condition: parsed.data.condition || null,
      il: parsed.data.il,
      ilce: parsed.data.ilce,
      // Reddedilen bir ilan düzenlenince otomatik olarak tekrar onaya gider.
      ...(listing.status === "rejected"
        ? { status: "pending_review", rejectionReason: null, reviewedAt: null }
        : {}),
    },
  });

  revalidateListingPaths(listing.listingNo);
  redirect("/hesabim/ilanlarim");
}

export type AddListingPhotosState = {
  error?: string;
  addedCount?: number;
};

export async function addListingPhotosAction(
  listingId: string,
  _prevState: AddListingPhotosState,
  formData: FormData,
): Promise<AddListingPhotosState> {
  const session = await requireUser();
  const listing = await getOwnedListing(listingId, session.id);

  const existingCount = await prisma.listingImage.count({ where: { listingId } });
  const remainingSlots = MAX_IMAGES_PER_LISTING - existingCount;
  if (remainingSlots <= 0) {
    return { error: `Bu ilan için en fazla ${MAX_IMAGES_PER_LISTING} fotoğraf yükleyebilirsiniz.` };
  }

  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)
    .slice(0, remainingSlots);

  if (files.length === 0) {
    return { error: "Geçerli bir fotoğraf seçilmedi." };
  }

  let order = existingCount;
  const errors: string[] = [];
  for (const file of files) {
    const result = await uploadListingPhoto(file, listingId);
    if (result.ok) {
      await prisma.listingImage.create({ data: { url: result.url, order: order++, listingId } });
    } else {
      errors.push(result.error);
    }
  }

  revalidateListingPaths(listing.listingNo);
  const addedCount = order - existingCount;
  return errors.length > 0 ? { error: errors.join(" "), addedCount } : { addedCount };
}

export async function deleteListingPhotoAction(listingId: string, imageId: string): Promise<void> {
  const session = await requireUser();
  const listing = await getOwnedListing(listingId, session.id);

  const image = await prisma.listingImage.findUnique({ where: { id: imageId } });
  if (!image || image.listingId !== listingId) {
    throw new Error("Fotoğraf bulunamadı.");
  }

  await deleteListingPhotoBlob(image.url);
  await prisma.listingImage.delete({ where: { id: imageId } });

  // Kalan fotoğrafların sıra numarasını 0'dan başlayarak yeniden ardışık
  // hale getir - "order: 0" her zaman kapak fotoğrafı anlamına gelir.
  const remaining = await prisma.listingImage.findMany({ where: { listingId }, orderBy: { order: "asc" } });
  await prisma.$transaction(
    remaining.map((img, index) => prisma.listingImage.update({ where: { id: img.id }, data: { order: index } })),
  );

  revalidateListingPaths(listing.listingNo);
}

export async function makeCoverPhotoAction(listingId: string, imageId: string): Promise<void> {
  const session = await requireUser();
  const listing = await getOwnedListing(listingId, session.id);

  const images = await prisma.listingImage.findMany({ where: { listingId }, orderBy: { order: "asc" } });
  const target = images.find((img) => img.id === imageId);
  if (!target) {
    throw new Error("Fotoğraf bulunamadı.");
  }

  const reordered = [target, ...images.filter((img) => img.id !== imageId)];
  await prisma.$transaction(
    reordered.map((img, index) => prisma.listingImage.update({ where: { id: img.id }, data: { order: index } })),
  );

  revalidateListingPaths(listing.listingNo);
}
