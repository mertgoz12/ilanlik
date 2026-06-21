"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";

export type LoginState = {
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password", string[]>>;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (!user || !(await verifyPassword(parsed.data.password, user.password))) {
    return { error: "E-posta veya şifre hatalı." };
  }

  if (user.isBanned) {
    return { error: "Hesabınız askıya alınmıştır. Daha fazla bilgi için bizimle iletişime geçin." };
  }

  const rememberMe = formData.get("rememberMe") === "on";
  await createSession({ id: user.id, email: user.email, name: user.name, role: user.role }, { rememberMe });

  const callbackUrl = formData.get("callbackUrl");
  const target =
    typeof callbackUrl === "string" && callbackUrl.startsWith("/") ? callbackUrl : "/";

  redirect(target);
}
