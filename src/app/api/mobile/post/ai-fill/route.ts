import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { runGeminiFill, type GeminiFillImage } from "@/lib/gemini-fill";
import { checkGeminiFillRateLimit, recordGeminiFillUsage } from "@/lib/gemini-fill-limits";

const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

// POST /api/mobile/post/ai-fill  (multipart: images[], categoryName?)
// Web suggestListingFromPhotosAction ile aynı: fotoğrafları Gemini'ye gönderip
// başlık/açıklama/durum/fiyat/kategori önerisi döndürür. Limit/hata durumunda
// çökmez, "elle doldurun" mesajı verir.
export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Bu özelliği kullanmak için giriş yapın.", 401);

  const xff = request.headers.get("x-forwarded-for");
  const ip = xff ? xff.split(",")[0].trim() : request.headers.get("x-real-ip");

  const limit = await checkGeminiFillRateLimit({ userId: user.id, ip });
  if (!limit.ok) {
    return apiError("Bugünlük yapay zeka doldurma hakkınız doldu. Bilgileri elle doldurabilirsiniz.", 429);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }

  const files = form
    .getAll("images")
    .filter((e): e is File => e instanceof File && e.size > 0 && e.size <= MAX_IMAGE_BYTES)
    .slice(0, MAX_IMAGES);
  if (files.length === 0) return apiError("Önce en az bir fotoğraf ekleyin.");

  const images: GeminiFillImage[] = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type?.startsWith("image/") ? file.type : "image/jpeg";
    images.push({ data: buffer.toString("base64"), mimeType });
  }

  const categoryName = (form.get("categoryName") as string)?.trim() || null;

  const outcome = await runGeminiFill(images, categoryName);
  if (!outcome.ok) return apiError(outcome.error);

  await recordGeminiFillUsage({ userId: user.id, ip });

  // Önerilen kategori slug'ını gerçek kategori id'sine eşle (wizard seçsin).
  let categoryId: string | null = null;
  let matchedName: string | null = null;
  if (outcome.suggestion.categorySlug) {
    const cat = await prisma.category.findUnique({
      where: { slug: outcome.suggestion.categorySlug },
      select: { id: true, name: true },
    });
    if (cat) {
      categoryId = cat.id;
      matchedName = cat.name;
    }
  }

  return apiJson({ suggestion: outcome.suggestion, categoryId, categoryName: matchedName });
}
