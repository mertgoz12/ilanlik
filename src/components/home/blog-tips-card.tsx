import Link from "next/link";
import { getLatestPostsForHome } from "@/lib/blog";

// Henüz yayınlanmış yazı yoksa kutu hiç gösterilmez (boş/kırık görünmesin).
export async function BlogTipsCard() {
  const posts = await getLatestPostsForHome(4);
  if (posts.length === 0) return null;

  return (
    <section className="rounded-xl bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">İpuçları & Rehberler</h2>
        <Link href="/blog" className="shrink-0 text-xs font-semibold text-brand hover:text-accent-dark">
          Tüm Yazılar →
        </Link>
      </div>
      <ul className="mt-2.5 space-y-2">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/blog/${post.slug}`}
              className="line-clamp-2 text-xs font-medium leading-snug text-slate-600 transition-colors hover:text-brand"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
