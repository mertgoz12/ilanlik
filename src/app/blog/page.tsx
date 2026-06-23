import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/blog";
import { BlogCategoryFilter } from "@/components/blog/category-filter";
import { BlogPostCard } from "@/components/blog/post-card";
import { BlogSearchBox } from "@/components/blog/search-box";
import { Pagination } from "@/components/pagination";
import { formatDate } from "@/lib/format";
import { ImageIcon, SearchIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Blog | İlanlio",
  description: "Güvenli alışveriş ipuçları, rehberler ve kategori tavsiyeleri - İlanlio Blog.",
  openGraph: {
    title: "İlanlio Blog",
    description: "Güvenli alışveriş ipuçları, rehberler ve kategori tavsiyeleri.",
    url: "https://ilanlio.com/blog",
    type: "website",
  },
};

type SearchParams = Record<string, string | undefined>;

export default async function BlogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { posts, totalPages } = await getPublishedPosts({ category: sp.kategori, search: sp.q, page });

  const showHero = page === 1 && !sp.kategori && !sp.q && posts.length > 0;
  const heroPost = showHero ? posts[0] : null;
  const gridPosts = showHero ? posts.slice(1) : posts;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">İlanlio Blog</h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Güvenli alışveriş ipuçları, rehberler ve kategori tavsiyeleri.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BlogCategoryFilter active={sp.kategori} search={sp.q} />
        <BlogSearchBox defaultValue={sp.q} />
      </div>

      {heroPost && (
        <Link
          href={`/blog/${heroPost.slug}`}
          className="group mb-8 flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft-lg transition-shadow hover:shadow-soft-lg lg:flex-row"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 lg:aspect-auto lg:w-1/2">
            {heroPost.coverImageUrl ? (
              <Image
                src={heroPost.coverImageUrl}
                alt={heroPost.title}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-700 text-white">
                <ImageIcon className="h-10 w-10 opacity-50" />
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col justify-center gap-3 p-6 sm:p-8">
            <span className="inline-flex w-fit items-center rounded-full bg-accent-light px-3 py-1 text-xs font-semibold text-brand">
              {heroPost.category}
            </span>
            <h2 className="text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-brand sm:text-2xl">
              {heroPost.title}
            </h2>
            <p className="line-clamp-3 text-sm text-slate-500 sm:text-base">{heroPost.excerpt}</p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{formatDate(heroPost.publishedAt)}</span>
              <span>·</span>
              <span>{heroPost.readingMinutes} dk okuma</span>
            </div>
          </div>
        </Link>
      )}

      {gridPosts.length === 0 && !heroPost ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-20 text-center shadow-soft">
          <SearchIcon className="h-10 w-10 text-slate-300" />
          <p className="mt-4 text-sm font-medium text-slate-600">
            {sp.q || sp.kategori ? "Bu aramaya uygun yazı bulunamadı." : "Henüz blog yazısı yayınlanmadı."}
          </p>
          {(sp.q || sp.kategori) && (
            <Link href="/blog" className="mt-2 text-sm font-semibold text-brand hover:text-accent-dark">
              Filtreleri temizle
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gridPosts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} searchParams={sp} />}
    </div>
  );
}
