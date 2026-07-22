import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";

const MAX_AVATAR = 5 * 1024 * 1024; // 5MB

// POST /api/mobile/me/avatar  (multipart, "avatar" dosyası)
// Profil fotoğrafını Vercel Blob'a yükler, avatarUrl'i günceller.
export async function POST(request: Request) {
  const session = await getMobileUser(request);
  if (!session) return apiError("Giriş yapmalısınız.", 401);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }
  const file = form.get("avatar");
  if (!(file instanceof File) || file.size === 0) return apiError("Geçerli bir resim seçin.");
  if (!file.type.startsWith("image/")) return apiError("Sadece resim dosyaları yüklenebilir.");
  if (file.size > MAX_AVATAR) return apiError("Dosya boyutu 5MB sınırını aşıyor.");

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
    const blob = await put(`avatars/${session.id}/${randomUUID()}.${ext}`, buffer, {
      access: "public",
      contentType: file.type,
    });
    await prisma.user.update({ where: { id: session.id }, data: { avatarUrl: blob.url } });
    return apiJson({ avatarUrl: blob.url });
  } catch (err) {
    console.error("Avatar yüklenemedi:", err);
    return apiError("Fotoğraf yüklenemedi, tekrar deneyin.", 500);
  }
}
