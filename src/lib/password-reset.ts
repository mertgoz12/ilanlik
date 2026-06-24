import { randomBytes } from "crypto";
import { prisma } from "./prisma";
import { hashPassword } from "./password";
import { sendEmail } from "./email";
import { renderEmailLayout } from "./email-templates";

const TOKEN_TTL_HOURS = 1;

function buildResetUrl(token: string): string {
  const base = process.env.NODE_ENV === "production" ? "https://ilanlio.com" : "http://localhost:3000";
  return `${base}/sifre-sifirla/${token}`;
}

// Şifre sıfırlama her zaman "bağlantı gönderildiyse gönderildi" gibi
// davranır (e-posta kayıtlı olmasa da aynı yanıtı verir) - bu, bir
// e-postanın sistemde kayıtlı olup olmadığının dışarıdan anlaşılmasını
// (enumeration) önleyen standart bir güvenlik pratiğidir.
export async function requestPasswordReset(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) return;

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: token, passwordResetTokenExpiresAt: expiresAt },
  });

  const url = buildResetUrl(token);
  const html = renderEmailLayout({
    previewText: "Şifreni sıfırlamak için tıkla",
    heading: "Şifre Sıfırlama Talebi",
    bodyHtml: `
      <p style="margin:0 0 12px;">Hesabın için bir şifre sıfırlama talebi aldık. Yeni bir şifre belirlemek için aşağıdaki butona tıkla.</p>
      <p style="margin:0;">Bu bağlantı <strong>1 saat</strong> geçerlidir ve sadece bir kez kullanılabilir.</p>
    `,
    ctaLabel: "Şifremi Sıfırla",
    ctaUrl: url,
    footnote: "Bu talebi siz yapmadıysanız bu e-postayı yoksayabilirsiniz; şifreniz değişmeyecektir.",
  });

  await sendEmail({ to: user.email, subject: "İlanlio - Şifre Sıfırlama", html });
}

export type VerifyResetTokenResult = { ok: true } | { ok: false; reason: "invalid" | "expired" };

export async function verifyResetToken(token: string): Promise<VerifyResetTokenResult> {
  const user = await prisma.user.findUnique({ where: { passwordResetToken: token } });
  if (!user) return { ok: false, reason: "invalid" };
  if (!user.passwordResetTokenExpiresAt || user.passwordResetTokenExpiresAt < new Date()) {
    return { ok: false, reason: "expired" };
  }
  return { ok: true };
}

export type ResetPasswordResult = { ok: true } | { ok: false; error: string };

export async function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResult> {
  const user = await prisma.user.findUnique({ where: { passwordResetToken: token } });
  if (!user) return { ok: false, error: "Bağlantı geçersiz veya daha önce kullanılmış." };
  if (!user.passwordResetTokenExpiresAt || user.passwordResetTokenExpiresAt < new Date()) {
    return { ok: false, error: "Bağlantının süresi dolmuş. Lütfen yeni bir bağlantı isteyin." };
  }

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, passwordResetToken: null, passwordResetTokenExpiresAt: null },
  });

  return { ok: true };
}
