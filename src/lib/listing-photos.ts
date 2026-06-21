import { randomUUID } from "crypto";
import path from "path";
import { del, put } from "@vercel/blob";

export const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGES_PER_LISTING = 10;

export type PhotoUploadResult = { ok: true; url: string } | { ok: false; error: string };

// İlan fotoğrafları (yeni ilan akışı ve düzenleme akışı) için tek, paylaşılan
// yükleme mantığı - Vercel Blob'a yükler, bir dosya başarısız olursa o
// dosyayı atlayıp net bir hata mesajı döner (çağıran taraf akışı durdurmaz).
export async function uploadListingPhoto(file: File, listingId: string): Promise<PhotoUploadResult> {
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: `${file.name}: sadece resim dosyaları (JPG, PNG, WEBP) yüklenebilir.` };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { ok: false, error: `${file.name}: dosya boyutu 5MB sınırını aşıyor.` };
  }

  const ext = path.extname(file.name).toLowerCase();
  const safeExt = ALLOWED_IMAGE_EXTENSIONS.has(ext) ? ext : ".jpg";
  const pathname = `listings/${listingId}/${randomUUID()}${safeExt}`;

  try {
    const blob = await put(pathname, file, { access: "public" });
    return { ok: true, url: blob.url };
  } catch (err) {
    console.error(`İlan fotoğrafı Vercel Blob'a yüklenemedi (${file.name}):`, err);
    return { ok: false, error: `${file.name}: yüklenemedi, lütfen tekrar deneyin.` };
  }
}

export async function deleteListingPhotoBlob(url: string): Promise<void> {
  try {
    await del(url);
  } catch (err) {
    // Blob'dan silme başarısız olsa da veritabanı kaydının silinmesini
    // engellemiyoruz - en kötü ihtimalle Blob'da yetim bir dosya kalır.
    console.error(`Fotoğraf Vercel Blob'dan silinemedi (${url}):`, err);
  }
}
