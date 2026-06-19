import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

// seed-autoevolution.ts'nin eklediği her şeyi geri alır. Elle (admin
// panelinden veya prisma/vehicle-catalog-data.ts ile) eklenen kayıtlara
// dokunmaz: onlarda sourceUrl hep null'dur. Aşağıdan yukarıya boşalan
// üst kayıtları (jenerasyon/model/marka) da temizler.
async function revertAutoevolution() {
  const { count: trimCount } = await prisma.vehicleTrim.deleteMany({
    where: { sourceUrl: { not: null } },
  });
  const { count: generationCount } = await prisma.vehicleGeneration.deleteMany({
    where: { trims: { none: {} } },
  });
  const { count: modelCount } = await prisma.vehicleModel.deleteMany({
    where: { generations: { none: {} } },
  });
  const { count: brandCount } = await prisma.vehicleBrand.deleteMany({
    where: { models: { none: {} } },
  });

  console.log(
    `autoevolution içe aktarımı geri alındı: ${trimCount} donanım, ${generationCount} jenerasyon, ${modelCount} model, ${brandCount} marka silindi.`,
  );
}

revertAutoevolution()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
