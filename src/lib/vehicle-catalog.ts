import { prisma } from "@/lib/prisma";

export type VehicleCatalogTrim = {
  id: string;
  name: string;
  equipmentPackage: string | null;
  fuelType: string;
  transmission: string;
  engineVolume: string | null;
  enginePower: string | null;
  drivetrain: string | null;
};

export type VehicleCatalogGeneration = {
  id: string;
  name: string;
  yearStart: number;
  yearEnd: number | null;
  trims: VehicleCatalogTrim[];
};

export type VehicleCatalogModel = {
  id: string;
  name: string;
  generations: VehicleCatalogGeneration[];
};

export type VehicleCatalogBrand = {
  id: string;
  name: string;
  models: VehicleCatalogModel[];
};

// Dört seviyeyi (Marka->Model->Jenerasyon->Donanım) tek iç içe Prisma
// sorgusuyla çekmek, her seviyede önceki seviyenin TÜM id'lerini bir
// `WHERE ... IN (...)` cümlesinde bağlıyor. Katalog autoevolution
// içe aktarımıyla büyüdükten sonra (binlerce jenerasyon/donanım) bu,
// SQLite'ın bağlı parametre limitini aşıp "P2029" hatasıyla sessizce []
// dönmesine yol açıyordu. Bunun yerine her tabloyu WHERE'siz (tam tablo
// taraması, parametre yok) tek seferde çekip ağacı JS'te kuruyoruz.
export async function getVehicleCatalog(): Promise<VehicleCatalogBrand[]> {
  try {
    const [brands, models, generations, trims] = await Promise.all([
      prisma.vehicleBrand.findMany({
        orderBy: { order: "asc" },
        select: { id: true, name: true },
      }),
      prisma.vehicleModel.findMany({
        orderBy: { order: "asc" },
        select: { id: true, name: true, brandId: true },
      }),
      prisma.vehicleGeneration.findMany({
        orderBy: { order: "asc" },
        select: { id: true, name: true, yearStart: true, yearEnd: true, modelId: true },
      }),
      prisma.vehicleTrim.findMany({
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          equipmentPackage: true,
          fuelType: true,
          transmission: true,
          engineVolume: true,
          enginePower: true,
          drivetrain: true,
          generationId: true,
        },
      }),
    ]);

    const trimsByGeneration = new Map<string, VehicleCatalogTrim[]>();
    for (const t of trims) {
      const list = trimsByGeneration.get(t.generationId);
      if (list) list.push(t);
      else trimsByGeneration.set(t.generationId, [t]);
    }

    const generationsByModel = new Map<string, VehicleCatalogGeneration[]>();
    for (const g of generations) {
      const entry: VehicleCatalogGeneration = { ...g, trims: trimsByGeneration.get(g.id) ?? [] };
      const list = generationsByModel.get(g.modelId);
      if (list) list.push(entry);
      else generationsByModel.set(g.modelId, [entry]);
    }

    const modelsByBrand = new Map<string, VehicleCatalogModel[]>();
    for (const m of models) {
      const entry: VehicleCatalogModel = { ...m, generations: generationsByModel.get(m.id) ?? [] };
      const list = modelsByBrand.get(m.brandId);
      if (list) list.push(entry);
      else modelsByBrand.set(m.brandId, [entry]);
    }

    return brands.map((b) => ({ ...b, models: modelsByBrand.get(b.id) ?? [] }));
  } catch (err) {
    console.error("[vehicle-catalog] getVehicleCatalog hatası:", err);
    return [];
  }
}
