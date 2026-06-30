"use server";

import { requireUser } from "@/lib/account-auth";
import { markAllNotificationsRead } from "@/lib/notifications";

// Bildirimler sayfası açıldığında çağrılır: tüm okunmamış bildirimleri okundu
// işaretler (navbar zil sayacı bir sonraki sayfa yüklemesinde sıfırlanır).
export async function markNotificationsReadAction(): Promise<void> {
  const session = await requireUser();
  await markAllNotificationsRead(session.id);
}
