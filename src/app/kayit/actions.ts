"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { registerSchema } from "@/lib/validation";
import { sendInitialVerificationEmail } from "@/lib/email-verification";

// Sahibinden tarzı e-posta-önce akışın 1. adımı: kullanıcı sadece e-posta
// girip "Devam Et"e bastığında, asıl forma (ad/şifre/KVKK) geçmeden önce
// bu e-postanın zaten kayıtlı olup olmadığını anında bildirir.
export async function checkEmailExistsAction(email: string): Promise<{ exists: boolean }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { exists: false };
  const user = await prisma.user.findUnique({ where: { email: normalized }, select: { id: true } });
  return { exists: !!user };
}

export type RegisterState = {
  error?: string;
  fieldErrors?: Partial<
    Record<"name" | "email" | "phone" | "password" | "passwordConfirm" | "termsAccepted", string[]>
  >;
};

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
    termsAccepted: formData.get("termsAccepted") === "on",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { fieldErrors: { email: ["Bu e-posta adresi zaten kayıtlı."] } };
  }

  const hashed = await hashPassword(parsed.data.password);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashed,
      phone: parsed.data.phone || null,
      emailVerified: false,
    },
  });

  const emailResult = await sendInitialVerificationEmail(user);
  if (!emailResult.ok) {
    // Kayıt yine de tamamlanır - kullanıcı /hesabim/ayarlar veya ilan verme
    // ekranındaki "tekrar gönder" butonuyla daha sonra deneyebilir.
    console.error("Doğrulama e-postası gönderilemedi:", emailResult.error);
  }

  await createSession({ id: user.id, email: user.email, name: user.name, role: user.role });

  redirect("/");
}
