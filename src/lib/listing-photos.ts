import { randomUUID } from "crypto";
import { del, put } from "@vercel/blob";
import { applyWatermark } from "./watermark";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGES_PER_LISTING = 10;

export type PhotoUploadResult = { ok: true; url: string } | { ok: false; error: string };

// İlan fotoğrafları (yeni ilan akışı ve düzenleme akışı) için tek, paylaşılan
// yükleme mantığı - filigran eklenmiş hali Vercel Blob'a yüklenir (filigransız
// orijinal hiçbir zaman saklanmaz), bir dosya başarısız olursa o dosyayı
// atlayıp net bir hata mesajı döner (çağıran taraf akışı durdurmaz).
export async function uploadListingPhoto(file: File, listingId: string): Promise<PhotoUploadResult> {
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: `${file.name}: sadece resim dosyaları (JPG, PNG, WEBP) yüklenebilir.` };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { ok: false, error: `${file.name}: dosya boyutu 5MB sınırını aşıyor.` };
  }

  try {
    const original = Buffer.from(await file.arrayBuffer());
    const { buffer, contentType, extension } = await applyWatermark(original);
    const pathname = `listings/${listingId}/${randomUUID()}${extension}`;
    const blob = await put(pathname, buffer, { access: "public", contentType });
    return { ok: true, url: blob.url };
  } catch (err) {
    console.error(`İlan fotoğrafı işlenip yüklenemedi (${file.name}):`, err);
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
