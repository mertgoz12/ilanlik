import { randomBytes } from "crypto";
import { prisma } from "./prisma";
import { sendEmail } from "./email";
import { renderEmailLayout } from "./email-templates";

const TOKEN_TTL_HOURS = 24;
const RESEND_COOLDOWN_SECONDS = 60;

function buildVerificationUrl(token: string): string {
  const base = process.env.NODE_ENV === "production" ? "https://ilanlio.com" : "http://localhost:3000";
  return `${base}/dogrula/${token}`;
}

async function dispatchVerificationEmail(user: { id: string; email: string; name: string }) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: token,
      emailVerificationTokenExpiresAt: expiresAt,
      emailVerificationLastSentAt: new Date(),
    },
  });

  const url = buildVerificationUrl(token);
  const html = renderEmailLayout({
    previewText: "E-posta adresini doğrulamak için tıkla",
    heading: `Merhaba ${user.name.split(" ")[0]}, hoş geldin! 👋`,
    bodyHtml: `
      <p style="margin:0 0 12px;">İlanlio'ya kayıt olduğun için teşekkürler. Hesabını aktifleştirmek ve ilan verebilmek için e-posta adresini doğrulaman gerekiyor.</p>
      <p style="margin:0;">Bu bağlantı <strong>24 saat</strong> geçerlidir.</p>
    `,
    ctaLabel: "E-postamı Doğrula",
    ctaUrl: url,
  });

  return sendEmail({ to: user.email, subject: "İlanlio - E-posta Adresini Doğrula", html });
}

export type SendVerificationResult = { ok: true } | { ok: false; error: string };

// Kayıt sonrası ilk doğrulama e-postası - hız sınırı kontrolü yapmaz
// (kullanıcı henüz bir tane bile almadı).
export async function sendInitialVerificationEmail(user: {
  id: string;
  email: string;
  name: string;
}): Promise<SendVerificationResult> {
  const result = await dispatchVerificationEmail(user);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true };
}

// "Tekrar gönder" - e-posta adresine göre çalışır (oturum açık olmasa da
// kullanılabilsin diye, örn. doğrulama linkinin süresi başka bir cihazda
// dolduğunda). Spam'i önlemek için son gönderimden itibaren en az
// RESEND_COOLDOWN_SECONDS geçmiş olmalı (kontrol veritabanı üzerinden
// yapılır, bu yüzden serverless ortamda da güvenilir şekilde çalışır).
export async function resendVerificationEmail(email: string): Promise<SendVerificationResult> {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, email: true, name: true, emailVerified: true, emailVerificationLastSentAt: true },
  });
  // E-posta sistemde yoksa da "gönderildi" gibi davranılır (enumeration
  // riskini önlemek için requestPasswordReset ile aynı prensip).
  if (!user) return { ok: true };
  if (user.emailVerified) return { ok: false, error: "E-posta adresiniz zaten doğrulanmış." };

  if (user.emailVerificationLastSentAt) {
    const secondsSinceLast = (Date.now() - user.emailVerificationLastSentAt.getTime()) / 1000;
    if (secondsSinceLast < RESEND_COOLDOWN_SECONDS) {
      const wait = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLast);
      return { ok: false, error: `Lütfen ${wait} saniye sonra tekrar deneyin.` };
    }
  }

  const result = await dispatchVerificationEmail(user);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true };
}

export type VerifyTokenResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "expired" | "already-verified" };

export async function verifyEmailToken(token: string): Promise<VerifyTokenResult> {
  const user = await prisma.user.findUnique({ where: { emailVerificationToken: token } });
  if (!user) {
    return { ok: false, reason: "invalid" };
  }
  if (user.emailVerified) {
    return { ok: false, reason: "already-verified" };
  }
  if (!user.emailVerificationTokenExpiresAt || user.emailVerificationTokenExpiresAt < new Date()) {
    return { ok: false, reason: "expired" };
  }

  // Token BİLEREK temizlenmiyor (null yapılmıyor) - aynı bağlantıya tekrar
  // tıklanırsa (örn. e-postayı iki kez açma) "geçersiz bağlantı" gibi
  // kafa karıştırıcı bir mesaj değil, üstteki emailVerified kontrolü
  // sayesinde anlaşılır bir "zaten doğrulanmış" mesajı gösterilir.
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true },
  });

  return { ok: true };
}
