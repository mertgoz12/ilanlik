"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { BLOG_CATEGORIES, estimateReadingMinutes } from "@/lib/blog-utils";
import { deleteBlogImageBlob, uploadBlogImage } from "@/lib/blog-photos";

const postSchema = z.object({
  title: z.string().trim().min(3, "Başlık en az 3 karakter olmalı.").max(160),
  slug: z
    .string()
    .trim()
    .min(3, "Slug en az 3 karakter olmalı.")
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, sayı ve tire içerebilir."),
  excerpt: z.string().trim().min(10, "Özet en az 10 karakter olmalı.").max(300, "Özet en fazla 300 karakter olabilir."),
  content: z.string().trim().min(20, "İçerik en az 20 karakter olmalı."),
  category: z.string().refine((v) => (BLOG_CATEGORIES as readonly string[]).includes(v), {
    message: "Geçerli bir kategori seçin.",
  }),
  coverImageUrl: z.string().trim().optional(),
  status: z.enum(["taslak", "yayinda"]),
});

export type BlogPostFormState = {
  error?: string;
  fieldErrors?: Partial<Record<"title" | "slug" | "excerpt" | "content" | "category", string[]>>;
};

function parseForm(formData: FormData) {
  return postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    category: formData.get("category"),
    coverImageUrl: formData.get("coverImageUrl") || undefined,
    status: formData.get("status"),
  });
}

export async function createPostAction(
  _prevState: BlogPostFormState,
  formData: FormData,
): Promise<BlogPostFormState> {
  const admin = await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const existing = await prisma.blogPost.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { fieldErrors: { slug: ["Bu slug zaten kullanılıyor."] } };

  const post = await prisma.blogPost.create({
    data: {
      ...parsed.data,
      readingMinutes: estimateReadingMinutes(parsed.data.content),
      authorId: admin.id,
    },
  });

  revalidatePath("/blog");
  revalidatePath("/");
  redirect(`/admin/blog/${post.id}/duzenle?created=1`);
}

export async function updatePostAction(
  postId: string,
  _prevState: BlogPostFormState,
  formData: FormData,
): Promise<BlogPostFormState> {
  await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const existing = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!existing) return { error: "Yazı bulunamadı." };

  const slugTaken = await prisma.blogPost.findFirst({
    where: { slug: parsed.data.slug, id: { not: postId } },
  });
  if (slugTaken) return { fieldErrors: { slug: ["Bu slug zaten kullanılıyor."] } };

  await prisma.blogPost.update({
    where: { id: postId },
    data: { ...parsed.data, readingMinutes: estimateReadingMinutes(parsed.data.content) },
  });

  // Kapak görseli değiştiyse eski Blob dosyası yetim kalmasın diye silinir.
  if (existing.coverImageUrl && existing.coverImageUrl !== parsed.data.coverImageUrl) {
    await deleteBlogImageBlob(existing.coverImageUrl);
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${existing.slug}`);
  if (existing.slug !== parsed.data.slug) revalidatePath(`/blog/${parsed.data.slug}`);
  revalidatePath("/");
  redirect("/admin/blog?updated=1");
}

export async function deletePostAction(postId: string) {
  await requireAdmin();
  const post = await prisma.blogPost.delete({ where: { id: postId } });
  if (post.coverImageUrl) await deleteBlogImageBlob(post.coverImageUrl);
  revalidatePath("/blog");
  revalidatePath("/");
}

export async function uploadBlogImageAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { error: "Dosya seçilmedi." };
  const result = await uploadBlogImage(file);
  if (!result.ok) return { error: result.error };
  return { url: result.url };
}
