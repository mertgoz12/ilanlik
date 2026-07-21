// Google ile giriş - NextAuth/Auth.js kullanılmadı; bu site zaten kendi
// JWT tabanlı oturum sistemine (bkz. session.ts) sahip, ayrı bir kütüphanenin
// kendi oturum/çerez yönetimini araya sokması gereksiz risk + karmaşıklık
// getirirdi. Bunun yerine Google'ın standart "Authorization Code" akışı
// burada doğrudan uygulanıyor; başarılı doğrulamadan sonra mevcut
// createSession() çağrılarak siteye TEK bir oturum sistemi üzerinden girilir.
import { randomUUID } from "crypto";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import { hashPassword } from "./password";

const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

export const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";

// Google Cloud Console'daki "Authorized redirect URIs" ile bire bir eşleşmesi
// gerekir - bu yüzden gelen isteğin host header'ına değil, sabit bir ortam
// değerine göre belirleniyor (host header sahteleme riskine karşı).
export function getGoogleRedirectUri(): string {
  const base = process.env.NODE_ENV === "production" ? "https://ilanlio.com" : "http://localhost:3000";
  return `${base}/api/auth/callback/google`;
}

// redirectUri verilmezse web callback'i kullanılır (geriye dönük uyumlu);
// mobil akış kendi callback'ini geçer.
export function buildGoogleAuthUrl(state: string, redirectUri: string = getGoogleRedirectUri()): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

// Mobil OAuth callback URI'si (Google Console'a "Authorized redirect URIs"
// olarak ayrıca eklenmelidir).
export function getMobileGoogleRedirectUri(): string {
  const base = process.env.NODE_ENV === "production" ? "https://ilanlio.com" : "http://localhost:3000";
  return `${base}/api/mobile/auth/google/callback`;
}

export type GoogleUserInfo = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
};

export async function exchangeGoogleCode(
  code: string,
  redirectUri: string = getGoogleRedirectUri(),
): Promise<GoogleUserInfo> {
  const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Google token exchange failed: ${tokenResponse.status}`);
  }

  const { access_token } = (await tokenResponse.json()) as { access_token: string };

  const userInfoResponse = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userInfoResponse.ok) {
    throw new Error(`Google userinfo fetch failed: ${userInfoResponse.status}`);
  }

  return (await userInfoResponse.json()) as GoogleUserInfo;
}

// Google sub'ına (yoksa e-postasına) göre kullanıcıyı bulur/oluşturur/birleştirir.
// Web callback ve mobil Google akışı ortak kullanır.
export async function findOrCreateGoogleUser(googleUser: {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}) {
  const email = googleUser.email.trim().toLowerCase();

  const byGoogleId = await prisma.user.findUnique({ where: { googleId: googleUser.sub } });
  if (byGoogleId) return byGoogleId;

  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        googleId: googleUser.sub,
        isVerified: true,
        emailVerified: true,
        avatarUrl: existingByEmail.avatarUrl ?? googleUser.picture ?? null,
      },
    });
  }

  try {
    // Google hesabında şifre kullanılmaz; rastgele, asla kullanılmayacak hash.
    const randomPassword = await hashPassword(randomUUID());
    return await prisma.user.create({
      data: {
        name: googleUser.name?.trim() || email.split("@")[0],
        email,
        password: randomPassword,
        googleId: googleUser.sub,
        isVerified: true,
        emailVerified: true,
        avatarUrl: googleUser.picture ?? null,
      },
    });
  } catch (err) {
    // Yarış durumu (P2002): az önce diğer istekçinin oluşturduğu kaydı bul.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const recovered =
        (await prisma.user.findUnique({ where: { googleId: googleUser.sub } })) ??
        (await prisma.user.findUnique({ where: { email } }));
      if (recovered) return recovered;
    }
    throw err;
  }
}
