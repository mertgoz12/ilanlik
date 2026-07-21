import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session";
import { exchangeGoogleCode, findOrCreateGoogleUser, GOOGLE_OAUTH_STATE_COOKIE } from "@/lib/google-oauth";

function errorRedirect(request: NextRequest, code: string) {
  const url = new URL("/giris", request.url);
  url.searchParams.set("error", code);
  const response = NextResponse.redirect(url);
  response.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const stateCookie = request.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

  if (searchParams.get("error") || !code || !returnedState || !stateCookie) {
    console.error("[google-oauth-callback] missing code/state/cookie", {
      hasCode: Boolean(code),
      hasState: Boolean(returnedState),
      hasCookie: Boolean(stateCookie),
      googleError: searchParams.get("error"),
    });
    return errorRedirect(request, "google_failed");
  }

  let parsedCookie: { nonce: string; callbackUrl: string };
  try {
    parsedCookie = JSON.parse(stateCookie);
  } catch (err) {
    console.error("[google-oauth-callback] state cookie parse failed", err);
    return errorRedirect(request, "google_failed");
  }

  if (parsedCookie.nonce !== returnedState) {
    console.error("[google-oauth-callback] state mismatch (possible CSRF or stale cookie)");
    return errorRedirect(request, "google_failed");
  }

  // Buradan sonrası (Google'a ağ çağrısı + DB yazımı + oturum açma) hiçbir
  // koşulda kullanıcıya çiğ bir 500/crash göstermemeli - her hata Vercel
  // loglarına gerçek mesajıyla yazılır ve kullanıcı temiz bir hata sayfasına
  // yönlendirilir.
  try {
    const googleUser = await exchangeGoogleCode(code);

    if (!googleUser.email || !googleUser.email_verified) {
      console.error("[google-oauth-callback] email missing or unverified", {
        hasEmail: Boolean(googleUser.email),
        emailVerified: googleUser.email_verified,
      });
      return errorRedirect(request, "google_unverified");
    }

    const user = await findOrCreateGoogleUser(googleUser);

    if (user.isBanned) {
      return errorRedirect(request, "banned");
    }

    const response = NextResponse.redirect(new URL(parsedCookie.callbackUrl || "/", request.url));
    await createSession({ id: user.id, email: user.email, name: user.name, role: user.role }, { response });
    response.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
    return response;
  } catch (err) {
    console.error("[google-oauth-callback] failed:", err);
    return errorRedirect(request, "google_failed");
  }
}
