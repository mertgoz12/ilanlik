import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";

// GET /api/mobile/me/profile - ayarlar ekranı için tam profil.
export async function GET(request: Request) {
  const session = await getMobileUser(request);
  if (!session) return apiError("Giriş yapmalısınız.", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      googleId: true,
      notifyNewMessage: true,
      notifySavedSearch: true,
      notifyListingUpdates: true,
    },
  });
  if (!user) return apiError("Kullanıcı bulunamadı.", 404);

  return apiJson({
    profile: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      hasGoogle: !!user.googleId,
      notifyNewMessage: user.notifyNewMessage,
      notifySavedSearch: user.notifySavedSearch,
      notifyListingUpdates: user.notifyListingUpdates,
    },
  });
}

// PUT /api/mobile/me/profile  { name, phone? }
export async function PUT(request: Request) {
  const session = await getMobileUser(request);
  if (!session) return apiError("Giriş yapmalısınız.", 401);

  let body: { name?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }
  const name = (body.name ?? "").trim();
  if (name.length < 2) return apiError("Ad soyad en az 2 karakter olmalı.");
  if (name.length > 80) return apiError("Ad soyad çok uzun.");

  await prisma.user.update({
    where: { id: session.id },
    data: { name, phone: (body.phone ?? "").trim() || null },
  });
  return apiJson({ ok: true });
}
