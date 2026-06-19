"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/account-auth";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordInput,
  type ProfileInput,
} from "@/lib/validation";

export type ProfileFormState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Partial<Record<keyof ProfileInput, string[]>>;
};

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await requireUser();

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    il: formData.get("il"),
    ilce: formData.get("ilce"),
  });

  if (!parsed.success) {
    return { error: "Lütfen formdaki hataları düzeltin.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  const user = await prisma.user.update({
    where: { id: session.id },
    data: {
      name: data.name,
      phone: data.phone || null,
      il: data.il || null,
      ilce: data.ilce || null,
    },
  });

  // Navbar'daki ad ve diğer oturum tabanlı arayüzler güncel kalsın diye
  // çerezdeki oturum bilgisi de yenilenir.
  await createSession({ id: user.id, email: user.email, name: user.name, role: user.role });

  revalidatePath("/hesabim/ayarlar");
  revalidatePath("/hesabim");
  return { success: true };
}

export type PasswordFormState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Partial<Record<keyof ChangePasswordInput, string[]>>;
};

export async function changePasswordAction(
  _prevState: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const session = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    newPasswordConfirm: formData.get("newPasswordConfirm"),
  });

  if (!parsed.success) {
    return { error: "Lütfen formdaki hataları düzeltin.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { password: true } });
  if (!user) {
    return { error: "Kullanıcı bulunamadı." };
  }

  const currentValid = await verifyPassword(parsed.data.currentPassword, user.password);
  if (!currentValid) {
    return { fieldErrors: { currentPassword: ["Mevcut şifreniz yanlış."] } };
  }

  const hashed = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: session.id }, data: { password: hashed } });

  return { success: true };
}

const ALLOWED_AVATAR_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

export type AvatarFormState = { error?: string; success?: boolean; avatarUrl?: string };

export async function updateAvatarAction(
  _prevState: AvatarFormState,
  formData: FormData,
): Promise<AvatarFormState> {
  const session = await requireUser();

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Lütfen bir fotoğraf seçin." };
  }
  if (!file.type.startsWith("image/") || file.size > MAX_AVATAR_SIZE) {
    return { error: "Geçersiz dosya. En fazla 2MB boyutunda bir görsel seçin." };
  }

  const ext = path.extname(file.name).toLowerCase();
  const safeExt = ALLOWED_AVATAR_EXTENSIONS.has(ext) ? ext : ".jpg";
  const filename = `${randomUUID()}${safeExt}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars", session.id);
  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  const avatarUrl = `/uploads/avatars/${session.id}/${filename}`;
  await prisma.user.update({ where: { id: session.id }, data: { avatarUrl } });

  revalidatePath("/hesabim/ayarlar");
  revalidatePath("/hesabim");
  return { success: true, avatarUrl };
}

export async function updateNotificationPreferencesAction(formData: FormData) {
  const session = await requireUser();

  await prisma.user.update({
    where: { id: session.id },
    data: {
      notifyNewMessage: formData.get("notifyNewMessage") === "on",
      notifySavedSearch: formData.get("notifySavedSearch") === "on",
      notifyListingUpdates: formData.get("notifyListingUpdates") === "on",
    },
  });

  revalidatePath("/hesabim/ayarlar");
}
