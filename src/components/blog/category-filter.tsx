import Link from "next/link";
import { BLOG_CATEGORIES } from "@/lib/blog-utils";

function pillClass(isActive: boolean): string {
  return `shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? "border-brand bg-brand text-white"
      : "border-slate-200 bg-white text-slate-600 hover:border-accent hover:bg-accent-light hover:text-brand"
  }`;
}

export function BlogCategoryFilter({ active, search }: { active?: string; search?: string }) {
  const searchSuffix = search ? `&q=${encodeURIComponent(search)}` : "";

  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto">
      <Link href={search ? `/blog?q=${encodeURIComponent(search)}` : "/blog"} className={pillClass(!active)}>
        Tümü
      </Link>
      {BLOG_CATEGORIES.map((category) => (
        <Link
          key={category}
          href={`/blog?kategori=${encodeURIComponent(category)}${searchSuffix}`}
          className={pillClass(active === category)}
        >
          {category}
        </Link>
      ))}
    </div>
  );
}
