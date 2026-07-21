import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { buildGoogleAuthUrl, getMobileGoogleRedirectUri } from "@/lib/google-oauth";
import { apiError } from "@/lib/mobile-api";

// GET /api/mobile/auth/google/start?return=<app redirect uri>
// Mobil uygulama bunu in-app tarayıcıda açar. Google'a yönlendirir; dönüş
// adresi (uygulama URI'si) imzalı state içinde taşınır (CSRF + geri dönüş).
export async function GET(request: NextRequest) {
  const ret = request.nextUrl.searchParams.get("return");
  if (!ret) return apiError("return parametresi gerekli.");

  const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
  const state = await new SignJWT({ r: ret })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secret);

  const authUrl = buildGoogleAuthUrl(state, getMobileGoogleRedirectUri());
  return NextResponse.redirect(authUrl);
}
