import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { toggleFavorite } from "@/lib/mobile-favorites";

// POST /api/mobile/favorites/toggle  { listingId } -> { favorited }
export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);

  let body: { listingId?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }
  if (!body.listingId) return apiError("listingId gerekli.");

  const result = await toggleFavorite(user.id, body.listingId);
  return apiJson(result);
}
