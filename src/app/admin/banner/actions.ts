"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { deleteHeroMediaBlob, uploadHeroMedia } from "@/lib/hero-photos";

const slideSchema = z.object({
  imageUrl: z.string().trim().min(1, "Görsel veya video yüklemelisiniz."),
  // Başlık opsiyonel: bazen yalnızca görsel/video konabilir (üzerine yazı
  // binmesin). Boşsa "" saklanır, ana sayfada başlık/metin gösterilmez.
  title: z.string().trim().max(120).optional(),
  subtitle: z.string().trim().max(200).optional(),
  buttonText: z.string().trim().max(40).optional(),
  buttonLink: z.string().trim().max(300).optional(),
  isActive: z.boolean(),
});

export type HeroSlideFormState = {
  error?: string;
  fieldErrors?: Partial<Record<"imageUrl" | "title" | "subtitle" | "buttonText" | "buttonLink", string[]>>;
};

function parseForm(formData: FormData) {
  return slideSchema.safeParse({
    imageUrl: formData.get("imageUrl") ?? "",
    title: formData.get("title") || undefined,
    subtitle: formData.get("subtitle") || undefined,
    buttonText: formData.get("buttonText") || undefined,
    buttonLink: formData.get("buttonLink") || undefined,
    isActive: formData.get("isActive") === "true",
  });
}

// Buton metni ile linkin birlikte tutarlı olması beklenir: biri varsa diğeri
// de olmalı (yoksa tıklanamaz/anlamsız buton oluşur).
function validateButton(data: z.infer<typeof slideSchema>): HeroSlideFormState | null {
  const hasText = !!data.buttonText;
  const hasLink = !!data.buttonLink;
  if (hasText && !hasLink) return { fieldErrors: { buttonLink: ["Buton metni girdiyseniz link de girmelisiniz."] } };
  if (hasLink && !hasText) return { fieldErrors: { buttonText: ["Buton linki girdiyseniz metin de girmelisiniz."] } };
  return null;
}

function revalidateHeroPaths() {
  revalidatePath("/admin/banner");
  revalidatePath("/");
}

export async function createSlideAction(
  _prevState: HeroSlideFormState,
  formData: FormData,
): Promise<HeroSlideFormState> {
  await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const buttonError = validateButton(parsed.data);
  if (buttonError) return buttonError;

  // Yeni slayt en sona eklenir (mevcut en büyük order + 1).
  const last = await prisma.heroSlide.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
  await prisma.heroSlide.create({
    data: {
      imageUrl: parsed.data.imageUrl,
      title: parsed.data.title ?? "",
      subtitle: parsed.data.subtitle ?? null,
      buttonText: parsed.data.buttonText ?? null,
      buttonLink: parsed.data.buttonLink ?? null,
      isActive: parsed.data.isActive,
      order: (last?.order ?? -1) + 1,
    },
  });

  revalidateHeroPaths();
  redirect("/admin/banner?created=1");
}

export async function updateSlideAction(
  slideId: string,
  _prevState: HeroSlideFormState,
  formData: FormData,
): Promise<HeroSlideFormState> {
  await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const buttonError = validateButton(parsed.data);
  if (buttonError) return buttonError;

  const existing = await prisma.heroSlide.findUnique({ where: { id: slideId } });
  if (!existing) return { error: "Slayt bulunamadı." };

  await prisma.heroSlide.update({
    where: { id: slideId },
    data: {
      imageUrl: parsed.data.imageUrl,
      title: parsed.data.title ?? "",
      subtitle: parsed.data.subtitle ?? null,
      buttonText: parsed.data.buttonText ?? null,
      buttonLink: parsed.data.buttonLink ?? null,
      isActive: parsed.data.isActive,
    },
  });

  // Medya değiştiyse eski Blob dosyası yetim kalmasın diye silinir.
  if (existing.imageUrl && existing.imageUrl !== parsed.data.imageUrl) {
    await deleteHeroMediaBlob(existing.imageUrl);
  }

  revalidateHeroPaths();
  redirect("/admin/banner?updated=1");
}

export async function deleteSlideAction(slideId: string) {
  await requireAdmin();
  const slide = await prisma.heroSlide.delete({ where: { id: slideId } });
  if (slide.imageUrl) await deleteHeroMediaBlob(slide.imageUrl);
  revalidateHeroPaths();
}

// Aktif/pasif değiştir: slaytı silmeden ana sayfada gizler/gösterir.
export async function toggleSlideActiveAction(slideId: string) {
  await requireAdmin();
  const slide = await prisma.heroSlide.findUnique({ where: { id: slideId }, select: { isActive: true } });
  if (!slide) return;
  await prisma.heroSlide.update({ where: { id: slideId }, data: { isActive: !slide.isActive } });
  revalidateHeroPaths();
}

// Sıralama: slaytı bir yukarı/aşağı taşır (komşu slaytla order değerini takas eder).
export async function moveSlideAction(slideId: string, direction: "up" | "down") {
  await requireAdmin();
  const slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" }, select: { id: true, order: true } });
  const index = slides.findIndex((s) => s.id === slideId);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= slides.length) return; // zaten uçta

  const current = slides[index];
  const neighbor = slides[swapIndex];
  await prisma.$transaction([
    prisma.heroSlide.update({ where: { id: current.id }, data: { order: neighbor.order } }),
    prisma.heroSlide.update({ where: { id: neighbor.id }, data: { order: current.order } }),
  ]);

  revalidateHeroPaths();
}

export async function uploadHeroMediaAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get("media");
  if (!(file instanceof File) || file.size === 0) return { error: "Dosya seçilmedi." };
  const result = await uploadHeroMedia(file);
  if (!result.ok) return { error: result.error };
  return { url: result.url };
}
