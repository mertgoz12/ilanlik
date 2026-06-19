import type { DRIVETRAINS, FUEL_TYPES, TRANSMISSIONS } from "../src/lib/car-data";

type FuelType = (typeof FUEL_TYPES)[number];
type Transmission = (typeof TRANSMISSIONS)[number];
type Drivetrain = (typeof DRIVETRAINS)[number];

// Bir "Motor & Donanım Paketi" seçeneği. `name`, kullanıcının "Seri / Paket"
// alanında göreceği tam etikettir (örn. "1.5 dCi Touch").
export type TrimSeed = {
  name: string;
  equipmentPackage?: string;
  fuelType: FuelType;
  transmission: Transmission;
  engineVolume?: string;
  enginePower?: string;
  drivetrain?: Drivetrain;
};

// Bir jenerasyon/seri (örn. "Clio 5"). `yearEnd` belirtilmezse "halen üretimde" kabul edilir.
export type GenerationSeed = {
  name: string;
  yearStart: number;
  yearEnd?: number;
  trims: TrimSeed[];
};

export type ModelSeed = {
  name: string;
  generations: GenerationSeed[];
};

export type BrandSeed = {
  name: string;
  models: ModelSeed[];
};

// İlan Verme Sihirbazı > Araç Bilgileri kademeli (cascading) seçim verisi.
// Yeni marka/model/jenerasyon/donanım eklemek için bu diziye yeni girdiler
// ekleyin; prisma/seed-vehicle-catalog.ts script'i bunu idempotent şekilde
// veritabanına işler (db:seed-vehicles). Sıralama, dizideki sıraya göre
// otomatik atanır.
export const VEHICLE_CATALOG: BrandSeed[] = [
  // ── VOLKSWAGEN ────────────────────────────────────────────────────────────
  {
    name: "Volkswagen",
    models: [
      // ── Binek ──
      {
        name: "Polo",
        generations: [
          {
            name: "Polo 5",
            yearStart: 2009,
            yearEnd: 2017,
            trims: [
              { name: "1.0 MPI Trendline", equipmentPackage: "Trendline", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 TSI Comfortline", equipmentPackage: "Comfortline", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 TSI Highline DSG", equipmentPackage: "Highline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 TSI Lounge DSG", equipmentPackage: "Lounge", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.4 TDI Trendline", equipmentPackage: "Trendline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.4 TDI Comfortline", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.6 TDI Comfortline", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "1.6 TDI Highline", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "1.6 TDI Lounge DSG", equipmentPackage: "Lounge", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
            ],
          },
          {
            name: "Polo 6",
            yearStart: 2017,
            trims: [
              { name: "1.0 MPI Comfortline", equipmentPackage: "Comfortline", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 TSI Comfortline", equipmentPackage: "Comfortline", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 TSI Highline", equipmentPackage: "Highline", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 TSI Highline DSG", equipmentPackage: "Highline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 TSI Lounge", equipmentPackage: "Lounge", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 TSI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.6 TDI Comfortline", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "1.6 TDI Highline", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Golf",
        generations: [
          {
            name: "Golf 7",
            yearStart: 2012,
            yearEnd: 2019,
            trims: [
              { name: "1.2 TSI Trendline", equipmentPackage: "Trendline", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", drivetrain: "Önden Çekiş" },
              { name: "1.2 TSI Comfortline", equipmentPackage: "Comfortline", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI Trendline", equipmentPackage: "Trendline", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI Comfortline", equipmentPackage: "Comfortline", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI Highline", equipmentPackage: "Highline", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI Highline DSG", equipmentPackage: "Highline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "2.0 TSI GTI DSG", equipmentPackage: "GTI", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TSI R DSG", equipmentPackage: "R", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "4x4" },
              { name: "1.6 TDI Trendline", equipmentPackage: "Trendline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "1.6 TDI Comfortline", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "1.6 TDI Highline", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Comfortline", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Highline DSG", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI GTD DSG", equipmentPackage: "GTD", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
            ],
          },
          {
            name: "Golf 8",
            yearStart: 2019,
            trims: [
              { name: "1.0 TSI Life", equipmentPackage: "Life", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 TSI Life DSG", equipmentPackage: "Life", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.5 eTSI Life DSG", equipmentPackage: "Life", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 eTSI Midline DSG", equipmentPackage: "Midline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 eTSI Style DSG", equipmentPackage: "Style", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 eTSI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "2.0 TSI GTI DSG", equipmentPackage: "GTI", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TSI R DSG", equipmentPackage: "R", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "4x4" },
              { name: "2.0 TDI Life", equipmentPackage: "Life", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Life DSG", equipmentPackage: "Life", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Style DSG", equipmentPackage: "Style", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI GTD DSG", equipmentPackage: "GTD", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Passat",
        generations: [
          {
            name: "Passat B7",
            yearStart: 2010,
            yearEnd: 2014,
            trims: [
              { name: "1.4 TSI Trendline", equipmentPackage: "Trendline", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI Highline DSG", equipmentPackage: "Highline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.6 TDI Trendline", equipmentPackage: "Trendline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "1.6 TDI Comfortline", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Highline DSG", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
            ],
          },
          {
            name: "Passat B8",
            yearStart: 2014,
            yearEnd: 2023,
            trims: [
              { name: "1.5 TSI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI Elegance DSG", equipmentPackage: "Elegance", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "2.0 TSI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "1.6 TDI Trendline", equipmentPackage: "Trendline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "1.6 TDI Comfortline", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Highline DSG", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Elegance DSG", equipmentPackage: "Elegance", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Business DSG", equipmentPackage: "Business", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Jetta",
        generations: [
          {
            name: "Jetta 6",
            yearStart: 2011,
            yearEnd: 2018,
            trims: [
              { name: "1.2 TSI Trendline", equipmentPackage: "Trendline", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", drivetrain: "Önden Çekiş" },
              { name: "1.2 TSI Comfortline", equipmentPackage: "Comfortline", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI Comfortline", equipmentPackage: "Comfortline", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI Highline", equipmentPackage: "Highline", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI Highline DSG", equipmentPackage: "Highline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.6 TDI Trendline", equipmentPackage: "Trendline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "1.6 TDI Comfortline", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "1.6 TDI Highline", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
            ],
          },
          {
            name: "Jetta 7",
            yearStart: 2019,
            trims: [
              { name: "1.4 TSI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI Highline DSG", equipmentPackage: "Highline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Arteon",
        generations: [
          {
            name: "Arteon 1",
            yearStart: 2017,
            trims: [
              { name: "1.5 TSI Elegance DSG", equipmentPackage: "Elegance", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "2.0 TSI Elegance DSG", equipmentPackage: "Elegance", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "4x4" },
              { name: "2.0 TSI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "4x4" },
              { name: "2.0 TSI R DSG", equipmentPackage: "R", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "4x4" },
              { name: "2.0 TDI Elegance DSG", equipmentPackage: "Elegance", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "4x4" },
            ],
          },
        ],
      },
      {
        name: "Scirocco",
        generations: [
          {
            name: "Scirocco 3",
            yearStart: 2008,
            yearEnd: 2017,
            trims: [
              { name: "1.4 TSI Sportline", equipmentPackage: "Sportline", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI Sportline DSG", equipmentPackage: "Sportline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI R-Line", equipmentPackage: "R-Line", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "2.0 TSI Sportline DSG", equipmentPackage: "Sportline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TSI R DSG", equipmentPackage: "R", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "4x4" },
              { name: "2.0 TDI R-Line", equipmentPackage: "R-Line", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Beetle",
        generations: [
          {
            name: "Beetle",
            yearStart: 2012,
            yearEnd: 2019,
            trims: [
              { name: "1.2 TSI Design", equipmentPackage: "Design", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", drivetrain: "Önden Çekiş" },
              { name: "1.2 TSI Design DSG", equipmentPackage: "Design", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.2", drivetrain: "Önden Çekiş" },
              { name: "1.2 TSI Sport", equipmentPackage: "Sport", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI Design DSG", equipmentPackage: "Design", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI Sport DSG", equipmentPackage: "Sport", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "up!",
        generations: [
          {
            name: "up!",
            yearStart: 2011,
            trims: [
              { name: "1.0 MPI Take up!", equipmentPackage: "Take up!", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 MPI Move up!", equipmentPackage: "Move up!", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 MPI High up!", equipmentPackage: "High up!", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 MPI High up! ASG", equipmentPackage: "High up!", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      // ── SUV / Crossover ──
      {
        name: "T-Cross",
        generations: [
          {
            name: "T-Cross 1",
            yearStart: 2019,
            trims: [
              { name: "1.0 TSI Life", equipmentPackage: "Life", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 TSI Life DSG", equipmentPackage: "Life", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 TSI Style DSG", equipmentPackage: "Style", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 TSI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI Style DSG", equipmentPackage: "Style", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "T-Roc",
        generations: [
          {
            name: "T-Roc 1",
            yearStart: 2018,
            yearEnd: 2022,
            trims: [
              { name: "1.0 TSI Life", equipmentPackage: "Life", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 TSI Style", equipmentPackage: "Style", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI Style DSG", equipmentPackage: "Style", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "2.0 TSI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "4x4" },
              { name: "2.0 TDI Style DSG", equipmentPackage: "Style", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "4x4" },
            ],
          },
          {
            name: "T-Roc 2",
            yearStart: 2022,
            trims: [
              { name: "1.0 TSI Life", equipmentPackage: "Life", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI Style DSG", equipmentPackage: "Style", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Style DSG", equipmentPackage: "Style", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Taigo",
        generations: [
          {
            name: "Taigo 1",
            yearStart: 2021,
            trims: [
              { name: "1.0 TSI Life", equipmentPackage: "Life", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 TSI Life DSG", equipmentPackage: "Life", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 TSI Style DSG", equipmentPackage: "Style", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.0 TSI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI Style DSG", equipmentPackage: "Style", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Tiguan",
        generations: [
          {
            name: "Tiguan 1",
            yearStart: 2007,
            yearEnd: 2016,
            trims: [
              { name: "1.4 TSI Trendline", equipmentPackage: "Trendline", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI Highline DSG", equipmentPackage: "Highline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", drivetrain: "4x4" },
              { name: "2.0 TDI Trendline", equipmentPackage: "Trendline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "4x4" },
              { name: "2.0 TDI Highline DSG", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "4x4" },
            ],
          },
          {
            name: "Tiguan 2",
            yearStart: 2016,
            yearEnd: 2023,
            trims: [
              { name: "1.4 TSI Comfortline", equipmentPackage: "Comfortline", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI Life DSG", equipmentPackage: "Life", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI Elegance DSG", equipmentPackage: "Elegance", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI Allspace DSG", equipmentPackage: "Allspace", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "2.0 TSI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "4x4" },
              { name: "2.0 TDI Life DSG", equipmentPackage: "Life", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Elegance DSG", equipmentPackage: "Elegance", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "4x4" },
              { name: "2.0 TDI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "4x4" },
              { name: "2.0 TDI Allspace DSG", equipmentPackage: "Allspace", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "4x4" },
            ],
          },
          {
            name: "Tiguan 3",
            yearStart: 2023,
            trims: [
              { name: "1.5 TSI Life DSG", equipmentPackage: "Life", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI Elegance DSG", equipmentPackage: "Elegance", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Life DSG", equipmentPackage: "Life", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Elegance DSG", equipmentPackage: "Elegance", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "4x4" },
            ],
          },
        ],
      },
      {
        name: "Touareg",
        generations: [
          {
            name: "Touareg 3",
            yearStart: 2018,
            trims: [
              { name: "3.0 TDI Atmosphere DSG", equipmentPackage: "Atmosphere", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "3.0", drivetrain: "4x4" },
              { name: "3.0 TDI Elegance DSG", equipmentPackage: "Elegance", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "3.0", drivetrain: "4x4" },
              { name: "3.0 TDI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "3.0", drivetrain: "4x4" },
              { name: "3.0 TSI Atmosphere DSG", equipmentPackage: "Atmosphere", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "3.0", drivetrain: "4x4" },
              { name: "3.0 TSI Elegance DSG", equipmentPackage: "Elegance", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "3.0", drivetrain: "4x4" },
              { name: "3.0 TSI R-Line DSG", equipmentPackage: "R-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "3.0", drivetrain: "4x4" },
            ],
          },
        ],
      },
      {
        name: "ID.4",
        generations: [
          {
            name: "ID.4 1",
            yearStart: 2020,
            trims: [
              { name: "Elektrik Pro", equipmentPackage: "Pro", fuelType: "Elektrik", transmission: "Otomatik", drivetrain: "Arkadan İtiş" },
              { name: "Elektrik Pro Performance", equipmentPackage: "Pro Performance", fuelType: "Elektrik", transmission: "Otomatik", drivetrain: "Arkadan İtiş" },
              { name: "Elektrik GTX", equipmentPackage: "GTX", fuelType: "Elektrik", transmission: "Otomatik", drivetrain: "4x4" },
            ],
          },
        ],
      },
      {
        name: "ID.5",
        generations: [
          {
            name: "ID.5 1",
            yearStart: 2021,
            trims: [
              { name: "Elektrik Pro", equipmentPackage: "Pro", fuelType: "Elektrik", transmission: "Otomatik", drivetrain: "Arkadan İtiş" },
              { name: "Elektrik GTX", equipmentPackage: "GTX", fuelType: "Elektrik", transmission: "Otomatik", drivetrain: "4x4" },
            ],
          },
        ],
      },
      // ── Ticari / MPV ──
      {
        name: "Caddy",
        generations: [
          {
            name: "Caddy 4",
            yearStart: 2015,
            yearEnd: 2020,
            trims: [
              { name: "1.5 TSI Impression DSG", equipmentPackage: "Impression", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI Life DSG", equipmentPackage: "Life", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Impression", equipmentPackage: "Impression", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Impression DSG", equipmentPackage: "Impression", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Life DSG", equipmentPackage: "Life", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Maxi", equipmentPackage: "Maxi", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
            ],
          },
          {
            name: "Caddy 5",
            yearStart: 2020,
            trims: [
              { name: "1.5 TSI Style DSG", equipmentPackage: "Style", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI Life DSG", equipmentPackage: "Life", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Style", equipmentPackage: "Style", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Style DSG", equipmentPackage: "Style", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Life DSG", equipmentPackage: "Life", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Maxi DSG", equipmentPackage: "Maxi", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Transporter",
        generations: [
          {
            name: "Transporter T6",
            yearStart: 2015,
            yearEnd: 2019,
            trims: [
              { name: "2.0 TDI Trendline", equipmentPackage: "Trendline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Comfortline", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Highline DSG", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
            ],
          },
          {
            name: "Transporter T6.1",
            yearStart: 2019,
            trims: [
              { name: "2.0 TDI Trendline", equipmentPackage: "Trendline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Comfortline", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Highline DSG", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Caravelle",
        generations: [
          {
            name: "Caravelle T6",
            yearStart: 2015,
            yearEnd: 2019,
            trims: [
              { name: "2.0 TDI Trendline", equipmentPackage: "Trendline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Comfortline", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Highline DSG", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
            ],
          },
          {
            name: "Caravelle T6.1",
            yearStart: 2019,
            trims: [
              { name: "2.0 TDI Trendline", equipmentPackage: "Trendline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Comfortline", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Highline DSG", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Multivan",
        generations: [
          {
            name: "Multivan T6",
            yearStart: 2015,
            yearEnd: 2021,
            trims: [
              { name: "2.0 TDI Trendline", equipmentPackage: "Trendline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Comfortline", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Highline DSG", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
            ],
          },
          {
            name: "Multivan T7",
            yearStart: 2021,
            trims: [
              { name: "2.0 TDI Trendline", equipmentPackage: "Trendline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Highline DSG", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Amarok",
        generations: [
          {
            name: "Amarok 1",
            yearStart: 2010,
            yearEnd: 2022,
            trims: [
              { name: "2.0 TDI Trendline", equipmentPackage: "Trendline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "4x4" },
              { name: "2.0 TDI Comfortline", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "4x4" },
              { name: "2.0 TDI Highline DSG", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "4x4" },
              { name: "3.0 TDI Highline DSG", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "3.0", drivetrain: "4x4" },
              { name: "3.0 TDI Aventura DSG", equipmentPackage: "Aventura", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "3.0", drivetrain: "4x4" },
            ],
          },
          {
            name: "Amarok 2",
            yearStart: 2022,
            trims: [
              { name: "2.0 TDI Style", equipmentPackage: "Style", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", drivetrain: "4x4" },
              { name: "2.0 TDI Style DSG", equipmentPackage: "Style", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "4x4" },
              { name: "3.0 TDI Highline DSG", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "3.0", drivetrain: "4x4" },
              { name: "3.0 TDI Style DSG", equipmentPackage: "Style", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "3.0", drivetrain: "4x4" },
              { name: "3.0 TDI Aventura DSG", equipmentPackage: "Aventura", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "3.0", drivetrain: "4x4" },
            ],
          },
        ],
      },
      {
        name: "Touran",
        generations: [
          {
            name: "Touran 1",
            yearStart: 2003,
            yearEnd: 2015,
            trims: [
              { name: "1.6 TDI Comfortline", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "1.6 TDI Highline", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Highline DSG", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
            ],
          },
          {
            name: "Touran 2",
            yearStart: 2015,
            trims: [
              { name: "1.5 TSI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 TSI Highline DSG", equipmentPackage: "Highline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.6 TDI Comfortline", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "1.6 TDI Highline", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Highline DSG", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Sharan",
        generations: [
          {
            name: "Sharan 2",
            yearStart: 2010,
            yearEnd: 2022,
            trims: [
              { name: "1.4 TSI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "1.4 TSI Highline DSG", equipmentPackage: "Highline", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Comfortline DSG", equipmentPackage: "Comfortline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
              { name: "2.0 TDI Highline DSG", equipmentPackage: "Highline", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
    ],
  },
  // ── RENAULT ──────────────────────────────────────────────────────────────
  {
    name: "Renault",
    models: [
      {
        name: "Clio",
        generations: [
          {
            name: "Clio 4",
            yearStart: 2012,
            yearEnd: 2020,
            trims: [
              // Benzin
              { name: "1.2 16V Joy", equipmentPackage: "Joy", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "75 hp", drivetrain: "Önden Çekiş" },
              { name: "1.2 16V Touch", equipmentPackage: "Touch", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "75 hp", drivetrain: "Önden Çekiş" },
              { name: "0.9 TCe Joy", equipmentPackage: "Joy", fuelType: "Benzin", transmission: "Manuel", engineVolume: "0.9", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
              { name: "0.9 TCe Touch", equipmentPackage: "Touch", fuelType: "Benzin", transmission: "Manuel", engineVolume: "0.9", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
              { name: "0.9 TCe Icon", equipmentPackage: "Icon", fuelType: "Benzin", transmission: "Manuel", engineVolume: "0.9", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
              // Dizel
              { name: "1.5 dCi Joy", equipmentPackage: "Joy", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "75 hp", drivetrain: "Önden Çekiş" },
              { name: "1.5 dCi Touch", equipmentPackage: "Touch", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
              { name: "1.5 dCi Icon", equipmentPackage: "Icon", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
            ],
          },
          {
            name: "Clio 5",
            yearStart: 2020,
            trims: [
              // Benzin
              { name: "1.0 SCe Joy", equipmentPackage: "Joy", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "65 hp", drivetrain: "Önden Çekiş" },
              { name: "1.0 TCe Joy", equipmentPackage: "Joy", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
              { name: "1.0 TCe Touch", equipmentPackage: "Touch", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
              { name: "1.0 TCe Icon", equipmentPackage: "Icon", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
              { name: "1.0 TCe Icon EDC", equipmentPackage: "Icon", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
              // Dizel
              { name: "1.5 Blue dCi Joy", equipmentPackage: "Joy", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "85 hp", drivetrain: "Önden Çekiş" },
              { name: "1.5 Blue dCi Touch", equipmentPackage: "Touch", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "85 hp", drivetrain: "Önden Çekiş" },
              { name: "1.5 Blue dCi Icon", equipmentPackage: "Icon", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "85 hp", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Megane",
        generations: [
          {
            name: "Megane 3",
            yearStart: 2008,
            yearEnd: 2016,
            trims: [
              // Benzin – 1.6 16V Türkiye'de en çok satılan Megane 3 motorudur
              { name: "1.6 16V Joy", equipmentPackage: "Joy", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.6", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
              { name: "1.6 16V Touch", equipmentPackage: "Touch", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.6", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
              { name: "1.6 16V Icon", equipmentPackage: "Icon", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.6", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
              // Dizel
              { name: "1.5 dCi Joy", equipmentPackage: "Joy", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
              { name: "1.5 dCi Touch", equipmentPackage: "Touch", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
              { name: "1.5 dCi Icon", equipmentPackage: "Icon", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
            ],
          },
          {
            name: "Megane 4",
            yearStart: 2016,
            yearEnd: 2022,
            trims: [
              // Benzin
              { name: "1.3 TCe Touch", equipmentPackage: "Touch", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.3", enginePower: "115 hp", drivetrain: "Önden Çekiş" },
              { name: "1.3 TCe Icon EDC", equipmentPackage: "Icon", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.3", enginePower: "140 hp", drivetrain: "Önden Çekiş" },
              { name: "1.3 TCe Zen EDC", equipmentPackage: "Zen", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.3", enginePower: "140 hp", drivetrain: "Önden Çekiş" },
              // Dizel
              { name: "1.5 Blue dCi Joy", equipmentPackage: "Joy", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 Blue dCi Touch", equipmentPackage: "Touch", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "115 hp", drivetrain: "Önden Çekiş" },
              { name: "1.5 Blue dCi Icon", equipmentPackage: "Icon", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.7 Blue dCi Icon EDC", equipmentPackage: "Icon", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.7", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Captur",
        generations: [
          {
            name: "Captur 1",
            yearStart: 2013,
            yearEnd: 2019,
            trims: [
              { name: "0.9 TCe Joy", equipmentPackage: "Joy", fuelType: "Benzin", transmission: "Manuel", engineVolume: "0.9", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
              { name: "0.9 TCe Touch", equipmentPackage: "Touch", fuelType: "Benzin", transmission: "Manuel", engineVolume: "0.9", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
              { name: "0.9 TCe Icon", equipmentPackage: "Icon", fuelType: "Benzin", transmission: "Manuel", engineVolume: "0.9", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
              { name: "1.5 dCi Joy", equipmentPackage: "Joy", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
              { name: "1.5 dCi Touch", equipmentPackage: "Touch", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
              { name: "1.5 dCi Icon", equipmentPackage: "Icon", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
            ],
          },
          {
            name: "Captur 2",
            yearStart: 2019,
            trims: [
              { name: "1.0 TCe Joy", equipmentPackage: "Joy", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
              { name: "1.0 TCe Touch", equipmentPackage: "Touch", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
              { name: "1.0 TCe Icon", equipmentPackage: "Icon", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
              { name: "1.3 TCe Icon EDC", equipmentPackage: "Icon", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.3", enginePower: "130 hp", drivetrain: "Önden Çekiş" },
              { name: "1.5 Blue dCi Joy", equipmentPackage: "Joy", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 Blue dCi Touch", equipmentPackage: "Touch", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "115 hp", drivetrain: "Önden Çekiş" },
              { name: "1.5 Blue dCi Icon", equipmentPackage: "Icon", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Symbol",
        generations: [
          {
            name: "Symbol 3",
            yearStart: 2013,
            yearEnd: 2020,
            trims: [
              { name: "1.2 16V Joy", equipmentPackage: "Joy", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "75 hp", drivetrain: "Önden Çekiş" },
              { name: "1.2 16V Touch", equipmentPackage: "Touch", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "75 hp", drivetrain: "Önden Çekiş" },
              { name: "0.9 TCe Touch", equipmentPackage: "Touch", fuelType: "Benzin", transmission: "Manuel", engineVolume: "0.9", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
              { name: "0.9 TCe Icon", equipmentPackage: "Icon", fuelType: "Benzin", transmission: "Manuel", engineVolume: "0.9", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
              { name: "1.5 dCi Joy", equipmentPackage: "Joy", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
              { name: "1.5 dCi Touch", equipmentPackage: "Touch", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
              { name: "1.5 dCi Icon", equipmentPackage: "Icon", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Talisman",
        generations: [
          {
            name: "Talisman 1",
            yearStart: 2016,
            yearEnd: 2022,
            trims: [
              // Benzin
              { name: "1.6 TCe Touch", equipmentPackage: "Touch", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "1.3 TCe Icon EDC", equipmentPackage: "Icon", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.3", drivetrain: "Önden Çekiş" },
              // Dizel
              { name: "1.5 dCi Joy", equipmentPackage: "Joy", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.6 dCi Touch EDC", equipmentPackage: "Touch", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "1.6 dCi Icon EDC", equipmentPackage: "Icon", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
              { name: "1.6 dCi Zen EDC", equipmentPackage: "Zen", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.6", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Kadjar",
        generations: [
          {
            name: "Kadjar 1",
            yearStart: 2015,
            yearEnd: 2022,
            trims: [
              // Benzin
              { name: "1.3 TCe Joy", equipmentPackage: "Joy", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.3", drivetrain: "Önden Çekiş" },
              { name: "1.3 TCe Touch EDC", equipmentPackage: "Touch", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.3", drivetrain: "Önden Çekiş" },
              { name: "1.3 TCe Icon EDC", equipmentPackage: "Icon", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.3", drivetrain: "Önden Çekiş" },
              // Dizel
              { name: "1.5 dCi Joy", equipmentPackage: "Joy", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 dCi Touch", equipmentPackage: "Touch", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.5 dCi Icon", equipmentPackage: "Icon", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", drivetrain: "Önden Çekiş" },
              { name: "1.6 dCi 4WD EDC", equipmentPackage: "4WD", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.6", drivetrain: "4x4" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Toyota",
    models: [
      {
        name: "Corolla",
        generations: [
          {
            name: "Corolla E180",
            yearStart: 2013,
            yearEnd: 2019,
            trims: [
              {
                name: "1.4 D-4D Touch",
                equipmentPackage: "Touch",
                fuelType: "Dizel",
                transmission: "Manuel",
                engineVolume: "1.4",
                enginePower: "90 hp",
                drivetrain: "Önden Çekiş",
              },
              {
                name: "1.6 Comfort",
                equipmentPackage: "Comfort",
                fuelType: "Benzin",
                transmission: "Manuel",
                engineVolume: "1.6",
                enginePower: "132 hp",
                drivetrain: "Önden Çekiş",
              },
              {
                name: "1.6 Multidrive Advance",
                equipmentPackage: "Advance",
                fuelType: "Benzin",
                transmission: "Otomatik",
                engineVolume: "1.6",
                enginePower: "132 hp",
                drivetrain: "Önden Çekiş",
              },
            ],
          },
          {
            name: "Corolla E210",
            yearStart: 2019,
            trims: [
              {
                name: "1.5 Dream",
                equipmentPackage: "Dream",
                fuelType: "Benzin",
                transmission: "Manuel",
                engineVolume: "1.5",
                enginePower: "122 hp",
                drivetrain: "Önden Çekiş",
              },
              {
                name: "1.6 Vision",
                equipmentPackage: "Vision",
                fuelType: "Benzin",
                transmission: "Manuel",
                engineVolume: "1.6",
                enginePower: "132 hp",
                drivetrain: "Önden Çekiş",
              },
              {
                name: "1.8 Hybrid Flame",
                equipmentPackage: "Flame",
                fuelType: "Hibrit",
                transmission: "Otomatik",
                engineVolume: "1.8",
                enginePower: "122 hp",
                drivetrain: "Önden Çekiş",
              },
            ],
          },
        ],
      },
      {
        name: "Corolla Cross",
        generations: [
          {
            name: "Corolla Cross 1",
            yearStart: 2022,
            trims: [
              {
                name: "1.8 Hybrid Dream",
                equipmentPackage: "Dream",
                fuelType: "Hibrit",
                transmission: "Otomatik",
                engineVolume: "1.8",
                enginePower: "122 hp",
                drivetrain: "Önden Çekiş",
              },
              {
                name: "1.8 Hybrid Flame",
                equipmentPackage: "Flame",
                fuelType: "Hibrit",
                transmission: "Otomatik",
                engineVolume: "1.8",
                enginePower: "122 hp",
                drivetrain: "Önden Çekiş",
              },
              {
                name: "1.8 Hybrid Flame X-Pack",
                equipmentPackage: "Flame X-Pack",
                fuelType: "Hibrit",
                transmission: "Otomatik",
                engineVolume: "1.8",
                enginePower: "122 hp",
                drivetrain: "Önden Çekiş",
              },
            ],
          },
        ],
      },
      {
        name: "C-HR",
        generations: [
          {
            name: "C-HR 1",
            yearStart: 2016,
            yearEnd: 2023,
            trims: [
              {
                name: "1.2 Turbo Passion",
                equipmentPackage: "Passion",
                fuelType: "Benzin",
                transmission: "Manuel",
                engineVolume: "1.2",
                enginePower: "116 hp",
                drivetrain: "Önden Çekiş",
              },
              {
                name: "1.2 Turbo Dream",
                equipmentPackage: "Dream",
                fuelType: "Benzin",
                transmission: "Otomatik",
                engineVolume: "1.2",
                enginePower: "116 hp",
                drivetrain: "Önden Çekiş",
              },
              {
                name: "1.8 Hybrid Flame",
                equipmentPackage: "Flame",
                fuelType: "Hibrit",
                transmission: "Otomatik",
                engineVolume: "1.8",
                enginePower: "122 hp",
                drivetrain: "Önden Çekiş",
              },
            ],
          },
        ],
      },
      {
        name: "Yaris",
        generations: [
          {
            name: "Yaris XP130",
            yearStart: 2011,
            yearEnd: 2020,
            trims: [
              {
                name: "1.3 Live",
                equipmentPackage: "Live",
                fuelType: "Benzin",
                transmission: "Manuel",
                engineVolume: "1.3",
                enginePower: "99 hp",
                drivetrain: "Önden Çekiş",
              },
              {
                name: "1.4 D-4D Premium",
                equipmentPackage: "Premium",
                fuelType: "Dizel",
                transmission: "Manuel",
                engineVolume: "1.4",
                enginePower: "90 hp",
                drivetrain: "Önden Çekiş",
              },
            ],
          },
          {
            name: "Yaris XP210",
            yearStart: 2020,
            trims: [
              {
                name: "1.5 Dream",
                equipmentPackage: "Dream",
                fuelType: "Benzin",
                transmission: "Manuel",
                engineVolume: "1.5",
                enginePower: "125 hp",
                drivetrain: "Önden Çekiş",
              },
              {
                name: "1.5 Hybrid Passion",
                equipmentPackage: "Passion",
                fuelType: "Hibrit",
                transmission: "Otomatik",
                engineVolume: "1.5",
                enginePower: "116 hp",
                drivetrain: "Önden Çekiş",
              },
              {
                name: "1.5 Hybrid Flame",
                equipmentPackage: "Flame",
                fuelType: "Hibrit",
                transmission: "Otomatik",
                engineVolume: "1.5",
                enginePower: "116 hp",
                drivetrain: "Önden Çekiş",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Fiat",
    models: [
      {
        name: "Egea",
        generations: [
          {
            name: "Egea 1 (356)",
            yearStart: 2015,
            trims: [
              { name: "1.4 Fire Joy", equipmentPackage: "Joy", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", enginePower: "95 hp", drivetrain: "Önden Çekiş" },
              { name: "1.6 Multijet Urban", equipmentPackage: "Urban", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "120 hp", drivetrain: "Önden Çekiş" },
              { name: "1.0 Turbo Lounge", equipmentPackage: "Lounge", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Egea Cross",
        generations: [
          {
            name: "Egea Cross 1",
            yearStart: 2019,
            trims: [
              { name: "1.0 Turbo City Cross", equipmentPackage: "City Cross", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
              { name: "1.6 Multijet City Cross", equipmentPackage: "City Cross", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "120 hp", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Egea HB",
        generations: [
          {
            name: "Egea HB 1",
            yearStart: 2017,
            trims: [
              { name: "1.4 Fire Joy", equipmentPackage: "Joy", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", enginePower: "95 hp", drivetrain: "Önden Çekiş" },
              { name: "1.0 Turbo Urban", equipmentPackage: "Urban", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
            ],
          },
        ],
      },
      {
        name: "Doblo",
        generations: [
          { name: "Doblo 2 (263)", yearStart: 2010, yearEnd: 2021, trims: [
            { name: "1.3 Multijet Active", equipmentPackage: "Active", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.3", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 Multijet Dinamik", equipmentPackage: "Dinamik", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "105 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Doblo 3 (332)", yearStart: 2021, trims: [
            { name: "1.5 Dizel Standart", equipmentPackage: "Standart", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "102 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Punto",
        generations: [
          { name: "Punto Grande (199)", yearStart: 2005, yearEnd: 2018, trims: [
            { name: "1.4 Fire Active", equipmentPackage: "Active", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", enginePower: "77 hp", drivetrain: "Önden Çekiş" },
            { name: "1.3 Multijet Dynamic", equipmentPackage: "Dynamic", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.3", enginePower: "75 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "500",
        generations: [
          { name: "500 (312)", yearStart: 2007, trims: [
            { name: "1.2 Pop", equipmentPackage: "Pop", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "69 hp", drivetrain: "Önden Çekiş" },
            { name: "1.0 Hybrid Dolcevita", equipmentPackage: "Dolcevita", fuelType: "Hibrit", transmission: "Manuel", engineVolume: "1.0", enginePower: "70 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
    ],
  },
  {
    name: "Ford",
    models: [
      {
        name: "Focus",
        generations: [
          { name: "Focus 3 (C346)", yearStart: 2011, yearEnd: 2018, trims: [
            { name: "1.6 TDCi Trend", equipmentPackage: "Trend", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "115 hp", drivetrain: "Önden Çekiş" },
            { name: "1.0 EcoBoost Style", equipmentPackage: "Style", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "125 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 TDCi Titanium", equipmentPackage: "Titanium", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Focus 4 (DEH)", yearStart: 2018, trims: [
            { name: "1.5 EcoBlue Trend X", equipmentPackage: "Trend X", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "120 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 EcoBoost ST-Line", equipmentPackage: "ST-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", enginePower: "182 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Fiesta",
        generations: [
          { name: "Fiesta 6 (JA8)", yearStart: 2008, yearEnd: 2017, trims: [
            { name: "1.25 Trend", equipmentPackage: "Trend", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.25", enginePower: "82 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 TDCi Titanium", equipmentPackage: "Titanium", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "85 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Fiesta 7 (CJZ)", yearStart: 2017, yearEnd: 2023, trims: [
            { name: "1.0 EcoBoost Trend", equipmentPackage: "Trend", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "95 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 EcoBlue Titanium", equipmentPackage: "Titanium", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "85 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Kuga",
        generations: [
          { name: "Kuga 2 (CBS)", yearStart: 2012, yearEnd: 2019, trims: [
            { name: "1.5 EcoBoost Trend", equipmentPackage: "Trend", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.5", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 TDCi Titanium 4x4", equipmentPackage: "Titanium", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "180 hp", drivetrain: "4x4" },
          ]},
          { name: "Kuga 3 (CX4)", yearStart: 2019, trims: [
            { name: "1.5 EcoBlue Trend X", equipmentPackage: "Trend X", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "120 hp", drivetrain: "Önden Çekiş" },
            { name: "2.5 PHEV ST-Line X", equipmentPackage: "ST-Line X", fuelType: "Benzin & Elektrik (Plug-in Hibrit)", transmission: "CVT", engineVolume: "2.5", enginePower: "225 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "Puma",
        generations: [
          { name: "Puma 1 (CEJ)", yearStart: 2019, trims: [
            { name: "1.0 EcoBoost Trend", equipmentPackage: "Trend", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "125 hp", drivetrain: "Önden Çekiş" },
            { name: "1.0 EcoBoost ST-Line", equipmentPackage: "ST-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", enginePower: "155 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "EcoSport",
        generations: [
          { name: "EcoSport 2 (JK8)", yearStart: 2017, yearEnd: 2022, trims: [
            { name: "1.0 EcoBoost Trend", equipmentPackage: "Trend", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "125 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 TDCi Titanium", equipmentPackage: "Titanium", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
    ],
  },
  {
    name: "Opel",
    models: [
      {
        name: "Astra",
        generations: [
          { name: "Astra J (P10)", yearStart: 2009, yearEnd: 2015, trims: [
            { name: "1.4 Turbo Enjoy", equipmentPackage: "Enjoy", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", enginePower: "140 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 CDTi Design", equipmentPackage: "Design", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "136 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Astra K (B16)", yearStart: 2015, yearEnd: 2021, trims: [
            { name: "1.4 Turbo Innovation", equipmentPackage: "Innovation", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 CDTi Dynamic", equipmentPackage: "Dynamic", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "136 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Astra L (OPC)", yearStart: 2021, trims: [
            { name: "1.2 Turbo Edition", equipmentPackage: "Edition", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "130 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 CDTi GS Line", equipmentPackage: "GS Line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.5", enginePower: "130 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Corsa",
        generations: [
          { name: "Corsa D (S07)", yearStart: 2006, yearEnd: 2014, trims: [
            { name: "1.2 Twinport Enjoy", equipmentPackage: "Enjoy", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "80 hp", drivetrain: "Önden Çekiş" },
            { name: "1.3 CDTi Essentia", equipmentPackage: "Essentia", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.3", enginePower: "75 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Corsa E (X15)", yearStart: 2014, yearEnd: 2019, trims: [
            { name: "1.4 Enjoy", equipmentPackage: "Enjoy", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
            { name: "1.3 CDTi Innovation", equipmentPackage: "Innovation", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.3", enginePower: "95 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Corsa F (MK7)", yearStart: 2019, trims: [
            { name: "1.2 Turbo Edition", equipmentPackage: "Edition", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 CDTi GS Line", equipmentPackage: "GS Line", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "102 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Mokka",
        generations: [
          { name: "Mokka A (J13)", yearStart: 2012, yearEnd: 2020, trims: [
            { name: "1.4 Turbo Enjoy", equipmentPackage: "Enjoy", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", enginePower: "140 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 CDTi Excellence 4x4", equipmentPackage: "Excellence", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.6", enginePower: "136 hp", drivetrain: "4x4" },
          ]},
          { name: "Mokka B (MK2)", yearStart: 2020, trims: [
            { name: "1.2 Turbo Edition", equipmentPackage: "Edition", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.2", enginePower: "130 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 CDTi GS Line", equipmentPackage: "GS Line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.5", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Insignia",
        generations: [
          { name: "Insignia A (G09)", yearStart: 2008, yearEnd: 2017, trims: [
            { name: "1.6 Turbo Design", equipmentPackage: "Design", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.6", enginePower: "170 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 CDTi Excellence", equipmentPackage: "Excellence", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "163 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Insignia B (Z18)", yearStart: 2017, trims: [
            { name: "1.5 Turbo Innovation", equipmentPackage: "Innovation", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.5", enginePower: "140 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 CDTi Elite", equipmentPackage: "Elite", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "170 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
    ],
  },
  {
    name: "Peugeot",
    models: [
      {
        name: "208",
        generations: [
          { name: "208 1 (A9)", yearStart: 2012, yearEnd: 2019, trims: [
            { name: "1.2 PureTech Active", equipmentPackage: "Active", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "82 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 BlueHDi Allure", equipmentPackage: "Allure", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "208 2 (UB3)", yearStart: 2019, trims: [
            { name: "1.2 PureTech Active Pack", equipmentPackage: "Active Pack", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 BlueHDi Allure", equipmentPackage: "Allure", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "308",
        generations: [
          { name: "308 2 (T9)", yearStart: 2013, yearEnd: 2021, trims: [
            { name: "1.2 PureTech Active", equipmentPackage: "Active", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 BlueHDi Allure", equipmentPackage: "Allure", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.5", enginePower: "130 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "308 3 (P51)", yearStart: 2021, trims: [
            { name: "1.2 PureTech Allure", equipmentPackage: "Allure", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.2", enginePower: "130 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 BlueHDi GT", equipmentPackage: "GT", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.5", enginePower: "130 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "301",
        generations: [
          { name: "301 1 (M59)", yearStart: 2012, yearEnd: 2017, trims: [
            { name: "1.2 PureTech Access", equipmentPackage: "Access", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "82 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 BlueHDi Active", equipmentPackage: "Active", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "301 2 (M59 FL)", yearStart: 2017, trims: [
            { name: "1.2 PureTech Active", equipmentPackage: "Active", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "82 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 BlueHDi Allure", equipmentPackage: "Allure", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "102 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "2008",
        generations: [
          { name: "2008 1 (A94)", yearStart: 2013, yearEnd: 2019, trims: [
            { name: "1.2 PureTech Active", equipmentPackage: "Active", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 BlueHDi Allure", equipmentPackage: "Allure", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "2008 2 (P24)", yearStart: 2019, trims: [
            { name: "1.2 PureTech Active Pack", equipmentPackage: "Active Pack", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.2", enginePower: "130 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 BlueHDi Allure", equipmentPackage: "Allure", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.5", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "3008",
        generations: [
          { name: "3008 2 (P84)", yearStart: 2016, yearEnd: 2021, trims: [
            { name: "1.2 PureTech Allure", equipmentPackage: "Allure", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.2", enginePower: "130 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 BlueHDi GT Line", equipmentPackage: "GT Line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.5", enginePower: "130 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "3008 3 (P84 FL)", yearStart: 2021, trims: [
            { name: "1.2 PureTech GT", equipmentPackage: "GT", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.2", enginePower: "130 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
    ],
  },
  {
    name: "Hyundai",
    models: [
      {
        name: "i20",
        generations: [
          { name: "i20 2 (GB)", yearStart: 2014, yearEnd: 2020, trims: [
            { name: "1.2 MPI Style", equipmentPackage: "Style", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "84 hp", drivetrain: "Önden Çekiş" },
            { name: "1.4 CRDi Elite", equipmentPackage: "Elite", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.4", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "i20 3 (BC3)", yearStart: 2020, trims: [
            { name: "1.0 T-GDI Jump", equipmentPackage: "Jump", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
            { name: "1.0 T-GDI Elite", equipmentPackage: "Elite", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", enginePower: "120 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "i30",
        generations: [
          { name: "i30 2 (GD)", yearStart: 2012, yearEnd: 2017, trims: [
            { name: "1.4 MPI Style", equipmentPackage: "Style", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 CRDi Elite", equipmentPackage: "Elite", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "i30 3 (PD)", yearStart: 2017, trims: [
            { name: "1.0 T-GDI Style", equipmentPackage: "Style", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "120 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 CRDi Elite", equipmentPackage: "Elite", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.5", enginePower: "116 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Tucson",
        generations: [
          { name: "Tucson 3 (TL)", yearStart: 2015, yearEnd: 2020, trims: [
            { name: "1.6 GDI Style", equipmentPackage: "Style", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.6", enginePower: "132 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 CRDi Elite 4x4", equipmentPackage: "Elite", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "185 hp", drivetrain: "4x4" },
          ]},
          { name: "Tucson 4 (NX4)", yearStart: 2020, trims: [
            { name: "1.6 T-GDI Advance", equipmentPackage: "Advance", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.6", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 CRDi Elite 4x4", equipmentPackage: "Elite", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.6", enginePower: "136 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "Elantra",
        generations: [
          { name: "Elantra 6 (AD)", yearStart: 2015, yearEnd: 2020, trims: [
            { name: "1.6 MPI Style", equipmentPackage: "Style", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.6", enginePower: "128 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 CRDi Elite", equipmentPackage: "Elite", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.6", enginePower: "136 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Elantra 7 (CN7)", yearStart: 2020, trims: [
            { name: "1.6 MPI Style", equipmentPackage: "Style", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.6", enginePower: "128 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Bayon",
        generations: [
          { name: "Bayon 1 (BC3)", yearStart: 2021, trims: [
            { name: "1.0 T-GDI Jump", equipmentPackage: "Jump", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
            { name: "1.0 T-GDI Elite", equipmentPackage: "Elite", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", enginePower: "120 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
    ],
  },
  {
    name: "Honda",
    models: [
      {
        name: "Civic",
        generations: [
          { name: "Civic 9 (FB7)", yearStart: 2011, yearEnd: 2016, trims: [
            { name: "1.6 i-DTEC Comfort", equipmentPackage: "Comfort", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "120 hp", drivetrain: "Önden Çekiş" },
            { name: "1.8 i-VTEC Premium", equipmentPackage: "Premium", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.8", enginePower: "142 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Civic 10 (FC7)", yearStart: 2016, yearEnd: 2021, trims: [
            { name: "1.6 i-DTEC Comfort", equipmentPackage: "Comfort", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "120 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 VTEC Turbo Executive", equipmentPackage: "Executive", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", enginePower: "182 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Civic 11 (FE7)", yearStart: 2021, trims: [
            { name: "1.5 VTEC Turbo Comfort", equipmentPackage: "Comfort", fuelType: "Benzin", transmission: "CVT", engineVolume: "1.5", enginePower: "182 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 e:HEV Elegance", equipmentPackage: "Elegance", fuelType: "Hibrit", transmission: "CVT", engineVolume: "2.0", enginePower: "143 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Jazz",
        generations: [
          { name: "Jazz 3 (GE)", yearStart: 2015, yearEnd: 2020, trims: [
            { name: "1.3 i-VTEC Comfort", equipmentPackage: "Comfort", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.3", enginePower: "102 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Jazz 4 (GR9)", yearStart: 2020, trims: [
            { name: "1.5 e:HEV Comfort", equipmentPackage: "Comfort", fuelType: "Hibrit", transmission: "CVT", engineVolume: "1.5", enginePower: "109 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 e:HEV Elegance", equipmentPackage: "Elegance", fuelType: "Hibrit", transmission: "CVT", engineVolume: "1.5", enginePower: "109 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "CR-V",
        generations: [
          { name: "CR-V 4 (RM)", yearStart: 2012, yearEnd: 2016, trims: [
            { name: "1.6 i-DTEC Comfort 4x4", equipmentPackage: "Comfort", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "120 hp", drivetrain: "4x4" },
            { name: "2.0 i-VTEC Executive", equipmentPackage: "Executive", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "155 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "CR-V 5 (RW)", yearStart: 2016, yearEnd: 2022, trims: [
            { name: "1.5 VTEC Turbo Comfort", equipmentPackage: "Comfort", fuelType: "Benzin", transmission: "CVT", engineVolume: "1.5", enginePower: "173 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 i-MMD Executive 4x4", equipmentPackage: "Executive", fuelType: "Hibrit", transmission: "CVT", engineVolume: "2.0", enginePower: "184 hp", drivetrain: "4x4" },
          ]},
        ],
      },
    ],
  },
  {
    name: "Mercedes-Benz",
    models: [
      {
        name: "A Serisi",
        generations: [
          { name: "A Serisi W176", yearStart: 2012, yearEnd: 2018, trims: [
            { name: "A 180 d Urban", equipmentPackage: "Urban", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "109 hp", drivetrain: "Önden Çekiş" },
            { name: "A 200 Style", equipmentPackage: "Style", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.6", enginePower: "156 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "A Serisi W177", yearStart: 2018, trims: [
            { name: "A 180 d Progressive", equipmentPackage: "Progressive", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.5", enginePower: "116 hp", drivetrain: "Önden Çekiş" },
            { name: "A 200 AMG Line", equipmentPackage: "AMG Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.3", enginePower: "163 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "C Serisi",
        generations: [
          { name: "C Serisi W204", yearStart: 2007, yearEnd: 2014, trims: [
            { name: "C 180 Avantgarde", equipmentPackage: "Avantgarde", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.6", enginePower: "156 hp", drivetrain: "Arkadan İtiş" },
            { name: "C 200 CDI Elegance", equipmentPackage: "Elegance", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.1", enginePower: "136 hp", drivetrain: "Arkadan İtiş" },
          ]},
          { name: "C Serisi W205", yearStart: 2014, yearEnd: 2021, trims: [
            { name: "C 180 Avantgarde", equipmentPackage: "Avantgarde", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.6", enginePower: "156 hp", drivetrain: "Arkadan İtiş" },
            { name: "C 220 d AMG Line", equipmentPackage: "AMG Line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "194 hp", drivetrain: "Arkadan İtiş" },
          ]},
          { name: "C Serisi W206", yearStart: 2021, trims: [
            { name: "C 200 Avantgarde", equipmentPackage: "Avantgarde", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", enginePower: "204 hp", drivetrain: "Arkadan İtiş" },
            { name: "C 220 d AMG Line", equipmentPackage: "AMG Line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "200 hp", drivetrain: "Arkadan İtiş" },
          ]},
        ],
      },
      {
        name: "E Serisi",
        generations: [
          { name: "E Serisi W212", yearStart: 2009, yearEnd: 2016, trims: [
            { name: "E 180 Avantgarde", equipmentPackage: "Avantgarde", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.6", enginePower: "122 hp", drivetrain: "Arkadan İtiş" },
            { name: "E 220 d Elegance", equipmentPackage: "Elegance", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.1", enginePower: "170 hp", drivetrain: "Arkadan İtiş" },
          ]},
          { name: "E Serisi W213", yearStart: 2016, trims: [
            { name: "E 200 Avantgarde", equipmentPackage: "Avantgarde", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "197 hp", drivetrain: "Arkadan İtiş" },
            { name: "E 220 d AMG Line", equipmentPackage: "AMG Line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "194 hp", drivetrain: "Arkadan İtiş" },
          ]},
        ],
      },
      {
        name: "GLA",
        generations: [
          { name: "GLA X156", yearStart: 2013, yearEnd: 2019, trims: [
            { name: "GLA 180 Urban", equipmentPackage: "Urban", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.6", enginePower: "122 hp", drivetrain: "Önden Çekiş" },
            { name: "GLA 200 d AMG Line", equipmentPackage: "AMG Line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.1", enginePower: "136 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "GLA X247", yearStart: 2019, trims: [
            { name: "GLA 200 Progressive", equipmentPackage: "Progressive", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.3", enginePower: "163 hp", drivetrain: "Önden Çekiş" },
            { name: "GLA 220 d AMG Line 4Matic", equipmentPackage: "AMG Line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "190 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "GLC",
        generations: [
          { name: "GLC X253", yearStart: 2015, yearEnd: 2022, trims: [
            { name: "GLC 220 d Avantgarde", equipmentPackage: "Avantgarde", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "194 hp", drivetrain: "4x4" },
            { name: "GLC 300 AMG Line", equipmentPackage: "AMG Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "258 hp", drivetrain: "4x4" },
          ]},
          { name: "GLC X254", yearStart: 2022, trims: [
            { name: "GLC 220 d Avantgarde", equipmentPackage: "Avantgarde", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "197 hp", drivetrain: "4x4" },
          ]},
        ],
      },
    ],
  },
  {
    name: "BMW",
    models: [
      {
        name: "1 Serisi",
        generations: [
          { name: "1 Serisi F20", yearStart: 2011, yearEnd: 2019, trims: [
            { name: "116i Advantage", equipmentPackage: "Advantage", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.5", enginePower: "109 hp", drivetrain: "Arkadan İtiş" },
            { name: "116d Sport Line", equipmentPackage: "Sport Line", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "116 hp", drivetrain: "Arkadan İtiş" },
            { name: "120i M Sport", equipmentPackage: "M Sport", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "184 hp", drivetrain: "Arkadan İtiş" },
          ]},
          { name: "1 Serisi F40", yearStart: 2019, trims: [
            { name: "116i Advantage", equipmentPackage: "Advantage", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.5", enginePower: "109 hp", drivetrain: "Önden Çekiş" },
            { name: "118i M Sport", equipmentPackage: "M Sport", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", enginePower: "140 hp", drivetrain: "Önden Çekiş" },
            { name: "118d M Sport", equipmentPackage: "M Sport", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "3 Serisi",
        generations: [
          { name: "3 Serisi E90/E91", yearStart: 2005, yearEnd: 2012, trims: [
            { name: "320i Standart", equipmentPackage: "Standart", fuelType: "Benzin", transmission: "Manuel", engineVolume: "2.0", enginePower: "170 hp", drivetrain: "Arkadan İtiş" },
            { name: "320d Otomatik", equipmentPackage: "Comfort", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "163 hp", drivetrain: "Arkadan İtiş" },
          ]},
          { name: "3 Serisi F30", yearStart: 2012, yearEnd: 2018, trims: [
            { name: "316i Advantage", equipmentPackage: "Advantage", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.6", enginePower: "136 hp", drivetrain: "Arkadan İtiş" },
            { name: "318d Sport Line", equipmentPackage: "Sport Line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "143 hp", drivetrain: "Arkadan İtiş" },
            { name: "320d M Sport", equipmentPackage: "M Sport", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "190 hp", drivetrain: "Arkadan İtiş" },
          ]},
          { name: "3 Serisi G20", yearStart: 2018, trims: [
            { name: "318i M Sport", equipmentPackage: "M Sport", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", enginePower: "136 hp", drivetrain: "Arkadan İtiş" },
            { name: "320d xDrive M Sport", equipmentPackage: "M Sport", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "190 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "5 Serisi",
        generations: [
          { name: "5 Serisi F10", yearStart: 2010, yearEnd: 2016, trims: [
            { name: "520i Standart", equipmentPackage: "Standart", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "184 hp", drivetrain: "Arkadan İtiş" },
            { name: "520d Luxury Line", equipmentPackage: "Luxury Line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "184 hp", drivetrain: "Arkadan İtiş" },
          ]},
          { name: "5 Serisi G30", yearStart: 2016, trims: [
            { name: "520i M Sport", equipmentPackage: "M Sport", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "184 hp", drivetrain: "Arkadan İtiş" },
            { name: "520d xDrive M Sport", equipmentPackage: "M Sport", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "190 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "X1",
        generations: [
          { name: "X1 F48", yearStart: 2015, yearEnd: 2022, trims: [
            { name: "sDrive18i Advantage", equipmentPackage: "Advantage", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", enginePower: "140 hp", drivetrain: "Önden Çekiş" },
            { name: "xDrive20d M Sport", equipmentPackage: "M Sport", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "190 hp", drivetrain: "4x4" },
          ]},
          { name: "X1 U11", yearStart: 2022, trims: [
            { name: "sDrive18i M Sport", equipmentPackage: "M Sport", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", enginePower: "136 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "X3",
        generations: [
          { name: "X3 F25", yearStart: 2010, yearEnd: 2017, trims: [
            { name: "xDrive20i Standart", equipmentPackage: "Standart", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "184 hp", drivetrain: "4x4" },
            { name: "xDrive20d xLine", equipmentPackage: "xLine", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "190 hp", drivetrain: "4x4" },
          ]},
          { name: "X3 G01", yearStart: 2017, trims: [
            { name: "xDrive20i M Sport", equipmentPackage: "M Sport", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "184 hp", drivetrain: "4x4" },
            { name: "xDrive20d M Sport", equipmentPackage: "M Sport", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "190 hp", drivetrain: "4x4" },
          ]},
        ],
      },
    ],
  },
  {
    name: "Audi",
    models: [
      {
        name: "A3",
        generations: [
          { name: "A3 8P", yearStart: 2003, yearEnd: 2012, trims: [
            { name: "1.6 FSI Attraction", equipmentPackage: "Attraction", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.6", enginePower: "102 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 TDI Ambition", equipmentPackage: "Ambition", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.0", enginePower: "140 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "A3 8V", yearStart: 2012, yearEnd: 2020, trims: [
            { name: "1.4 TFSI Design", equipmentPackage: "Design", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 TDI S line", equipmentPackage: "S line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "A3 8Y", yearStart: 2020, trims: [
            { name: "1.0 TFSI Advanced", equipmentPackage: "Advanced", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 TDI S line", equipmentPackage: "S line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "A4",
        generations: [
          { name: "A4 B8", yearStart: 2007, yearEnd: 2015, trims: [
            { name: "1.8 TFSI Attraction", equipmentPackage: "Attraction", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.8", enginePower: "160 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 TDI Ambition", equipmentPackage: "Ambition", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "143 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "A4 B9", yearStart: 2015, trims: [
            { name: "1.4 TFSI Design", equipmentPackage: "Design", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 TDI quattro S line", equipmentPackage: "S line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "190 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "A6",
        generations: [
          { name: "A6 C7", yearStart: 2011, yearEnd: 2018, trims: [
            { name: "2.0 TFSI Business", equipmentPackage: "Business", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "180 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 TDI S line", equipmentPackage: "S line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "177 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "A6 C8", yearStart: 2018, trims: [
            { name: "2.0 TFSI Business", equipmentPackage: "Business", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "204 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 TDI quattro S line", equipmentPackage: "S line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "204 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "Q3",
        generations: [
          { name: "Q3 8U", yearStart: 2011, yearEnd: 2018, trims: [
            { name: "1.4 TFSI Design", equipmentPackage: "Design", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 TDI quattro S line", equipmentPackage: "S line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "150 hp", drivetrain: "4x4" },
          ]},
          { name: "Q3 F3", yearStart: 2018, trims: [
            { name: "1.5 TFSI Advanced", equipmentPackage: "Advanced", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 TDI quattro S line", equipmentPackage: "S line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "150 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "Q5",
        generations: [
          { name: "Q5 8R", yearStart: 2008, yearEnd: 2016, trims: [
            { name: "2.0 TFSI quattro S line", equipmentPackage: "S line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "211 hp", drivetrain: "4x4" },
            { name: "2.0 TDI quattro Design", equipmentPackage: "Design", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "190 hp", drivetrain: "4x4" },
          ]},
          { name: "Q5 FY", yearStart: 2016, trims: [
            { name: "2.0 TFSI quattro Advanced", equipmentPackage: "Advanced", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "252 hp", drivetrain: "4x4" },
            { name: "2.0 TDI quattro S line", equipmentPackage: "S line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "204 hp", drivetrain: "4x4" },
          ]},
        ],
      },
    ],
  },
  {
    name: "Citroën",
    models: [
      {
        name: "C3",
        generations: [
          { name: "C3 2 (SC)", yearStart: 2009, yearEnd: 2016, trims: [
            { name: "1.2 PureTech Attraction", equipmentPackage: "Attraction", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "82 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 BlueHDi Exclusive", equipmentPackage: "Exclusive", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "C3 3 (SX)", yearStart: 2016, trims: [
            { name: "1.2 PureTech Live", equipmentPackage: "Live", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "83 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 BlueHDi Shine", equipmentPackage: "Shine", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "102 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "C4",
        generations: [
          { name: "C4 2 (B7)", yearStart: 2010, yearEnd: 2018, trims: [
            { name: "1.2 PureTech Attraction", equipmentPackage: "Attraction", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 BlueHDi Exclusive", equipmentPackage: "Exclusive", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "120 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "C4 3 (B41)", yearStart: 2020, trims: [
            { name: "1.2 PureTech Live", equipmentPackage: "Live", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.2", enginePower: "130 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 BlueHDi Shine", equipmentPackage: "Shine", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.5", enginePower: "130 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "C-Elysée",
        generations: [
          { name: "C-Elysée 1 (DD)", yearStart: 2012, yearEnd: 2018, trims: [
            { name: "1.2 PureTech Attraction", equipmentPackage: "Attraction", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "82 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 BlueHDi Exclusive", equipmentPackage: "Exclusive", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "92 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "C-Elysée 2 (DD FL)", yearStart: 2018, trims: [
            { name: "1.2 PureTech Shine", equipmentPackage: "Shine", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "C3 Aircross",
        generations: [
          { name: "C3 Aircross 1 (UA)", yearStart: 2017, trims: [
            { name: "1.2 PureTech Live", equipmentPackage: "Live", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 BlueHDi Shine", equipmentPackage: "Shine", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "102 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
    ],
  },
  {
    name: "Dacia",
    models: [
      {
        name: "Sandero",
        generations: [
          { name: "Sandero 2 (B52)", yearStart: 2012, yearEnd: 2020, trims: [
            { name: "0.9 TCe Ambiance", equipmentPackage: "Ambiance", fuelType: "Benzin", transmission: "Manuel", engineVolume: "0.9", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 dCi Laureate", equipmentPackage: "Laureate", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Sandero 3 (BJI)", yearStart: 2020, trims: [
            { name: "1.0 TCe Essential", equipmentPackage: "Essential", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
            { name: "1.0 TCe Expression", equipmentPackage: "Expression", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Duster",
        generations: [
          { name: "Duster 1 (HS)", yearStart: 2010, yearEnd: 2017, trims: [
            { name: "1.6 SCe Ambiance", equipmentPackage: "Ambiance", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.6", enginePower: "105 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 dCi Laureate 4x4", equipmentPackage: "Laureate", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "110 hp", drivetrain: "4x4" },
          ]},
          { name: "Duster 2 (HM)", yearStart: 2017, trims: [
            { name: "1.0 TCe Essential", equipmentPackage: "Essential", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
            { name: "1.3 TCe Prestige 4x4", equipmentPackage: "Prestige", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.3", enginePower: "130 hp", drivetrain: "4x4" },
            { name: "1.5 Blue dCi Adventure", equipmentPackage: "Adventure", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "115 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "Logan",
        generations: [
          { name: "Logan 2 (LS)", yearStart: 2012, yearEnd: 2020, trims: [
            { name: "0.9 TCe Ambiance", equipmentPackage: "Ambiance", fuelType: "Benzin", transmission: "Manuel", engineVolume: "0.9", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 dCi Laureate", equipmentPackage: "Laureate", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Logan 3 (LJL)", yearStart: 2020, trims: [
            { name: "1.0 SCe Essential", equipmentPackage: "Essential", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "65 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Jogger",
        generations: [
          { name: "Jogger 1 (JSK)", yearStart: 2021, trims: [
            { name: "1.0 TCe Essential", equipmentPackage: "Essential", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
            { name: "1.0 TCe Expression", equipmentPackage: "Expression", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
    ],
  },
  {
    name: "Nissan",
    models: [
      {
        name: "Qashqai",
        generations: [
          { name: "Qashqai J11", yearStart: 2013, yearEnd: 2021, trims: [
            { name: "1.2 DIG-T Visia", equipmentPackage: "Visia", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "115 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 dCi Tekna", equipmentPackage: "Tekna", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 dCi 4x4 Tekna", equipmentPackage: "Tekna", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.6", enginePower: "130 hp", drivetrain: "4x4" },
          ]},
          { name: "Qashqai J12", yearStart: 2021, trims: [
            { name: "1.3 DIG-T Visia", equipmentPackage: "Visia", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.3", enginePower: "140 hp", drivetrain: "Önden Çekiş" },
            { name: "1.3 DIG-T Tekna+", equipmentPackage: "Tekna+", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.3", enginePower: "158 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Micra",
        generations: [
          { name: "Micra K13", yearStart: 2010, yearEnd: 2016, trims: [
            { name: "1.2 Visia", equipmentPackage: "Visia", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "80 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Micra K14", yearStart: 2016, trims: [
            { name: "1.0 IG-T Visia", equipmentPackage: "Visia", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
            { name: "1.0 IG-T Tekna", equipmentPackage: "Tekna", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Juke",
        generations: [
          { name: "Juke 1 (F15)", yearStart: 2010, yearEnd: 2019, trims: [
            { name: "1.6 Visia", equipmentPackage: "Visia", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.6", enginePower: "117 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 dCi Tekna", equipmentPackage: "Tekna", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Juke 2 (F16)", yearStart: 2019, trims: [
            { name: "1.0 DIG-T Visia", equipmentPackage: "Visia", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "114 hp", drivetrain: "Önden Çekiş" },
            { name: "1.0 DIG-T Tekna+", equipmentPackage: "Tekna+", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", enginePower: "114 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "X-Trail",
        generations: [
          { name: "X-Trail T31", yearStart: 2007, yearEnd: 2014, trims: [
            { name: "2.0 Visia 4x4", equipmentPackage: "Visia", fuelType: "Benzin", transmission: "Manuel", engineVolume: "2.0", enginePower: "140 hp", drivetrain: "4x4" },
            { name: "2.0 dCi Tekna 4x4", equipmentPackage: "Tekna", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "173 hp", drivetrain: "4x4" },
          ]},
          { name: "X-Trail T32", yearStart: 2014, yearEnd: 2022, trims: [
            { name: "1.6 DIG-T Visia", equipmentPackage: "Visia", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.6", enginePower: "163 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 dCi Tekna 4x4", equipmentPackage: "Tekna", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.6", enginePower: "130 hp", drivetrain: "4x4" },
          ]},
        ],
      },
    ],
  },
  {
    name: "Kia",
    models: [
      {
        name: "Ceed",
        generations: [
          { name: "Ceed 2 (JD)", yearStart: 2012, yearEnd: 2018, trims: [
            { name: "1.4 MPI Comfort", equipmentPackage: "Comfort", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 CRDi Spirit", equipmentPackage: "Spirit", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "128 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Ceed 3 (CD)", yearStart: 2018, trims: [
            { name: "1.0 T-GDI Comfort", equipmentPackage: "Comfort", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "120 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 CRDi Spirit", equipmentPackage: "Spirit", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.5", enginePower: "136 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Sportage",
        generations: [
          { name: "Sportage 3 (SL)", yearStart: 2010, yearEnd: 2015, trims: [
            { name: "1.6 GDI Comfort", equipmentPackage: "Comfort", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.6", enginePower: "135 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 CRDi 4x4 Spirit", equipmentPackage: "Spirit", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "184 hp", drivetrain: "4x4" },
          ]},
          { name: "Sportage 4 (QL)", yearStart: 2015, yearEnd: 2021, trims: [
            { name: "1.6 T-GDI Comfort", equipmentPackage: "Comfort", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.6", enginePower: "177 hp", drivetrain: "Önden Çekiş" },
            { name: "1.7 CRDi Spirit", equipmentPackage: "Spirit", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.7", enginePower: "115 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Sportage 5 (NQ5)", yearStart: 2021, trims: [
            { name: "1.6 T-GDI Comfort", equipmentPackage: "Comfort", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.6", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Rio",
        generations: [
          { name: "Rio 3 (UB)", yearStart: 2011, yearEnd: 2017, trims: [
            { name: "1.2 MPI Comfort", equipmentPackage: "Comfort", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "84 hp", drivetrain: "Önden Çekiş" },
            { name: "1.4 CRDi Spirit", equipmentPackage: "Spirit", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.4", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Rio 4 (YB)", yearStart: 2017, trims: [
            { name: "1.0 T-GDI Concept", equipmentPackage: "Concept", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
            { name: "1.4 MPI Spirit", equipmentPackage: "Spirit", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Stonic",
        generations: [
          { name: "Stonic 1 (YB)", yearStart: 2017, trims: [
            { name: "1.0 T-GDI Comfort", equipmentPackage: "Comfort", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "120 hp", drivetrain: "Önden Çekiş" },
            { name: "1.0 T-GDI Spirit", equipmentPackage: "Spirit", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", enginePower: "120 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
    ],
  },
  {
    name: "Seat",
    models: [
      {
        name: "Leon",
        generations: [
          { name: "Leon 3 (5F)", yearStart: 2012, yearEnd: 2020, trims: [
            { name: "1.0 TSI Reference", equipmentPackage: "Reference", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "115 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 TDI FR", equipmentPackage: "FR", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.5", enginePower: "115 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Leon 4 (KL)", yearStart: 2020, trims: [
            { name: "1.0 TSI Style", equipmentPackage: "Style", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 TDI FR", equipmentPackage: "FR", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.5", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Ibiza",
        generations: [
          { name: "Ibiza 5 (6J)", yearStart: 2008, yearEnd: 2017, trims: [
            { name: "1.2 TSI Reference", equipmentPackage: "Reference", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 TDI FR", equipmentPackage: "FR", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "105 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Ibiza 6 (KJ)", yearStart: 2017, trims: [
            { name: "1.0 TSI Reference", equipmentPackage: "Reference", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "95 hp", drivetrain: "Önden Çekiş" },
            { name: "1.0 TSI FR", equipmentPackage: "FR", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", enginePower: "115 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Ateca",
        generations: [
          { name: "Ateca 1 (KH)", yearStart: 2016, trims: [
            { name: "1.0 TSI Reference", equipmentPackage: "Reference", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "115 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 TDI 4Drive FR", equipmentPackage: "FR", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "150 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "Arona",
        generations: [
          { name: "Arona 1 (KJ)", yearStart: 2017, trims: [
            { name: "1.0 TSI Reference", equipmentPackage: "Reference", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "95 hp", drivetrain: "Önden Çekiş" },
            { name: "1.0 TSI FR", equipmentPackage: "FR", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", enginePower: "115 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
    ],
  },
  {
    name: "Skoda",
    models: [
      {
        name: "Octavia",
        generations: [
          { name: "Octavia 3 (5E)", yearStart: 2012, yearEnd: 2019, trims: [
            { name: "1.0 TSI Active", equipmentPackage: "Active", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "115 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 TDI Ambition", equipmentPackage: "Ambition", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.6", enginePower: "115 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 TDI Style DSG", equipmentPackage: "Style", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Octavia 4 (NX)", yearStart: 2019, trims: [
            { name: "1.0 TSI Active", equipmentPackage: "Active", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "110 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 TDI Style DSG", equipmentPackage: "Style", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Fabia",
        generations: [
          { name: "Fabia 3 (NJ)", yearStart: 2014, yearEnd: 2021, trims: [
            { name: "1.0 MPI Active", equipmentPackage: "Active", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "75 hp", drivetrain: "Önden Çekiş" },
            { name: "1.0 TSI Ambition", equipmentPackage: "Ambition", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "95 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Fabia 4 (PJ)", yearStart: 2021, trims: [
            { name: "1.0 MPI Active", equipmentPackage: "Active", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "65 hp", drivetrain: "Önden Çekiş" },
            { name: "1.0 TSI Ambition", equipmentPackage: "Ambition", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.0", enginePower: "95 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Superb",
        generations: [
          { name: "Superb 3 (3V)", yearStart: 2015, trims: [
            { name: "1.4 TSI Active", equipmentPackage: "Active", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.4", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 TDI Style DSG", equipmentPackage: "Style", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Karoq",
        generations: [
          { name: "Karoq 1 (NU)", yearStart: 2017, trims: [
            { name: "1.0 TSI Active", equipmentPackage: "Active", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.0", enginePower: "115 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 TDI 4x4 Style", equipmentPackage: "Style", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "150 hp", drivetrain: "4x4" },
          ]},
        ],
      },
    ],
  },
  {
    name: "Volvo",
    models: [
      {
        name: "S60",
        generations: [
          { name: "S60 2 (134)", yearStart: 2010, yearEnd: 2018, trims: [
            { name: "T3 Kinetic", equipmentPackage: "Kinetic", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.5", enginePower: "152 hp", drivetrain: "Önden Çekiş" },
            { name: "D3 Momentum", equipmentPackage: "Momentum", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "S60 3 (Z)", yearStart: 2018, trims: [
            { name: "T4 Momentum", equipmentPackage: "Momentum", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "190 hp", drivetrain: "Önden Çekiş" },
            { name: "T6 AWD Inscription", equipmentPackage: "Inscription", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "310 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "XC40",
        generations: [
          { name: "XC40 1 (536)", yearStart: 2017, trims: [
            { name: "T3 Momentum", equipmentPackage: "Momentum", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.5", enginePower: "163 hp", drivetrain: "Önden Çekiş" },
            { name: "D3 AWD R-Design", equipmentPackage: "R-Design", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "150 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "XC60",
        generations: [
          { name: "XC60 1 (156)", yearStart: 2008, yearEnd: 2017, trims: [
            { name: "D3 Kinetic", equipmentPackage: "Kinetic", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "163 hp", drivetrain: "Önden Çekiş" },
            { name: "D5 AWD R-Design", equipmentPackage: "R-Design", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.4", enginePower: "215 hp", drivetrain: "4x4" },
          ]},
          { name: "XC60 2 (246)", yearStart: 2017, trims: [
            { name: "D4 AWD Momentum", equipmentPackage: "Momentum", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "190 hp", drivetrain: "4x4" },
            { name: "T5 AWD R-Design", equipmentPackage: "R-Design", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "250 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "V60",
        generations: [
          { name: "V60 2 (Z)", yearStart: 2018, trims: [
            { name: "T4 Momentum", equipmentPackage: "Momentum", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "190 hp", drivetrain: "Önden Çekiş" },
            { name: "D3 Momentum", equipmentPackage: "Momentum", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.0", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
    ],
  },
  {
    name: "Mazda",
    models: [
      {
        name: "3",
        generations: [
          { name: "Mazda 3 BM", yearStart: 2013, yearEnd: 2019, trims: [
            { name: "1.5 Skyactiv-G Prime-Line", equipmentPackage: "Prime-Line", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.5", enginePower: "100 hp", drivetrain: "Önden Çekiş" },
            { name: "2.2 Skyactiv-D Sports-Line", equipmentPackage: "Sports-Line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.2", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Mazda 3 BP", yearStart: 2019, trims: [
            { name: "2.0 Skyactiv-G Prime-Line", equipmentPackage: "Prime-Line", fuelType: "Benzin", transmission: "Manuel", engineVolume: "2.0", enginePower: "122 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 Skyactiv-X Sports-Line", equipmentPackage: "Sports-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "180 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "CX-5",
        generations: [
          { name: "CX-5 KE", yearStart: 2012, yearEnd: 2017, trims: [
            { name: "2.0 Skyactiv-G Prime-Line", equipmentPackage: "Prime-Line", fuelType: "Benzin", transmission: "Manuel", engineVolume: "2.0", enginePower: "160 hp", drivetrain: "Önden Çekiş" },
            { name: "2.2 Skyactiv-D AWD Sports-Line", equipmentPackage: "Sports-Line", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.2", enginePower: "175 hp", drivetrain: "4x4" },
          ]},
          { name: "CX-5 KF", yearStart: 2017, trims: [
            { name: "2.0 Skyactiv-G Prime-Line", equipmentPackage: "Prime-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "165 hp", drivetrain: "Önden Çekiş" },
            { name: "2.5 Skyactiv-G AWD Sports-Line", equipmentPackage: "Sports-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.5", enginePower: "194 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "CX-30",
        generations: [
          { name: "CX-30 1 (DM)", yearStart: 2019, trims: [
            { name: "2.0 Skyactiv-G Prime-Line", equipmentPackage: "Prime-Line", fuelType: "Benzin", transmission: "Manuel", engineVolume: "2.0", enginePower: "122 hp", drivetrain: "Önden Çekiş" },
            { name: "2.0 Skyactiv-X AWD Sports-Line", equipmentPackage: "Sports-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "180 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "2",
        generations: [
          { name: "Mazda 2 DJ", yearStart: 2014, trims: [
            { name: "1.5 Skyactiv-G Prime-Line", equipmentPackage: "Prime-Line", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.5", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 Skyactiv-G Sports-Line", equipmentPackage: "Sports-Line", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", enginePower: "115 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
    ],
  },
  {
    name: "Suzuki",
    models: [
      {
        name: "Swift",
        generations: [
          { name: "Swift 4 (FZ/NZ)", yearStart: 2010, yearEnd: 2017, trims: [
            { name: "1.2 VVT GL", equipmentPackage: "GL", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "94 hp", drivetrain: "Önden Çekiş" },
            { name: "1.3 DDiS GLX", equipmentPackage: "GLX", fuelType: "Dizel", transmission: "Manuel", engineVolume: "1.3", enginePower: "75 hp", drivetrain: "Önden Çekiş" },
          ]},
          { name: "Swift 5 (AZ)", yearStart: 2017, trims: [
            { name: "1.2 Dualjet GL", equipmentPackage: "GL", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "90 hp", drivetrain: "Önden Çekiş" },
            { name: "1.2 Hybrid GLX", equipmentPackage: "GLX", fuelType: "Hibrit", transmission: "Otomatik", engineVolume: "1.2", enginePower: "83 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Vitara",
        generations: [
          { name: "Vitara 4 (LY)", yearStart: 2015, trims: [
            { name: "1.4 Boosterjet GL+", equipmentPackage: "GL+", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", enginePower: "140 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 Hybrid GLX 4x4", equipmentPackage: "GLX", fuelType: "Hibrit", transmission: "Otomatik", engineVolume: "1.5", enginePower: "102 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "SX4 S-Cross",
        generations: [
          { name: "S-Cross 1 (JY)", yearStart: 2013, yearEnd: 2021, trims: [
            { name: "1.4 Boosterjet GL+", equipmentPackage: "GL+", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", enginePower: "140 hp", drivetrain: "Önden Çekiş" },
            { name: "1.6 DDiS GLX 4x4", equipmentPackage: "GLX", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "1.6", enginePower: "120 hp", drivetrain: "4x4" },
          ]},
          { name: "S-Cross 2 (JYB)", yearStart: 2021, trims: [
            { name: "1.4 Boosterjet Hybrid GL+", equipmentPackage: "GL+", fuelType: "Hibrit", transmission: "Otomatik", engineVolume: "1.4", enginePower: "129 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Jimny",
        generations: [
          { name: "Jimny 4 (JB64/JB74)", yearStart: 2018, trims: [
            { name: "1.5 GL", equipmentPackage: "GL", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.5", enginePower: "102 hp", drivetrain: "4x4" },
            { name: "1.5 GLX Otomatik", equipmentPackage: "GLX", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", enginePower: "102 hp", drivetrain: "4x4" },
          ]},
        ],
      },
    ],
  },
  {
    name: "Mitsubishi",
    models: [
      {
        name: "ASX",
        generations: [
          { name: "ASX 1 (GA)", yearStart: 2010, yearEnd: 2022, trims: [
            { name: "1.6 Inform", equipmentPackage: "Inform", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.6", enginePower: "117 hp", drivetrain: "Önden Çekiş" },
            { name: "2.2 DI-D Intense 4x4", equipmentPackage: "Intense", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.2", enginePower: "150 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "Eclipse Cross",
        generations: [
          { name: "Eclipse Cross 1 (GK)", yearStart: 2017, trims: [
            { name: "1.5 Turbo Inform", equipmentPackage: "Inform", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", enginePower: "163 hp", drivetrain: "Önden Çekiş" },
            { name: "1.5 Turbo 4WD Intense", equipmentPackage: "Intense", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "1.5", enginePower: "163 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "Outlander",
        generations: [
          { name: "Outlander 3 (GF)", yearStart: 2012, yearEnd: 2021, trims: [
            { name: "2.0 Inform", equipmentPackage: "Inform", fuelType: "Benzin", transmission: "Otomatik", engineVolume: "2.0", enginePower: "150 hp", drivetrain: "Önden Çekiş" },
            { name: "2.2 DI-D 4WD Intense+", equipmentPackage: "Intense+", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.2", enginePower: "150 hp", drivetrain: "4x4" },
          ]},
          { name: "Outlander 4 (GN)", yearStart: 2021, trims: [
            { name: "2.5 Intense 4WD", equipmentPackage: "Intense", fuelType: "Benzin", transmission: "CVT", engineVolume: "2.5", enginePower: "162 hp", drivetrain: "4x4" },
          ]},
        ],
      },
      {
        name: "L200",
        generations: [
          { name: "L200 5 (KB4T)", yearStart: 2015, trims: [
            { name: "2.4 DI-D Inform 4x4", equipmentPackage: "Inform", fuelType: "Dizel", transmission: "Manuel", engineVolume: "2.4", enginePower: "154 hp", drivetrain: "4x4" },
            { name: "2.4 DI-D Intense 4x4 Oto", equipmentPackage: "Intense", fuelType: "Dizel", transmission: "Otomatik", engineVolume: "2.4", enginePower: "181 hp", drivetrain: "4x4" },
          ]},
        ],
      },
    ],
  },
  {
    name: "Tofaş",
    models: [
      {
        name: "Şahin",
        generations: [
          { name: "Şahin (131)", yearStart: 1971, yearEnd: 2008, trims: [
            { name: "1.3 Standart", equipmentPackage: "Standart", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.3", enginePower: "60 hp", drivetrain: "Arkadan İtiş" },
          ]},
        ],
      },
      {
        name: "Doğan",
        generations: [
          { name: "Doğan (161)", yearStart: 1984, yearEnd: 2010, trims: [
            { name: "1.6 SLX", equipmentPackage: "SLX", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.6", enginePower: "71 hp", drivetrain: "Arkadan İtiş" },
            { name: "1.6 SX", equipmentPackage: "SX", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.6", enginePower: "71 hp", drivetrain: "Arkadan İtiş" },
          ]},
        ],
      },
      {
        name: "Tipo",
        generations: [
          { name: "Tipo (160)", yearStart: 1993, yearEnd: 2000, trims: [
            { name: "1.6 ie SX", equipmentPackage: "SX", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.6", enginePower: "88 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Albea",
        generations: [
          { name: "Albea (178)", yearStart: 2002, yearEnd: 2012, trims: [
            { name: "1.2 Dynamic", equipmentPackage: "Dynamic", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "60 hp", drivetrain: "Önden Çekiş" },
            { name: "1.4 ELX", equipmentPackage: "ELX", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", enginePower: "77 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Palio",
        generations: [
          { name: "Palio (178)", yearStart: 1999, yearEnd: 2012, trims: [
            { name: "1.2 S", equipmentPackage: "S", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.2", enginePower: "60 hp", drivetrain: "Önden Çekiş" },
            { name: "1.4 ELX", equipmentPackage: "ELX", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", enginePower: "77 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
      {
        name: "Brava",
        generations: [
          { name: "Brava (182)", yearStart: 1997, yearEnd: 2002, trims: [
            { name: "1.4 12v S", equipmentPackage: "S", fuelType: "Benzin", transmission: "Manuel", engineVolume: "1.4", enginePower: "80 hp", drivetrain: "Önden Çekiş" },
          ]},
        ],
      },
    ],
  },
];
