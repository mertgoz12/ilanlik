import { randomUUID } from "crypto";
import path from "path";
import { del, put } from "@vercel/blob";

// blog-photos.ts / listing-photos.ts ile aynı desen: ana sayfa banner/slider
// görselleri için paylaşılan Vercel Blob yükleme mantığı.
const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB - banner görselleri genelde geniş

export type HeroPhotoUploadResult = { ok: true; url: string } | { ok: false; error: string };

export async function uploadHeroImage(file: File): Promise<HeroPhotoUploadResult> {
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Sadece resim dosyaları (JPG, PNG, WEBP) yüklenebilir." };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { ok: false, error: "Dosya boyutu 8MB sınırını aşıyor." };
  }

  const ext = path.extname(file.name).toLowerCase();
  const safeExt = ALLOWED_IMAGE_EXTENSIONS.has(ext) ? ext : ".jpg";
  const pathname = `hero/${randomUUID()}${safeExt}`;

  try {
    const blob = await put(pathname, file, { access: "public" });
    return { ok: true, url: blob.url };
  } catch (err) {
    console.error("Banner görseli Vercel Blob'a yüklenemedi:", err);
    return { ok: false, error: "Görsel yüklenemedi, lütfen tekrar deneyin." };
  }
}

export async function deleteHeroImageBlob(url: string): Promise<void> {
  try {
    await del(url);
  } catch (err) {
    console.error(`Banner görseli Vercel Blob'dan silinemedi (${url}):`, err);
  }
}
