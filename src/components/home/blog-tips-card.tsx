import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getLatestPostsForHome } from "@/lib/blog";
import { ImageIcon } from "@/components/icons";

// Hiç yazı yoksa kutu boş/kırık görünmesin diye şık bir "yakında" durumu
// gösterilir - blogda ilk yazı yayınlanınca otomatik olarak gerçek
// yazılarla değişir.
export async function BlogTipsCard() {
  const posts = await getLatestPostsForHome(4);

  return (
    <section className="rounded-xl bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">İpuçları & Rehberler</h2>
        <Link href="/blog" className="shrink-0 text-xs font-semibold text-brand hover:text-accent-dark">
          Tüm Yazılar →
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="mt-3 flex flex-col items-center gap-2 rounded-lg bg-slate-50 py-6 text-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 shadow-soft">
            <BookOpen className="h-4 w-4" />
          </span>
          <p className="text-xs font-medium text-slate-400">Yakında ilk yazılarımız burada olacak.</p>
        </div>
      ) : (
        <ul className="mt-2.5 space-y-2.5">
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`} className="group flex items-center gap-2.5">
                <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {post.coverImageUrl ? (
                    <Image src={post.coverImageUrl} alt="" fill sizes="48px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <ImageIcon className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                <p className="line-clamp-2 text-xs font-medium leading-snug text-slate-600 transition-colors group-hover:text-brand">
                  {post.title}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
