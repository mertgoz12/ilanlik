import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildGoogleAuthUrl, GOOGLE_OAUTH_STATE_COOKIE } from "@/lib/google-oauth";

// "Google ile hesap aç / giriş yap" butonunun gittiği yer - kullanıcıyı
// Google'ın kendi onay ekranına yönlendirir. CSRF korumasi için rastgele bir
// nonce üretilip kısa ömürlü bir cookie'de saklanır, callback'te eşleştirilir.
export async function GET(request: NextRequest) {
  const callbackUrlParam = request.nextUrl.searchParams.get("callbackUrl");
  const callbackUrl = callbackUrlParam && callbackUrlParam.startsWith("/") ? callbackUrlParam : "/";

  const nonce = randomUUID();
  const response = NextResponse.redirect(buildGoogleAuthUrl(nonce));
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, JSON.stringify({ nonce, callbackUrl }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
