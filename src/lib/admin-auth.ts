import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { getSession, type SessionUser } from "./session";

export type AdminSession = SessionUser & { role: "admin" };

// Oturumdaki "role" alanı JWT içinde taşınır ve sadece arayüz kararları
// (örn. Navbar'da "Yönetim Paneli" bağlantısı) için bir ipucudur. Asıl
// yetkilendirme HER ZAMAN veritabanından taze rol/ban bilgisiyle doğrulanır;
// böylece admin yetkisi geri alınan bir kullanıcının eski oturum çerezi
// /admin'e erişim sağlayamaz.
export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { role: true, isBanned: true },
  });
  if (!user || user.role !== "admin" || user.isBanned) return null;

  return { ...session, role: "admin" };
}

// Sayfa/layout seviyesinde kullanılır: admin değilse giriş sayfasına yönlendirir.
export async function requireAdminPage(): Promise<AdminSession> {
  const admin = await getAdminSession();
  if (!admin) redirect("/giris?callbackUrl=/admin");
  return admin;
}

// Server action seviyesinde kullanılır: admin değilse hata fırlatır. Arayüz
// zaten bu aksiyonları admin olmayanlara göstermez; bu, "sadece arayüzü
// gizlemek yetmez" gereksinimini karşılayan ikinci (gerçek) savunma katmanıdır.
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdminSession();
  if (!admin) {
    throw new Error("Bu işlem için yönetici yetkisi gerekiyor.");
  }
  return admin;
}
