import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";

// PUT /api/mobile/me/settings  { notifyNewMessage, notifySavedSearch, notifyListingUpdates }
export async function PUT(request: Request) {
  const session = await getMobileUser(request);
  if (!session) return apiError("Giriş yapmalısınız.", 401);

  let body: {
    notifyNewMessage?: boolean;
    notifySavedSearch?: boolean;
    notifyListingUpdates?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }

  await prisma.user.update({
    where: { id: session.id },
    data: {
      notifyNewMessage: Boolean(body.notifyNewMessage),
      notifySavedSearch: Boolean(body.notifySavedSearch),
      notifyListingUpdates: Boolean(body.notifyListingUpdates),
    },
  });
  return apiJson({ ok: true });
}
