import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  CATEGORY_TREE,
  COMING_SOON_SLUGS,
  collectSlugs,
  findCategory,
  findCategoryPath,
  isComingSoonSlug,
  isVasitaEmlakActive,
  type CategoryNode,
} from "@/lib/categories";
import { getCategoryVisual } from "@/lib/category-visuals";
import { ComingSoonBadge, ComingSoonTrigger } from "./coming-soon";
import { ChevronDownIcon, FolderIcon } from "./icons";

export async function CategorySidebar({ activeSlug }: { activeSlug?: string }) {
  const node = activeSlug ? findCategory(activeSlug) : null;

  // Bir kategorinin içindeyken: sahibinden tarzı bağlamsal gezinme
  // (alt kategoriler + "Bu kategorideki tüm ilanlar" + üst kategori + ilgili
  // kardeş kategoriler). Kullanıcı dallar arasında rahatça gezebilir.
  if (node) {
    return <ContextualCategoryNav node={node} activeSlug={activeSlug!} />;
  }

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
    <nav className="space-y-0.5">
      <h2 className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        Kategoriler
      </h2>

      {categories.map((cat) => {
        const total = cat._count.listings + cat.children.reduce((sum, c) => sum + c._count.listings, 0);
        const { icon: Icon } = getCategoryVisual(cat.slug);
        const comingSoon = !vasitaEmlakActive && COMING_SOON_SLUGS.includes(cat.slug);

        // Emlak/Vasıta henüz aktif değil ama sahibinden tarzı dolgun görünüm
        // için alt kategorileri de (tıklanamaz/soluk olarak) gösterilir.
        if (comingSoon) {
          return (
            <details key={cat.id} className="group" open>
              <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-md px-2 py-1.5 text-left [&::-webkit-details-marker]:hidden">
                <Icon className="h-4 w-4 shrink-0 text-slate-300" />
                <ComingSoonTrigger className="flex-1 text-left text-[13px] font-semibold text-slate-400">
                  {cat.name}
                </ComingSoonTrigger>
                <ComingSoonBadge />
                <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              {cat.children.length > 0 && (
                <div className="mt-0.5 space-y-0 border-l border-slate-100 pl-2.5">
                  {cat.children.map((child) => {
                    const { icon: ChildIcon } = getCategoryVisual(child.slug);
                    return (
                      <span key={child.id} className="flex items-center gap-2 px-2 py-1 text-[12px] text-slate-300">
                        <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                        {child.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </details>
          );
        }

        if (cat.children.length === 0) {
          const active = cat.slug === activeSlug;
          return (
            <Link
              key={cat.id}
              href={`/?kategori=${cat.slug}`}
              className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-semibold transition-colors ${
                active ? "bg-accent-light text-brand" : "text-foreground hover:bg-slate-50"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-brand" : "text-slate-400"}`} />
              <span className="flex-1">{cat.name}</span>
              <span className="text-[11px] font-normal text-slate-400">({total})</span>
            </Link>
          );
        }

        return (
          <details key={cat.id} className="group" open>
            <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
              <Icon className="h-4 w-4 shrink-0 text-slate-400" />
              <Link href={`/?kategori=${cat.slug}`} className="flex-1 text-[13px] font-semibold text-foreground">
                {cat.name} <span className="text-[11px] font-normal text-slate-400">({total})</span>
              </Link>
              <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
            </summary>

            <div className="mt-0.5 space-y-0 border-l border-slate-100 pl-2.5">
              {cat.children.map((child) => {
                const active = child.slug === activeSlug;
                const { icon: ChildIcon } = getCategoryVisual(child.slug);
                return (
                  <Link
                    key={child.id}
                    href={`/?kategori=${child.slug}`}
                    className={`flex items-center gap-2 rounded-md px-2 py-1 text-[12px] transition-colors ${
                      active
                        ? "bg-accent-light font-semibold text-brand"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ChildIcon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-brand" : "text-slate-400"}`} />
                    <span className="flex-1">{child.name}</span>
                    <span className="text-[11px] text-slate-400">({child._count.listings})</span>
                  </Link>
                );
              })}
            </div>
          </details>
        );
      })}

      <Link
        href="/site-haritasi"
        className="mt-1.5 flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-semibold text-brand transition-colors hover:bg-slate-50"
      >
        <FolderIcon className="h-4 w-4 shrink-0" />
        Tüm Kategorileri Gör
      </Link>
    </nav>
  );
}

// Sahibinden tarzı bağlamsal kategori gezinmesi (bir kategorinin içindeyken).
async function ContextualCategoryNav({ node, activeSlug }: { node: CategoryNode; activeSlug: string }) {
  const vasitaEmlakActive = isVasitaEmlakActive();
  const rows = await prisma.category.findMany({
    select: { slug: true, _count: { select: { listings: true } } },
  });
  const countBySlug = new Map(rows.map((r) => [r.slug, r._count.listings]));
  const subtreeCount = (n: CategoryNode) =>
    collectSlugs(n).reduce((sum, slug) => sum + (countBySlug.get(slug) ?? 0), 0);

  const path = findCategoryPath(activeSlug) ?? [];
  const parent = path.length >= 2 ? path[path.length - 2] : null;
  const siblingsAll = parent ? parent.children ?? [] : CATEGORY_TREE;
  const visible = (n: CategoryNode) => vasitaEmlakActive || !isComingSoonSlug(n.slug);
  const children = (node.children ?? []).filter(visible);
  const siblings = siblingsAll.filter((s) => s.slug !== node.slug && visible(s));
  const { icon: Icon } = getCategoryVisual(node.slug);

  const rowCls =
    "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[13px] text-brand transition-colors hover:bg-slate-50";
  const countCls = "shrink-0 text-[11px] font-normal text-slate-400";

  return (
    <nav className="space-y-3.5">
      {/* Mevcut kategori + alt kategoriler */}
      <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-soft">
        <h2 className="mb-1.5 flex items-center gap-2 px-1 text-[14px] font-bold text-foreground">
          <Icon className="h-4 w-4 shrink-0 text-brand" />
          <span className="min-w-0 truncate">{node.name}</span>
        </h2>
        <div className="space-y-0.5">
          {children.map((child) => (
            <Link key={child.slug} href={`/?kategori=${child.slug}`} className={rowCls}>
              <span className="min-w-0 flex-1 truncate">{child.name}</span>
              <span className={countCls}>({subtreeCount(child).toLocaleString("tr-TR")})</span>
            </Link>
          ))}
          <Link
            href={`/?kategori=${node.slug}`}
            className="mt-0.5 block rounded-md px-2 py-1.5 text-[13px] font-bold text-foreground transition-colors hover:bg-slate-50"
          >
            Bu Kategorideki Tüm İlanlar
          </Link>
        </div>
      </div>

      {/* Üst kategori / tümü */}
      <Link
        href={parent ? `/?kategori=${parent.slug}` : "/"}
        className="flex items-center gap-2 px-1 text-[13px] font-semibold text-brand transition-colors hover:text-accent-dark"
      >
        <FolderIcon className="h-4 w-4 shrink-0" />
        {parent ? `Tüm ${parent.name} Kategorileri` : "Tüm Kategoriler"}
      </Link>

      {/* İlgili (kardeş) kategoriler */}
      {siblings.length > 0 && (
        <div>
          <h3 className="mb-1 px-1 text-[13px] font-bold text-foreground">İlgili Kategoriler</h3>
          <div className="space-y-0.5">
            {siblings.map((sib) => (
              <Link key={sib.slug} href={`/?kategori=${sib.slug}`} className={rowCls}>
                <span className="min-w-0 flex-1 truncate">{sib.name}</span>
                <span className={countCls}>({subtreeCount(sib).toLocaleString("tr-TR")})</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
