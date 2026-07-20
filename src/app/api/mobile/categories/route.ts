import { CATEGORY_TREE, COMING_SOON_SLUGS, isVasitaEmlakActive } from "@/lib/categories";
import { apiJson } from "@/lib/mobile-api";

// GET /api/mobile/categories
// Ana sayfa kategori filtresi için üst kategori ağacı (ad + slug + alt
// kategoriler). "Çok yakında" (Vasıta/Emlak) kapalıyken gizlenir - web navbar
// ile aynı kural.
export async function GET() {
  const active = isVasitaEmlakActive();
  const categories = CATEGORY_TREE.filter(
    (node) => active || !COMING_SOON_SLUGS.includes(node.slug),
  ).map((node) => ({
    name: node.name,
    slug: node.slug,
    children: (node.children ?? []).map((child) => ({ name: child.name, slug: child.slug })),
  }));

  return apiJson({ categories });
}
