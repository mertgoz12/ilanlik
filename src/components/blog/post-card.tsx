import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { formatDate } from "@/lib/format";
import { ImageIcon } from "@/components/icons";

export type BlogPostCardData = {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  category: string;
  readingMinutes: number;
  publishedAt: Date;
};

export function BlogPostCard({ post }: { post: BlogPostCardData }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-lg"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 30vw, 90vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-700 text-white">
            <ImageIcon className="h-8 w-8 opacity-50" />
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-brand backdrop-blur-sm">
          {post.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-brand">
          {post.title}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm text-slate-500">{post.excerpt}</p>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{formatDate(post.publishedAt)}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readingMinutes} dk okuma
          </span>
        </div>
      </div>
    </Link>
  );
}
