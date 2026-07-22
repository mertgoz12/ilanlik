import { NextResponse } from "next/server";
import { verifySessionToken } from "./jwt";
import type { SessionUser } from "./session";

// Mobil (React Native) uygulaması için ince JSON API yardımcıları.
// Web tarafı httpOnly çerez + Server Action kullanır; mobil ise stateless
// "Authorization: Bearer <jwt>" başlığı kullanır. Token, web ile AYNI
// signSessionToken/verifySessionToken (AUTH_SECRET) ile üretilir/doğrulanır -
// yani tek bir kimlik sistemi, iki taşıma yöntemi.

export function apiJson(data: unknown, init?: ResponseInit): NextResponse {
  const res = NextResponse.json(data, init);
  // charset=utf-8 şart: aksi halde React Native fetch yanıtı Latin-1 çözüp
  // Türkçe karakterleri bozuyor (mesaj/isim/açıklama vb. mojibake).
  res.headers.set("content-type", "application/json; charset=utf-8");
  return res;
}

export function apiError(message: string, status = 400): NextResponse {
  return apiJson({ error: message }, { status });
}

// İsteğin Authorization başlığından mobil kullanıcıyı çözer (yoksa null).
// Korumalı endpoint'ler (ileride: favori, mesaj, ilan verme) bununla yetki
// kontrolü yapar.
export async function getMobileUser(request: Request): Promise<SessionUser | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  return { id: payload.sub, email: payload.email, name: payload.name, role: payload.role };
}
