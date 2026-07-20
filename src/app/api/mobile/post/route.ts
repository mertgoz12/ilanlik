import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { simpleListingSchema } from "@/lib/validation";
import { generateListingNo } from "@/lib/listing-no";
import { MAX_IMAGES_PER_LISTING, uploadListingPhoto } from "@/lib/listing-photos";

// POST /api/mobile/post  (multipart/form-data)
// Alanlar: title, categoryId, description?, price, condition?, il, ilce,
// isNegotiable?, images[] (dosyalar). Web createSimpleListingAction ile aynı:
// doğrula -> ilan oluştur -> fotoğrafları yükle -> pending_review.
export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  // Web requireValidUser ile aynı: banlı/doğrulanmamış kullanıcı ilan veremez.
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isBanned: true, emailVerified: true },
  });
  if (!dbUser) return apiError("Oturum geçersiz.", 401);
  if (dbUser.isBanned) return apiError("Hesabınız askıya alınmış.", 403);
  if (!dbUser.emailVerified) {
    return apiError("İlan vermek için e-posta adresinizi doğrulamalısınız.", 403);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }

  const parsed = simpleListingSchema.safeParse({
    title: form.get("title"),
    categoryId: form.get("categoryId"),
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

  const category = await prisma.category.findUnique({ where: { id: data.categoryId }, select: { id: true } });
  if (!category) return apiError("Geçersiz kategori.");

  // Benzersiz ilan numarası.
  let listingNo = generateListingNo();
  for (let i = 0; i < 10; i++) {
    const exists = await prisma.listing.findUnique({ where: { listingNo }, select: { id: true } });
    if (!exists) break;
    listingNo = generateListingNo();
  }

  const isNegotiable = form.get("isNegotiable") === "true";

  const listing = await prisma.listing.create({
    data: {
      listingNo,
      title: data.title,
      categoryId: data.categoryId,
      description: data.description || null,
      price: data.price,
      condition: data.condition || null,
      isNegotiable,
      il: data.il,
      ilce: data.ilce,
      userId: user.id,
    },
  });

  // Fotoğraflar (Vercel Blob) - bozuk dosya akışı çökertmez, atlanır.
  const files = form
    .getAll("images")
    .filter((e): e is File => e instanceof File && e.size > 0)
    .slice(0, MAX_IMAGES_PER_LISTING);
  let order = 0;
  for (const file of files) {
    const result = await uploadListingPhoto(file, listing.id);
    if (result.ok) {
      await prisma.listingImage.create({ data: { url: result.url, order: order++, listingId: listing.id } });
    }
  }

  // Tüm yeni ilanlar admin onayı bekler (web ile aynı).
  await prisma.listing.update({ where: { id: listing.id }, data: { status: "pending_review" } });

  return apiJson({ listingNo: listing.listingNo, status: "pending_review", photoCount: order });
}
