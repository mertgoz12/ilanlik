import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { getSession, type SessionUser } from "./session";

export type UserSession = SessionUser & { avatarUrl: string | null; emailVerified: boolean };

// Oturumdaki bilgiler JWT içinde taşınır ve sadece arayüz kararları için bir
// ipucudur. Asıl yetkilendirme HER ZAMAN veritabanından taze durumla
// doğrulanır; böylece banlanan bir kullanıcının eski oturum çerezi
// /hesabim'e erişim sağlayamaz. Aynı sorguda avatarUrl/emailVerified de
// seçilir - JWT'ye gömülmedikleri için (profil fotoğrafı/doğrulama durumu
// değiştiğinde yeniden giriş yapmadan) her istekte taze kalırlar.
export async function getUserSession(): Promise<UserSession | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { isBanned: true, avatarUrl: true, emailVerified: true },
  });
  if (!user || user.isBanned) return null;

  return { ...session, avatarUrl: user.avatarUrl, emailVerified: user.emailVerified };
}

// Sayfa/layout seviyesinde kullanılır: oturum yoksa giriş sayfasına yönlendirir.
export async function requireUserPage(callbackUrl = "/hesabim"): Promise<UserSession> {
  const user = await getUserSession();
  if (!user) redirect(`/giris?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return user;
}

// Server action seviyesinde kullanılır: oturum yoksa hata fırlatır. Arayüz
// zaten bu aksiyonları girişi olmayanlara göstermez; bu, "sadece arayüzü
// gizlemek yetmez" gereksinimini karşılayan ikinci (gerçek) savunma katmanıdır.
export async function requireUser(): Promise<UserSession> {
  const user = await getUserSession();
  if (!user) {
    throw new Error("Bu işlem için giriş yapmanız gerekiyor.");
  }
  return user;
}
