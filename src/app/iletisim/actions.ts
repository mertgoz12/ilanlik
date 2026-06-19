"use server";

import { prisma } from "@/lib/prisma";
import { contactMessageSchema } from "@/lib/validation";

export type ContactFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "subject" | "message", string[]>>;
};

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactMessageSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.contactMessage.create({ data: parsed.data });
  } catch {
    return { error: "Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin." };
  }

  return { success: true };
}
