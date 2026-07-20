import { prisma } from "@/lib/prisma";
import { apiJson, apiError, getMobileUser } from "@/lib/mobile-api";
import { getFeatureAllowance } from "@/lib/featuring";

// POST /api/mobile/me/listings/:id  { action }
// İlan yönetimi: feature | unfeature | publish | unpublish | resubmit | delete.
// Web hesabim/ilanlarim/actions.ts ile aynı mantık ve güvenlik (sahiplik + durum).
type Action = "feature" | "unfeature" | "publish" | "unpublish" | "resubmit" | "delete";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getMobileUser(request);
  if (!user) return apiError("Giriş yapmalısınız.", 401);
  const { id } = await params;

  let body: { action?: Action };
  try {
    body = await request.json();
  } catch {
    return apiError("Geçersiz istek gövdesi.");
  }
  const action = body.action;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { id: true, userId: true, status: true, isFeatured: true },
  });
  if (!listing || listing.userId !== user.id) {
    return apiError("Bu ilan üzerinde işlem yapma yetkiniz yok.", 403);
  }

  switch (action) {
    case "feature": {
      if (listing.status !== "active") return apiError("Yalnızca yayında olan ilanlar öne çıkarılabilir.");
      if (listing.isFeatured) return apiJson({ ok: true });
      const { remaining } = await getFeatureAllowance(user.id);
      if (remaining <= 0) {
        return apiError("Öne çıkarma hakkınız yok. Yayında olan her 3 ilan için 1 hak kazanırsınız.");
      }
      await prisma.listing.update({ where: { id }, data: { isFeatured: true } });
      return apiJson({ ok: true });
    }
    case "unfeature":
      await prisma.listing.update({ where: { id }, data: { isFeatured: false } });
      return apiJson({ ok: true });
    case "publish":
      if (listing.status === "pending_review") {
        return apiError("İnceleme bekleyen bir ilanı doğrudan yayına alamazsınız.");
      }
      await prisma.listing.update({ where: { id }, data: { status: "active" } });
      return apiJson({ ok: true });
    case "unpublish":
      await prisma.listing.update({ where: { id }, data: { status: "pasif" } });
      return apiJson({ ok: true });
    case "resubmit":
      if (listing.status !== "rejected") {
        return apiError("Yalnızca reddedilen ilanlar tekrar onaya gönderilebilir.");
      }
      await prisma.listing.update({
        where: { id },
        data: { status: "pending_review", rejectionReason: null, reviewedAt: null },
      });
      return apiJson({ ok: true });
    case "delete":
      await prisma.listing.delete({ where: { id } });
      return apiJson({ ok: true });
    default:
      return apiError("Geçersiz işlem.");
  }
}
