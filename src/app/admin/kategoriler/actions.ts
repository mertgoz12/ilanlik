"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

const TR_CHAR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

function slugify(input: string): string {
  return input
    .split("")
    .map((ch) => TR_CHAR_MAP[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const baseSlug = base || "kategori";
  let slug = baseSlug;
  let suffix = 1;
  while (
    await prisma.category.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
  return slug;
}

function revalidateCategoryPaths() {
  revalidatePath("/admin/kategoriler");
  revalidatePath("/admin/ilanlar");
  revalidatePath("/");
  revalidatePath("/ilan-ver");
}

// "use server" dosyasındaki TÜM fonksiyonlar HTTP üzerinden çağrılabilir
// server action'lardır; arayüz bu butonları admin olmayanlara göstermese de
// requireAdmin() burada (ikinci savunma katmanı olarak) yeniden doğrulama yapar.
export async function createCategoryAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const parentId = String(formData.get("parentId") ?? "") || null;
  const slug = await uniqueSlug(slugify(name));
  const siblingCount = await prisma.category.count({ where: { parentId } });

  await prisma.category.create({ data: { name, slug, order: siblingCount, parentId } });
  revalidateCategoryPaths();
}

export async function updateCategoryAction(categoryId: string, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  if (!name) return;

  const slug = await uniqueSlug(slugify(rawSlug) || slugify(name), categoryId);
  await prisma.category.update({ where: { id: categoryId }, data: { name, slug } });
  revalidateCategoryPaths();
}

export async function deleteCategoryAction(categoryId: string) {
  await requireAdmin();

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { _count: { select: { children: true, listings: true } } },
  });
  if (!category || category._count.children > 0 || category._count.listings > 0) {
    // Alt kategorisi veya ilanı olan kategoriler silinemez (arayüz bu durumda
    // "Sil" butonunu göstermez; bu kontrol ikinci savunma katmanıdır).
    return;
  }

  await prisma.category.delete({ where: { id: categoryId } });
  revalidateCategoryPaths();
}
