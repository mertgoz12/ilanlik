"use server";

import { requireUser } from "@/lib/account-auth";
import { resendVerificationEmail } from "@/lib/email-verification";

export type ResendVerificationState = { ok?: boolean; error?: string };

// Hesabım ve ilan ver uyarısı gibi oturum açıkken kullanılan yerlerden
// çağrılır - e-posta adresi formdan alınmaz, requireUser() ile sunucu
// tarafında oturumdan belirlenir (kullanıcı başkasının hesabı için
// tetikleyemez).
export async function resendVerificationEmailAction(): Promise<ResendVerificationState> {
  const session = await requireUser();
  const result = await resendVerificationEmail(session.email);
  if (!result.ok) return { error: result.error };
  return { ok: true };
}

// Doğrulama linkinin süresi dolduğunda gösterilen sayfadan çağrılır -
// kullanıcı o an oturum açmış olmayabilir (örn. başka bir cihazda
// e-postasını kontrol ediyor olabilir), bu yüzden e-postayı kendisi girer.
export async function resendVerificationEmailByAddressAction(
  _prevState: ResendVerificationState,
  formData: FormData,
): Promise<ResendVerificationState> {
  const email = formData.get("email");
  if (typeof email !== "string" || !email.trim()) {
    return { error: "Geçerli bir e-posta adresi girin." };
  }
  const result = await resendVerificationEmail(email);
  if (!result.ok) return { error: result.error };
  return { ok: true };
}
