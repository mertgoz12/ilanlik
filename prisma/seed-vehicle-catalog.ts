import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { VEHICLE_CATALOG } from "./vehicle-catalog-data";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

// Idempotent upsert: varolan kayıtlara dokunmaz, sadece yeni girdileri ekler.
// Veri dosyasına yeni marka/model/jenerasyon/donanım ekleyip tekrar çalıştırıldığında
// mevcut admin düzenlemeleri korunur.
async function seedVehicleCatalog() {
  let brandCount = 0;
  let modelCount = 0;
  let generationCount = 0;
  let trimCount = 0;

  for (let bi = 0; bi < VEHICLE_CATALOG.length; bi++) {
    const brandData = VEHICLE_CATALOG[bi];

    const brand = await prisma.vehicleBrand.upsert({
      where: { name: brandData.name },
      update: {},
      create: { name: brandData.name, order: bi },
    });
    brandCount++;

    for (let mi = 0; mi < brandData.models.length; mi++) {
      const modelData = brandData.models[mi];

      const model = await prisma.vehicleModel.upsert({
        where: { brandId_name: { brandId: brand.id, name: modelData.name } },
        update: {},
        create: { name: modelData.name, order: mi, brandId: brand.id },
      });
      modelCount++;

      for (let gi = 0; gi < modelData.generations.length; gi++) {
        const genData = modelData.generations[gi];

        const generation = await prisma.vehicleGeneration.upsert({
          where: { modelId_name: { modelId: model.id, name: genData.name } },
          update: {},
          create: {
            name: genData.name,
            yearStart: genData.yearStart,
            yearEnd: genData.yearEnd ?? null,
            order: gi,
            modelId: model.id,
          },
        });
        generationCount++;

        for (let ti = 0; ti < genData.trims.length; ti++) {
          const trimData = genData.trims[ti];

          await prisma.vehicleTrim.upsert({
            where: { generationId_name: { generationId: generation.id, name: trimData.name } },
            update: {},
            create: {
              name: trimData.name,
              equipmentPackage: trimData.equipmentPackage ?? null,
              fuelType: trimData.fuelType,
              transmission: trimData.transmission,
              engineVolume: trimData.engineVolume ?? null,
              enginePower: trimData.enginePower ?? null,
              drivetrain: trimData.drivetrain ?? null,
              order: ti,
              generationId: generation.id,
            },
          });
          trimCount++;
        }
      }
    }
  }

  console.log(
    `Araç kataloğu güncellendi: ${brandCount} marka, ${modelCount} model, ${generationCount} jenerasyon, ${trimCount} donanım/motor.`,
  );
}

seedVehicleCatalog()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
