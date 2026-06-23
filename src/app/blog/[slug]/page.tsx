import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog";
import { extractToc } from "@/lib/blog-toc";
import { Avatar } from "@/components/avatar";
import { BlogPostCard } from "@/components/blog/post-card";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { ShareButtons } from "@/components/blog/share-buttons";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { formatDate } from "@/lib/format";
import { ImageIcon } from "@/components/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "yayinda") return {};

  const url = `https://ilanlio.com/blog/${post.slug}`;

  return {
    title: `${post.title} | İlanlio Blog`,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "yayinda") notFound();

  const [related] = await Promise.all([getRelatedPosts(post.id, post.category)]);
  const toc = extractToc(post.content);
  const url = `https://ilanlio.com/blog/${post.slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <nav className="mb-4 text-sm text-slate-400">
        <Link href="/blog" className="hover:text-brand">
          Blog
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-500">{post.category}</span>
      </nav>

      <div className="relative mb-6 aspect-[16/7] w-full overflow-hidden rounded-2xl bg-slate-100">
        {post.coverImageUrl ? (
          <Image src={post.coverImageUrl} alt={post.title} fill sizes="100vw" className="object-cover" priority />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-700 text-white">
            <ImageIcon className="h-12 w-12 opacity-50" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <article className="min-w-0">
          <span className="inline-flex w-fit items-center rounded-full bg-accent-light px-3 py-1 text-xs font-semibold text-brand">
            {post.category}
          </span>
          <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-b border-slate-100 pb-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Avatar name={post.author?.name ?? "İlanlio Editör"} src={post.author?.avatarUrl} size="sm" />
              <span className="font-medium text-foreground">{post.author?.name ?? "İlanlio Editör"}</span>
            </div>
            <span>·</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>·</span>
            <span>{post.readingMinutes} dk okuma</span>
            <div className="ml-auto">
              <ShareButtons url={url} title={post.title} />
            </div>
          </div>

          <div className="mt-6 lg:hidden">
            <TableOfContents entries={toc} />
          </div>

          <div className="mt-6">
            <MarkdownContent content={post.content} />
          </div>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <TableOfContents entries={toc} />
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-12 border-t border-slate-100 pt-8">
          <h2 className="mb-4 text-lg font-bold text-foreground">İlgili Yazılar</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {related.map((relatedPost) => (
              <BlogPostCard key={relatedPost.id} post={relatedPost} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
