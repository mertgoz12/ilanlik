import { randomUUID } from "crypto";
import path from "path";
import { del, put } from "@vercel/blob";

// blog-photos.ts / listing-photos.ts ile aynı desen: ana sayfa banner/slider
// medyası için paylaşılan Vercel Blob yükleme mantığı. Görselin yanında GIF ve
// kısa video da kabul eder (otomatik oynayan, sürekli başa saran banner'lar).
const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const ALLOWED_VIDEO_EXTENSIONS = new Set([".mp4", ".webm"]);
const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB - banner görselleri genelde geniş
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB - kısa, döngülü banner videoları

export type HeroMediaUploadResult = { ok: true; url: string } | { ok: false; error: string };

export async function uploadHeroMedia(file: File): Promise<HeroMediaUploadResult> {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) {
    return {
      ok: false,
      error: "Sadece görsel (JPG, PNG, WEBP, GIF) veya video (MP4, WEBM) yükleyebilirsiniz.",
    };
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return {
      ok: false,
      error: isVideo ? "Video boyutu 20MB sınırını aşıyor." : "Dosya boyutu 8MB sınırını aşıyor.",
    };
  }

  const ext = path.extname(file.name).toLowerCase();
  const allowed = isVideo ? ALLOWED_VIDEO_EXTENSIONS : ALLOWED_IMAGE_EXTENSIONS;
  const safeExt = allowed.has(ext) ? ext : isVideo ? ".mp4" : ".jpg";
  const pathname = `hero/${randomUUID()}${safeExt}`;

  try {
    const blob = await put(pathname, file, { access: "public" });
    return { ok: true, url: blob.url };
  } catch (err) {
    console.error("Banner medyası Vercel Blob'a yüklenemedi:", err);
    return { ok: false, error: "Dosya yüklenemedi, lütfen tekrar deneyin." };
  }
}

export async function deleteHeroMediaBlob(url: string): Promise<void> {
  try {
    await del(url);
  } catch (err) {
    console.error(`Banner medyası Vercel Blob'dan silinemedi (${url}):`, err);
  }
}
