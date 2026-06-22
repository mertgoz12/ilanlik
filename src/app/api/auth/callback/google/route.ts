import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { exchangeGoogleCode, GOOGLE_OAUTH_STATE_COOKIE } from "@/lib/google-oauth";

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
    return errorRedirect(request, "google_failed");
  }

  let parsedCookie: { nonce: string; callbackUrl: string };
  try {
    parsedCookie = JSON.parse(stateCookie);
  } catch {
    return errorRedirect(request, "google_failed");
  }

  if (parsedCookie.nonce !== returnedState) {
    return errorRedirect(request, "google_failed");
  }

  let googleUser;
  try {
    googleUser = await exchangeGoogleCode(code);
  } catch {
    return errorRedirect(request, "google_failed");
  }

  if (!googleUser.email || !googleUser.email_verified) {
    return errorRedirect(request, "google_unverified");
  }

  const email = googleUser.email.trim().toLowerCase();

  // Google'a ÖNCE kendi sabit kimliğiyle (sub) bakılır - e-posta değişse de
  // hesabı bulmaya yarar. Bulunamazsa e-posta ile aranır: mevcut bir
  // e-posta/şifre hesabı varsa onunla BİRLEŞTİRİLİR (ayrı hesap açılmaz).
  let user = await prisma.user.findUnique({ where: { googleId: googleUser.sub } });

  if (!user) {
    const existingByEmail = await prisma.user.findUnique({ where: { email } });

    if (existingByEmail) {
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          googleId: googleUser.sub,
          isVerified: true,
          avatarUrl: existingByEmail.avatarUrl ?? googleUser.picture ?? null,
        },
      });
    } else {
      // Google ile açılan hesapta şifre alanı kullanılmaz (model zorunlu
      // tuttuğu için rastgele, asla kullanılmayacak bir hash atanır - bkz.
      // listing-options.ts'teki sistem kullanıcısı için aynı desen).
      const randomPassword = await hashPassword(randomUUID());
      user = await prisma.user.create({
        data: {
          name: googleUser.name?.trim() || email.split("@")[0],
          email,
          password: randomPassword,
          googleId: googleUser.sub,
          isVerified: true,
          avatarUrl: googleUser.picture ?? null,
        },
      });
    }
  }

  if (user.isBanned) {
    return errorRedirect(request, "banned");
  }

  await createSession({ id: user.id, email: user.email, name: user.name, role: user.role });

  const response = NextResponse.redirect(new URL(parsedCookie.callbackUrl || "/", request.url));
  response.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
  return response;
}
