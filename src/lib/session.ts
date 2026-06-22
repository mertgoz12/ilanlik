import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { signSessionToken, verifySessionToken } from "./jwt";

export const SESSION_COOKIE = "ilanlio_session";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export async function createSession(
  user: SessionUser,
  options?: { rememberMe?: boolean; response?: NextResponse },
) {
  const token = await signSessionToken({ sub: user.id, email: user.email, name: user.name, role: user.role });
  // rememberMe false ise maxAge hiç verilmez -> tarayıcı kapanınca silinen bir
  // oturum çerezi olur. JWT'nin kendi süresi (7g) yine de değişmez, sadece
  // çerezin tarayıcıda ne kadar kalıcı olduğu farklılaşır.
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(options?.rememberMe === false ? {} : { maxAge: COOKIE_MAX_AGE }),
  };

  // Route Handler'lar (örn. Google OAuth callback'i) kendi NextResponse'unu
  // elle oluşturup döndürür - next/headers'daki cookies() ile o response'a
  // bağlı olmayan ayrı bir mekanizma üzerinden çerez yazmak yerine, verilen
  // response nesnesine DOĞRUDAN yazılır (Server Action'larda bu parametre
  // verilmez, davranış öncekiyle aynı kalır).
  if (options?.response) {
    options.response.cookies.set(SESSION_COOKIE, token, cookieOptions);
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, cookieOptions);
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  return { id: payload.sub, email: payload.email, name: payload.name, role: payload.role };
}
