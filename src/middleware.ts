import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "./lib/session";
import { verifySessionToken } from "./lib/jwt";

const PROTECTED_PATHS = ["/ilan-ver", "/hesabim"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/giris", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ilan-ver/:path*", "/hesabim/:path*"],
};
