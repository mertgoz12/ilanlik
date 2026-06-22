import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
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

// Google'a ÖNCE kendi sabit kimliğiyle (sub) bakılır - e-posta değişse de
// hesabı bulmaya yarar. Bulunamazsa e-posta ile aranır: mevcut bir
// e-posta/şifre hesabı varsa onunla BİRLEŞTİRİLİR (ayrı hesap açılmaz).
async function findOrCreateGoogleUser(googleUser: {
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
        avatarUrl: existingByEmail.avatarUrl ?? googleUser.picture ?? null,
      },
    });
  }

  try {
    // Google ile açılan hesapta şifre alanı kullanılmaz (model zorunlu
    // tuttuğu için rastgele, asla kullanılmayacak bir hash atanır - bkz.
    // listing-options.ts'teki sistem kullanıcısı için aynı desen).
    const randomPassword = await hashPassword(randomUUID());
    return await prisma.user.create({
      data: {
        name: googleUser.name?.trim() || email.split("@")[0],
        email,
        password: randomPassword,
        googleId: googleUser.sub,
        isVerified: true,
        avatarUrl: googleUser.picture ?? null,
      },
    });
  } catch (err) {
    // Aynı anda gelen ikinci bir istek (örn. tarayıcının isteği tekrarlaması)
    // aynı e-posta/googleId için yarış durumunda çakışabilir - bu durumda
    // hata fırlatmak yerine az önce diğer istekçinin oluşturduğu kaydı bul.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const recovered =
        (await prisma.user.findUnique({ where: { googleId: googleUser.sub } })) ??
        (await prisma.user.findUnique({ where: { email } }));
      if (recovered) return recovered;
    }
    throw err;
  }
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
