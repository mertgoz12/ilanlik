import { prisma } from "./prisma";

// İlan yayına alınınca (onaylanınca) AYNI İLÇEDEKİ kullanıcılara "yakınında
// yeni ilan" bildirimi. İlçe bazlı - il çok geniş olduğundan kullanıcı sürekli
// bildirim almasın diye. Kullanıcı konumu User.il/User.ilce'de tutulur
// (mobil uygulama konumdan tespit edip kaydeder). Fanout koruması için üst sınır.
const MAX_NEARBY = 300;

export async function notifyNearbyOfListing(params: {
  ownerId: string;
  il: string;
  ilce: string;
  title: string;
  listingNo: string;
}): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      where: {
        il: params.il,
        ilce: params.ilce,
        id: { not: params.ownerId },
        isBanned: false,
      },
      select: { id: true },
      take: MAX_NEARBY,
    });
    if (users.length === 0) return;

    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type: "new_listing_nearby",
        title: `Yakınında yeni ilan · ${params.ilce}`,
        body: params.title,
        link: `/ilan/${params.listingNo}`,
      })),
    });
  } catch (err) {
    // Bildirim asla onay akışını çökertmemeli.
    console.error("[notify-nearby] failed:", err);
  }
}
