import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { COMING_SOON_SLUGS, isVasitaEmlakActive } from "@/lib/categories";
import { ComingSoonBadge, ComingSoonTrigger } from "./coming-soon";
import { ChevronDownIcon } from "./icons";

export async function CategorySidebar({ activeSlug }: { activeSlug?: string }) {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    include: {
      children: {
        orderBy: { order: "asc" },
        include: { _count: { select: { listings: true } } },
      },
      _count: { select: { listings: true } },
    },
  });

  const vasitaEmlakActive = isVasitaEmlakActive();

  return (
    <nav className="space-y-1">
      <h2 className="px-3 pb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
        Kategoriler
      </h2>

      {categories.map((cat) => {
        const total = cat._count.listings + cat.children.reduce((sum, c) => sum + c._count.listings, 0);

        if (!vasitaEmlakActive && COMING_SOON_SLUGS.includes(cat.slug)) {
          return (
            <ComingSoonTrigger
              key={cat.id}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-400"
            >
              <span>{cat.name}</span>
              <ComingSoonBadge />
            </ComingSoonTrigger>
          );
        }

        if (cat.children.length === 0) {
          const active = cat.slug === activeSlug;
          return (
            <Link
              key={cat.id}
              href={`/?kategori=${cat.slug}`}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                active ? "bg-accent-light text-brand" : "text-foreground hover:bg-slate-50"
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-xs font-normal text-slate-400">({total})</span>
            </Link>
          );
        }

        const isOpen =
          cat.slug === activeSlug || cat.children.some((c) => c.slug === activeSlug);

        return (
          <details key={cat.id} className="group" open={isOpen}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
              <Link
                href={`/?kategori=${cat.slug}`}
                className="flex-1 text-sm font-semibold text-foreground"
              >
                {cat.name}{" "}
                <span className="text-xs font-normal text-slate-400">({total})</span>
              </Link>
              <ChevronDownIcon className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
            </summary>

            <div className="mt-1 space-y-0.5 border-l border-slate-100 pl-3">
              {cat.children.map((child) => {
                const active = child.slug === activeSlug;
                return (
                  <Link
                    key={child.id}
                    href={`/?kategori=${child.slug}`}
                    className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? "bg-accent-light font-semibold text-brand"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{child.name}</span>
                    <span className="text-xs text-slate-400">({child._count.listings})</span>
                  </Link>
                );
              })}
            </div>
          </details>
        );
      })}
    </nav>
  );
}
