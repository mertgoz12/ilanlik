import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { getFeatureAllowance } from "@/lib/featuring";
import { editListingSchema } from "@/lib/validation";
import {
  MAX_IMAGES_PER_LISTING,
  uploadListingPhoto,
  deleteListingPhotoBlob,
} from "@/lib/listing-photos";

// POST /api/mobile/me/listings/:id  { action }
// İlan yönetimi: feature | unfeature | publish | unpublish | resubmit | delete.
// Web hesabim/ilanlarim/actions.ts ile aynı mantık ve güvenlik (sahiplik + durum).
type Action = "feature" | "unfeature" | "publish" | "unpublish" | "resubmit" | "delete";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);
  const { id } = await params;

  let body: { action?: Action };
  try {
    body = await request.json();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }
  const action = body.action;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { id: true, userId: true, status: true, isFeatured: true },
  });
  if (!listing || listing.userId !== user.id) {
    return apiError("Bu ilan üzerinde işlem yapma yetkiniz yok.", 403);
  }

  switch (action) {
    case "feature": {
      if (listing.status !== "active") return apiError("Yalnızca yayında olan ilanlar öne çıkarılabilir.");
      if (listing.isFeatured) return apiJson({ ok: true });
      const { remaining } = await getFeatureAllowance(user.id);
      if (remaining <= 0) {
        return apiError("Öne çıkarma hakkınız yok. Yayında olan her 3 ilan için 1 hak kazanırsınız.");
      }
      await prisma.listing.update({ where: { id }, data: { isFeatured: true } });
      return apiJson({ ok: true });
    }
    case "unfeature":
      await prisma.listing.update({ where: { id }, data: { isFeatured: false } });
      return apiJson({ ok: true });
    case "publish":
      if (listing.status === "pending_review") {
        return apiError("İnceleme bekleyen bir ilanı doğrudan yayına alamazsınız.");
      }
      await prisma.listing.update({ where: { id }, data: { status: "active" } });
      return apiJson({ ok: true });
    case "unpublish":
      await prisma.listing.update({ where: { id }, data: { status: "pasif" } });
      return apiJson({ ok: true });
    case "resubmit":
      if (listing.status !== "rejected") {
        return apiError("Yalnızca reddedilen ilanlar tekrar onaya gönderilebilir.");
      }
      await prisma.listing.update({
        where: { id },
        data: { status: "pending_review", rejectionReason: null, reviewedAt: null },
      });
      return apiJson({ ok: true });
    case "delete":
      await prisma.listing.delete({ where: { id } });
      return apiJson({ ok: true });
    default:
      return apiError("Geçersiz işlem.");
  }
}

// PUT /api/mobile/me/listings/:id - ilan düzenleme (multipart/form-data).
// Metin alanları + tutulacak fotoğraf id'leri (keepImageIds) + yeni fotoğraflar
// (images[]). Tutulmayan mevcut fotoğraflar silinir, yeniler eklenir. Reddedilen
// ilan düzenlenince tekrar onaya gider (web updateListingAction ile aynı).
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { id: true, userId: true, status: true },
  });
  if (!listing || listing.userId !== user.id) {
    return apiError("Bu ilan üzerinde işlem yapma yetkiniz yok.", 403);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }

  const parsed = editListingSchema.safeParse({
    title: form.get("title"),
    description: form.get("description"),
    price: form.get("price"),
    condition: form.get("condition"),
    il: form.get("il"),
    ilce: form.get("ilce"),
  });
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const first = Object.values(fieldErrors).flat()[0] ?? "Bilgileri kontrol edin.";
    return apiJson({ error: first, fieldErrors }, { status: 422 });
  }
  const data = parsed.data;

  // Fotoğraf senkronizasyonu: mevcut görseller içinde tutulmayanları sil, yeni
  // dosyaları ekle. Toplam en az 1, en fazla MAX_IMAGES_PER_LISTING olmalı.
  const keepIds = new Set(form.getAll("keepImageIds").map((v) => String(v)));
  const current = await prisma.listingImage.findMany({
    where: { listingId: id },
    select: { id: true, url: true, order: true },
    orderBy: { order: "asc" },
  });
  const toDelete = current.filter((img) => !keepIds.has(img.id));
  const kept = current.filter((img) => keepIds.has(img.id));

  const newFiles = form
    .getAll("images")
    .filter((e): e is File => e instanceof File && e.size > 0);

  const totalAfter = kept.length + newFiles.length;
  if (totalAfter < 1) return apiError("İlanda en az bir fotoğraf bulunmalı.", 422);
  if (totalAfter > MAX_IMAGES_PER_LISTING) {
    return apiError(`En fazla ${MAX_IMAGES_PER_LISTING} fotoğraf ekleyebilirsiniz.`, 422);
  }

  await prisma.listing.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description || null,
      price: data.price,
      condition: data.condition || null,
      il: data.il,
      ilce: data.ilce,
      ...(listing.status === "rejected"
        ? { status: "pending_review", rejectionReason: null, reviewedAt: null }
        : {}),
    },
  });

  // Kaldırılan fotoğrafları sil (Blob + DB).
  for (const img of toDelete) {
    await deleteListingPhotoBlob(img.url);
    await prisma.listingImage.delete({ where: { id: img.id } });
  }

  // Yeni fotoğrafları yükle, mevcut en yüksek order'dan sonra ekle.
  let order = kept.reduce((max, img) => Math.max(max, img.order), -1) + 1;
  const slots = MAX_IMAGES_PER_LISTING - kept.length;
  for (const file of newFiles.slice(0, slots)) {
    const result = await uploadListingPhoto(file, id);
    if (result.ok) {
      await prisma.listingImage.create({ data: { url: result.url, order: order++, listingId: id } });
    }
  }

  return apiJson({ ok: true });
}
