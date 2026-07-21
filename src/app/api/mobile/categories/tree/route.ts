import { prisma } from "@/lib/prisma";
import { CATEGORY_TREE, COMING_SOON_SLUGS, isVasitaEmlakActive, type CategoryNode } from "@/lib/categories";
import { apiJson } from "@/lib/mobile-api";

// GET /api/mobile/categories/tree
// Sahibinden tarzı kategori gezinme için TAM iç içe ağaç + ilan sayıları.
// Her düğümün sayısı = kendi + tüm alt kategorilerindeki aktif ilan sayısı.
type TreeNode = {
  name: string;
  slug: string;
  count: number;
  comingSoon: boolean;
  children: TreeNode[];
};

export async function GET() {
  const active = isVasitaEmlakActive();

  // Kategori başına doğrudan aktif ilan sayısı (id -> slug eşlemesi ile).
  const [cats, grouped] = await Promise.all([
    prisma.category.findMany({ select: { id: true, slug: true } }),
    prisma.listing.groupBy({
      by: ["categoryId"],
      where: { status: "active", optionStatus: { not: "opsiyonlandi" } },
      _count: { _all: true },
    }),
  ]);
  const slugById = new Map(cats.map((c) => [c.id, c.slug]));
  const directBySlug = new Map<string, number>();
  for (const g of grouped) {
    const slug = slugById.get(g.categoryId);
    if (slug) directBySlug.set(slug, g._count._all);
  }

  function build(node: CategoryNode, topSlug: string): TreeNode {
    const children = (node.children ?? []).map((c) => build(c, topSlug));
    const subtotal = children.reduce((sum, c) => sum + c.count, 0);
    const count = (directBySlug.get(node.slug) ?? 0) + subtotal;
    return {
      name: node.name,
      slug: node.slug,
      count,
      comingSoon: !active && COMING_SOON_SLUGS.includes(topSlug),
      children,
    };
  }

  const categories = CATEGORY_TREE.map((node) => build(node, node.slug));
  return apiJson({ categories });
}
