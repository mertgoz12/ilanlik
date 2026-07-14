"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

function revalidateUserPaths() {
  revalidatePath("/admin/kullanicilar");
  revalidatePath("/admin");
}

// "use server" dosyasındaki TÜM fonksiyonlar HTTP üzerinden çağrılabilir
// server action'lardır; arayüz bu butonları admin olmayanlara göstermese de
// requireAdmin() burada (ikinci savunma katmanı olarak) yeniden doğrulama yapar.
export async function setUserBanAction(userId: string, isBanned: boolean) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { isBanned } });
  revalidateUserPaths();
}

export async function setUserVerifiedAction(userId: string, isVerified: boolean) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { isVerified } });
  revalidateUserPaths();
}

export async function setUserBadgeAction(userId: string, formData: FormData) {
  await requireAdmin();
  const raw = formData.get("badge");
  const badge = raw === "galeri" || raw === "kurumsal" || raw === "premium-satici" ? raw : null;
  await prisma.user.update({ where: { id: userId }, data: { badge } });
  revalidateUserPaths();
}

export async function setUserAdminAction(userId: string, isAdmin: boolean) {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    // Yöneticinin kendi yetkisini kaldırarak panele erişimi kaybetmesini önle.
    return;
  }
  await prisma.user.update({ where: { id: userId }, data: { role: isAdmin ? "admin" : "user" } });
  revalidateUserPaths();
}
