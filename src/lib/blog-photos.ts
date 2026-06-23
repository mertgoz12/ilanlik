import { randomUUID } from "crypto";
import path from "path";
import { del, put } from "@vercel/blob";

// listing-photos.ts ile aynı desen: blog kapak/içerik görselleri için
// paylaşılan Vercel Blob yükleme mantığı.
const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export type BlogPhotoUploadResult = { ok: true; url: string } | { ok: false; error: string };

export async function uploadBlogImage(file: File): Promise<BlogPhotoUploadResult> {
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Sadece resim dosyaları (JPG, PNG, WEBP) yüklenebilir." };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { ok: false, error: "Dosya boyutu 5MB sınırını aşıyor." };
  }

  const ext = path.extname(file.name).toLowerCase();
  const safeExt = ALLOWED_IMAGE_EXTENSIONS.has(ext) ? ext : ".jpg";
  const pathname = `blog/${randomUUID()}${safeExt}`;

  try {
    const blob = await put(pathname, file, { access: "public" });
    return { ok: true, url: blob.url };
  } catch (err) {
    console.error("Blog görseli Vercel Blob'a yüklenemedi:", err);
    return { ok: false, error: "Görsel yüklenemedi, lütfen tekrar deneyin." };
  }
}

export async function deleteBlogImageBlob(url: string): Promise<void> {
  try {
    await del(url);
  } catch (err) {
    console.error(`Blog görseli Vercel Blob'dan silinemedi (${url}):`, err);
  }
}
