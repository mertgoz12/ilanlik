import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  exchangeGoogleCode,
  findOrCreateGoogleUser,
  getMobileGoogleRedirectUri,
} from "@/lib/google-oauth";
import { signSessionToken } from "@/lib/jwt";

// Uygulama URI'sine token/hata ekleyerek yönlendirir (in-app tarayıcı yakalar).
function redirectToApp(ret: string, params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const sep = ret.includes("?") ? "&" : "?";
  return NextResponse.redirect(`${ret}${sep}${qs}`);
}

// GET /api/mobile/auth/google/callback?code&state
// Google buraya döner (Console'a "Authorized redirect URI" olarak eklenmeli).
// Kodu değiştirir, kullanıcıyı bulur/oluşturur, JWT üretip uygulamaya döndürür.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!state) {
    return new NextResponse("Geçersiz oturum.", { status: 400 });
  }

  let ret: string;
  try {
    const { payload } = await jwtVerify(state, new TextEncoder().encode(process.env.AUTH_SECRET));
    ret = String(payload.r);
  } catch {
    return new NextResponse("Oturum doğrulanamadı, tekrar deneyin.", { status: 400 });
  }

  if (!code) return redirectToApp(ret, { error: "google_iptal" });

  try {
    const googleUser = await exchangeGoogleCode(code, getMobileGoogleRedirectUri());
    if (!googleUser.email_verified) {
      return redirectToApp(ret, { error: "email_dogrulanmamis" });
    }
    const user = await findOrCreateGoogleUser(googleUser);
    const token = await signSessionToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    return redirectToApp(ret, { token });
  } catch {
    return redirectToApp(ret, { error: "google_hata" });
  }
}
