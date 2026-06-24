"use server";

import { requestPasswordReset } from "@/lib/password-reset";

export type ForgotPasswordState = { sent?: boolean; error?: string };

export async function requestPasswordResetAction(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = formData.get("email");
  if (typeof email !== "string" || !email.trim()) {
    return { error: "Geçerli bir e-posta adresi girin." };
  }

  await requestPasswordReset(email);
  // E-posta sistemde kayıtlı olmasa da AYNI yanıt döner - bir e-postanın
  // kayıtlı olup olmadığının dışarıdan anlaşılmasını (enumeration) önler.
  return { sent: true };
}
