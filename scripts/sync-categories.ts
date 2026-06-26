import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { CATEGORY_TREE, type CategoryNode } from "../src/lib/categories";

// src/lib/categories.ts'teki CATEGORY_TREE'yi (uygulamanın tek doğru kaynağı)
// gerçek veritabanı Category tablosuyla senkronize eder - ağaç kaç seviye
// derinse de (kök -> alt -> alt -> alt ...) recursive olarak çalışır. Yeni
// kategoriler oluşturulur, mevcut olanların adı/sırası/üst kategorisi
// güncellenir. Ağaçta artık bulunmayan ama GERÇEK ilanı olan bir kategori
// asla silinmez (sadece konsola uyarı yazılır) - veri kaybı riskine girilmez.
async function syncLevel(parentId: string | null, nodes: CategoryNode[]) {
  const desiredSlugs = new Set(nodes.map((n) => n.slug));

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

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const row = await prisma.category.upsert({
      where: { slug: node.slug },
      create: { name: node.name, slug: node.slug, order: i, parentId },
      update: { name: node.name, order: i, parentId },
    });
    if (node.children && node.children.length > 0) {
      await syncLevel(row.id, node.children);
    }
  }
}

async function main() {
  await syncLevel(null, CATEGORY_TREE);
  console.log("\nSenkronizasyon tamamlandı.");
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
