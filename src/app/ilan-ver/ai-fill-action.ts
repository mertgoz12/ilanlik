"use server";

import { headers } from "next/headers";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { runGeminiFill, type GeminiFillImage, type GeminiFillSuggestion } from "@/lib/gemini-fill";
import { checkGeminiFillRateLimit, recordGeminiFillUsage } from "@/lib/gemini-fill-limits";

// Aynı maliyet/payload kontrolü için en fazla bu kadar fotoğraf Gemini'ye
// gönderilir (ilk fotoğraflar genelde en açıklayıcı olanlardır).
const MAX_IMAGES = 4;
// Tek bir devasa dosya isteği şişirmesin; bu sınırın üstündeki görseller atlanır.
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

export type AiFillResult =
  | {
      ok: true;
      suggestion: GeminiFillSuggestion;
      // categorySlug'ın platformdaki gerçek kategori kaydına eşlemesi (varsa);
      // arayüz kullanıcıya "AI bunu şu kategoride gördü" bilgisini gösterir.
      categoryId: string | null;
      categoryName: string | null;
    }
  | { ok: false; error: string };

async function getClientIp(): Promise<string | null> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return headerList.get("x-real-ip");
}

const RATE_LIMIT_MESSAGES: Record<string, string> = {
  kullanici_limiti: "Bugünlük yapay zeka doldurma hakkınız doldu. Bilgileri elle doldurabilirsiniz.",
  ip_limiti: "Bugünlük yapay zeka doldurma hakkınız doldu. Bilgileri elle doldurabilirsiniz.",
  genel_limit: "Yapay zeka şu an çok yoğun. Lütfen bilgileri elle doldurun.",
};

// /ilan-ver fotoğraf adımındaki OPSİYONEL "Yapay Zeka ile Doldur" butonundan
// çağrılır. Yüklenen fotoğrafları Gemini'ye gönderip ilan alanları için öneri
// döndürür. Hata/limit durumunda asla çökmez, kullanıcıya "elle doldurun" der.
export async function suggestListingFromPhotosAction(formData: FormData): Promise<AiFillResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "Bu özelliği kullanmak için giriş yapın." };
  }

  const ip = await getClientIp();

  // Maliyet kontrolü: kullanıcı/IP başına ve sistem genelinde günlük limit.
  const limit = await checkGeminiFillRateLimit({ userId: session.id, ip });
  if (!limit.ok) {
    return { ok: false, error: RATE_LIMIT_MESSAGES[limit.reason] };
  }

  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0 && entry.size <= MAX_IMAGE_BYTES)
    .slice(0, MAX_IMAGES);

  if (files.length === 0) {
    return { ok: false, error: "Önce en az bir fotoğraf yükleyin." };
  }

  const images: GeminiFillImage[] = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
    images.push({ data: buffer.toString("base64"), mimeType });
  }

  const selectedCategoryName = (formData.get("categoryName") as string)?.trim() || null;

  const outcome = await runGeminiFill(images, selectedCategoryName);
  if (!outcome.ok) {
    return { ok: false, error: outcome.error };
  }

  // Başarılı çağrıyı kaydet (günlük limit bu kayda göre sayılır). İlan başına
  // tek sonuç forma yansır ve ilan gönderilince başlık/açıklama olarak kalıcılaşır.
  await recordGeminiFillUsage({ userId: session.id, ip });

  // Önerilen kategori slug'ını gerçek kategori kaydına eşle (gösterim için).
  let categoryId: string | null = null;
  let categoryName: string | null = null;
  if (outcome.suggestion.categorySlug) {
    const cat = await prisma.category.findUnique({
      where: { slug: outcome.suggestion.categorySlug },
      select: { id: true, name: true },
    });
    if (cat) {
      categoryId = cat.id;
      categoryName = cat.name;
    }
  }

  return { ok: true, suggestion: outcome.suggestion, categoryId, categoryName };
}
