"use server";

import { resetPassword } from "@/lib/password-reset";
import { resetPasswordSchema } from "@/lib/validation";

export type ResetPasswordState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"password" | "passwordConfirm", string[]>>;
};

export async function resetPasswordAction(
  token: string,
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const result = await resetPassword(token, parsed.data.password);
  if (!result.ok) return { error: result.error };
  return { success: true };
}
