import { prisma } from "../src/lib/prisma";
import { CATEGORY_TREE, type CategoryNode } from "../src/lib/categories";

// src/lib/categories.ts'teki CATEGORY_TREE'yi (uygulamanın tek doğru kaynağı)
// gerçek veritabanı Category tablosuyla senkronize eder. Yeni kategoriler
// oluşturulur, mevcut olanların adı/sırası güncellenir. Ağaçta artık
// bulunmayan ama GERÇEK ilanı olan bir alt kategori asla silinmez (sadece
// konsola uyarı yazılır) - veri kaybı riskine girilmez.
async function syncChildren(parentId: string, children: CategoryNode[]) {
  const desiredSlugs = new Set(children.map((c) => c.slug));

  const existing = await prisma.category.findMany({
    where: { parentId },
    include: { _count: { select: { listings: true } } },
  });

  for (const row of existing) {
    if (desiredSlugs.has(row.slug)) continue;
    if (row._count.listings > 0) {
      console.warn(
        `UYARI: "${row.name}" (${row.slug}) yeni ağaçta yok ama ${row._count.listings} ilanı var - SİLİNMEDİ.`,
      );
      continue;
    }
    await prisma.category.delete({ where: { id: row.id } });
    console.log(`silindi (ilansız): ${row.name} (${row.slug})`);
  }

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    await prisma.category.upsert({
      where: { slug: child.slug },
      create: { name: child.name, slug: child.slug, parentId, order: i },
      update: { name: child.name, order: i, parentId },
    });
  }
}

async function main() {
  for (let i = 0; i < CATEGORY_TREE.length; i++) {
    const node = CATEGORY_TREE[i];
    const parent = await prisma.category.upsert({
      where: { slug: node.slug },
      create: { name: node.name, slug: node.slug, order: i },
      update: { name: node.name, order: i },
    });
    console.log(`üst kategori: ${parent.name} (${parent.slug})`);

    if (node.children && node.children.length > 0) {
      await syncChildren(parent.id, node.children);
    }
  }

  console.log("\nSenkronizasyon tamamlandı.");
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
