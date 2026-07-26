import { prisma } from "@/lib/prisma";
import { selectableCategories } from "@/lib/categories";
import { apiJson } from "@/lib/mobile-api";

// GET /api/mobile/post/categories - ilan verilebilecek YAPRAK kategoriler
// (DB id + breadcrumb). Web selectableCategories() ile aynı (Vasıta/Emlak
// "çok yakında" kapalıyken hariç). Mobil ilan-ver formu bu id'yi gönderir.
export async function GET() {
  const leaves = selectableCategories();
  const dbCats = await prisma.category.findMany({
    where: { slug: { in: leaves.map((l) => l.slug) } },
    select: { id: true, slug: true },
  });
  const idBySlug = new Map(dbCats.map((c) => [c.slug, c.id]));

  // Mobil kademeli (drill-down) kategori seçici, web category-picker ile aynı:
  // her yaprak için tam breadcrumb ad/slug zinciri (ağacı istemcide kurar).
  const categories = leaves
    .filter((l) => idBySlug.has(l.slug))
    .map((l) => ({
      id: idBySlug.get(l.slug) as string,
      slug: l.slug,
      name: l.name,
      breadcrumb: l.breadcrumb,
      breadcrumbSlugs: l.breadcrumbSlugs,
    }));

  return apiJson({ categories });
}
