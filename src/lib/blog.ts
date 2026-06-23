import { prisma } from "./prisma";
import { isValidBlogCategory } from "./blog-utils";

export type BlogListItem = Awaited<ReturnType<typeof getPublishedPosts>>["posts"][number];

export async function getPublishedPosts(options?: {
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = options?.pageSize ?? 9;

  const where = {
    status: "yayinda",
    ...(options?.category && isValidBlogCategory(options.category) ? { category: options.category } : {}),
    ...(options?.search
      ? {
          OR: [
            { title: { contains: options.search } },
            { excerpt: { contains: options.search } },
          ],
        }
      : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { author: { select: { name: true } } },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return { posts, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getLatestPostsForHome(take = 4) {
  return prisma.blogPost.findMany({
    where: { status: "yayinda" },
    orderBy: { publishedAt: "desc" },
    take,
    select: { id: true, title: true, slug: true, publishedAt: true },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({
    where: { slug },
    include: { author: { select: { name: true, avatarUrl: true } } },
  });
}

export async function getRelatedPosts(postId: string, category: string, take = 3) {
  return prisma.blogPost.findMany({
    where: { status: "yayinda", category, id: { not: postId } },
    orderBy: { publishedAt: "desc" },
    take,
  });
}
