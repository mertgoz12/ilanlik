import { Resend } from "resend";

let cachedClient: Resend | null = null;

function getClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  if (!cachedClient) {
    cachedClient = new Resend(apiKey);
  }
  return cachedClient;
}

// Domain (ilanlio.com) Resend'de doğrulanana kadar EMAIL_FROM env değişkeni
// Resend'in kendi test adresine (onboarding@resend.dev) işaret eder - bu
// adresle SADECE Resend hesabının sahibinin kendi e-postasına mail
// gönderilebilir. Domain doğrulanınca EMAIL_FROM="İlanlio <noreply@ilanlio.com>"
// olarak güncellenip tüm kullanıcılara gönderim açılır.
const DEFAULT_FROM = "İlanlio <onboarding@resend.dev>";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export type SendEmailResult = { ok: true; id?: string } | { ok: false; error: string };

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<SendEmailResult> {
  try {
    const resend = getClient();
    const from = process.env.EMAIL_FROM || DEFAULT_FROM;
    const { data, error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      console.error("[email] Resend gönderim hatası:", error);
      return { ok: false, error: error.message ?? "E-posta gönderilemedi." };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error("[email] Beklenmeyen gönderim hatası:", err);
    return { ok: false, error: "E-posta gönderilemedi." };
  }
}
