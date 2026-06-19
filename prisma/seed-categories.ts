import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { CATEGORY_TREE, type CategoryNode } from "../src/lib/categories";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// prisma/seed.ts'teki demo ilan/kullanıcı oluşturma kısmından bağımsız,
// sadece kategori taksonomisini (canlıya da basılabilecek gerçek veri)
// idempotent şekilde oluşturur/günceller. upsert kullanır: tekrar
// çalıştırılması güvenlidir, mevcut ID'leri korur.
async function seedCategories(): Promise<Map<string, string>> {
  const idBySlug = new Map<string, string>();

  async function walk(nodes: CategoryNode[], parentId: string | null) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const upserted = await prisma.category.upsert({
        where: { slug: node.slug },
        update: { name: node.name, order: i, parentId },
        create: { name: node.name, slug: node.slug, order: i, parentId },
      });
      idBySlug.set(node.slug, upserted.id);
      if (node.children) {
        await walk(node.children, upserted.id);
      }
    }
  }

  await walk(CATEGORY_TREE, null);
  return idBySlug;
}

seedCategories()
  .then((idBySlug) => {
    console.log(`${idBySlug.size} kategori oluşturuldu/güncellendi.`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
