// Google ile giriş - NextAuth/Auth.js kullanılmadı; bu site zaten kendi
// JWT tabanlı oturum sistemine (bkz. session.ts) sahip, ayrı bir kütüphanenin
// kendi oturum/çerez yönetimini araya sokması gereksiz risk + karmaşıklık
// getirirdi. Bunun yerine Google'ın standart "Authorization Code" akışı
// burada doğrudan uygulanıyor; başarılı doğrulamadan sonra mevcut
// createSession() çağrılarak siteye TEK bir oturum sistemi üzerinden girilir.
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

export function buildGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

export type GoogleUserInfo = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
};

export async function exchangeGoogleCode(code: string): Promise<GoogleUserInfo> {
  const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: getGoogleRedirectUri(),
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
