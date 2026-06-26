import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { CATEGORY_TREE, collectSlugs, type CategoryNode } from "../src/lib/categories";

// src/lib/categories.ts'teki CATEGORY_TREE'yi (uygulamanın tek doğru kaynağı)
// gerçek veritabanı Category tablosuyla senkronize eder - ağaç kaç seviye
// derinse de (kök -> alt -> alt -> alt ...) recursive olarak çalışır. Yeni
// kategoriler oluşturulur, mevcut olanların adı/sırası/üst kategorisi
// güncellenir.
async function syncLevel(parentId: string | null, nodes: CategoryNode[]) {
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
  // 1) Önce tüm ağacı upsert et: yeni düğümler oluşur, mevcut olanların
  //    adı/sırası/üst kategorisi (reparenting dahil) güncellenir.
  await syncLevel(null, CATEGORY_TREE);

  // 2) Mutabakat: ağaçta artık bulunmayan kategorileri tespit et. GERÇEK
  //    ilanı olan bir kategori ASLA silinmez (sadece uyarılır) - veri kaybı
  //    riskine girilmez. İlansız ve ağaçta olmayanlar temizlenir. (1. adım
  //    reparenting'i yaptığı için, ağaçta KALAN hiçbir düğüm artık silinecek
  //    bir parent'a bağlı değildir; cascade güvenli.)
  const desired = new Set(CATEGORY_TREE.flatMap(collectSlugs));
  const stale = await prisma.category.findMany({
    where: { slug: { notIn: [...desired] } },
    include: { _count: { select: { listings: true } } },
  });

  const deletableIds: string[] = [];
  for (const row of stale) {
    if (row._count.listings > 0) {
      console.warn(
        `UYARI: "${row.name}" (${row.slug}) yeni ağaçta yok ama ${row._count.listings} ilanı var - SİLİNMEDİ.`,
      );
    } else {
      deletableIds.push(row.id);
    }
  }
  if (deletableIds.length > 0) {
    const res = await prisma.category.deleteMany({ where: { id: { in: deletableIds } } });
    console.log(`Temizlendi (ilansız, ağaçta yok): ${res.count} kategori`);
  }

  const total = await prisma.category.count();
  console.log(`\nSenkronizasyon tamamlandı. Toplam kategori: ${total}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
