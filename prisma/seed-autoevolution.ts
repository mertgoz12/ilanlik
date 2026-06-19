import "dotenv/config";
import path from "node:path";
import AdmZip from "adm-zip";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { PrismaClient } from "../src/generated/prisma/client";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ZIP_PATH = path.join(
  __dirname,
  "..",
  "automobile-models-and-specs-master",
  "automobiles.json.zip",
);

// autoevolution kaynak marka adı -> bu projedeki kanonik (mevcut VehicleBrand
// kayıtlarıyla eşleşen) görünen ad. Burada olmayan markalar toTitleCase ile
// üretilir (bkz. --all bayrağı, ileriki aşama).
const BRAND_NAME_OVERRIDES: Record<string, string> = {
  VOLKSWAGEN: "Volkswagen",
  RENAULT: "Renault",
  FIAT: "Fiat",
  FORD: "Ford",
  OPEL: "Opel",
  PEUGEOT: "Peugeot",
  TOYOTA: "Toyota",
  HYUNDAI: "Hyundai",
  HONDA: "Honda",
  "MERCEDES BENZ": "Mercedes-Benz",
  BMW: "BMW",
  AUDI: "Audi",
  CITROEN: "Citroën",
  DACIA: "Dacia",
  NISSAN: "Nissan",
  KIA: "Kia",
  SEAT: "Seat",
  SKODA: "Skoda",
  VOLVO: "Volvo",
  SUZUKI: "Suzuki",
  MITSUBISHI: "Mitsubishi",
  MAZDA: "Mazda",
};

// Türkiye'de yaygın markalar (1. aşama). "--all" bayrağı verilmeden çalıştırılırsa
// sadece bunlar işlenir; ikinci çalıştırmada "--all" ile kalan markalar eklenir.
const PRIORITY_BRANDS = new Set(Object.keys(BRAND_NAME_OVERRIDES));

function toTitleCase(s: string): string {
  return s.toLowerCase().replace(/(^|[\s-])([a-zà-ÿ])/g, (_m, sep, c) => sep + c.toUpperCase());
}

function canonicalBrandName(rawName: string): string {
  return BRAND_NAME_OVERRIDES[rawName] ?? toTitleCase(rawName);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SUFFIX_RE = /\s*Photos,?\s*engines.*$/i;
const FALLBACK_YEAR = 1900;

// Avrupa/Asya markalarında jenerasyon çoğunlukla model adının içine Roma
// rakamıyla gömülü ("Golf VII 3 Doors", "Octavia I Combi"). Boşlukla
// çevrelenmiş (tireyle bitişik değil) bir Roma rakamı bulunca onu model
// adından ayırıp jenerasyon tarafına taşıyoruz; yoksa örn. VW "Golf" 50+
// ayrı modele bölünüyor (Golf VII 3 Doors, Golf VII Variant, ... hepsi ayrı).
// Tire bitişikliği hariç tutulduğu için Honda "CR-V"/"HR-V" ve Nissan
// "GT-R V-Spec" gibi model adının PARÇASI olan "V" harfleri yanlışlıkla
// ayrıştırılmıyor. Bilinen tek kalıntı yanlış pozitif: Toyota "Prius V"
// (gerçek bir alt model adı, jenerasyon değil) — kabul edilebilir.
const ROMAN_RE = /(?<=^|\s)(VIII|VII|VI|IV|III|II|I|XII|XI|IX|V)(?=\s|$)/;
const ROMAN_TO_ARABIC: Record<string, number> = {
  I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, XI: 11, XII: 12,
};

type ParsedName = {
  modelName: string;
  generationName: string;
  yearStart: number;
  yearEnd: number | null;
  fellBack: boolean;
};

// autoevolution "automobile" kaydının `name` alanı marka+model+jenerasyon
// bilgisini tutarsız biçimlerde karıştırıyor (bkz. inceleme raporu). Bu
// fonksiyon best-effort regex ile temel model adı + yıl aralığını ayıklar;
// ayrıştıramadığı ~120-300 kayıt "(Tüm Yıllar)" tek jenerasyonuna düşer.
function parseAutomobileName(rawName: string, brandRawName: string): ParsedName {
  let text = rawName.replace(/&amp;/g, "&");
  text = text.replace(SUFFIX_RE, "").trim();

  let yearStart: number | null = null;
  let yearEnd: number | null = null;

  const rangeMatch = text.match(/(\d{4})\s*-\s*(\d{4})\s*$/);
  const presentMatch = !rangeMatch ? text.match(/(\d{4})\s*-\s*Present\s*$/i) : null;
  const prefixMatch = !rangeMatch && !presentMatch ? text.match(/^(\d{4})\s+/) : null;

  if (rangeMatch && rangeMatch.index !== undefined) {
    yearStart = parseInt(rangeMatch[1], 10);
    yearEnd = parseInt(rangeMatch[2], 10);
    text = text.slice(0, rangeMatch.index).trim();
  } else if (presentMatch && presentMatch.index !== undefined) {
    yearStart = parseInt(presentMatch[1], 10);
    text = text.slice(0, presentMatch.index).trim();
  } else if (prefixMatch) {
    yearStart = parseInt(prefixMatch[1], 10);
    text = text.slice(prefixMatch[0].length).trim();
  }

  const brandPattern = escapeRegExp(brandRawName).replace(/\s+/g, "[\\s-]+");
  const brandRe = new RegExp(`\\b${brandPattern}\\b`, "i");
  text = text.replace(brandRe, "").replace(/\s{2,}/g, " ").trim();

  const fellBack = yearStart === null;
  if (fellBack) yearStart = FALLBACK_YEAR;

  let baseText = text.replace(/\([^)]*\)/g, " ").replace(/\s{2,}/g, " ").trim();

  // Roma rakamıyla gömülü jenerasyonu model adından ayır (bkz. ROMAN_RE yorumu).
  let generationLabel = baseText;
  const romanMatch = baseText.match(ROMAN_RE);
  if (romanMatch && romanMatch.index !== undefined) {
    const prefix = baseText.slice(0, romanMatch.index).trim();
    if (prefix) {
      const arabic = ROMAN_TO_ARABIC[romanMatch[1]];
      const suffix = baseText.slice(romanMatch.index + romanMatch[1].length).trim();
      baseText = prefix;
      generationLabel = `${prefix} ${arabic}${suffix ? ` ${suffix}` : ""}`;
    }
  }

  // Ham model adı sadece rakamdan ibaretse (bozuk kaynak kaydı, örn. "2019")
  // marka adına düşürülür.
  if (!baseText || /^\d+$/.test(baseText)) {
    baseText = canonicalBrandName(brandRawName);
    generationLabel = baseText;
  }

  const modelName = baseText;
  const generationName = fellBack
    ? `${generationLabel} (Tüm Yıllar)`
    : `${generationLabel} ${yearStart}${yearEnd ? `-${yearEnd}` : "-Present"}`;

  return { modelName, generationName, yearStart: yearStart as number, yearEnd, fellBack };
}

// "Gasoline"->Benzin, "Diesel"->Dizel vb. Eşlemede olmayan/şüpheli her şey
// (Natural Gas, Ethanol, LPG) yanlış bilgi göstermemek için "Diğer" olur.
const FUEL_MAP: Record<string, string> = {
  Gasoline: "Benzin",
  Diesel: "Dizel",
  Electric: "Elektrik",
  Hybrid: "Hibrit",
  "Hybrid Gasoline": "Hibrit",
  "Mild Hybrid": "Hibrit",
  "Mild Hybrid Diesel": "Hibrit",
  "Hybrid Diesel": "Hibrit",
  "Plug-In Hybrid": "Benzin & Elektrik (Plug-in Hibrit)",
};

function mapFuelType(raw: string | undefined): string {
  if (!raw) return "Diğer";
  return FUEL_MAP[raw.trim()] ?? "Diğer";
}

function mapTransmission(raw: string | undefined): string {
  if (!raw) return "Otomatik";
  const lower = raw.toLowerCase();
  if (lower.includes("manual")) return "Manuel";
  if (lower.includes("cvt")) return "CVT";
  return "Otomatik";
}

function mapDrivetrain(raw: string | undefined): string | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes("front")) return "Önden Çekiş";
  if (lower.includes("rear")) return "Arkadan İtiş";
  if (lower.includes("all")) return "4x4";
  return null;
}

function mapEngineVolume(displacement: string | undefined): string | null {
  if (!displacement) return null;
  const m = displacement.match(/([\d.]+)\s*Cm3/i);
  if (!m) return null;
  const cc = parseFloat(m[1]);
  if (!cc) return null;
  return (cc / 1000).toFixed(1);
}

function mapEnginePower(power: string | undefined): string | null {
  if (!power) return null;
  const m = power.match(/([\d.]+)\s*Hp\b/i);
  if (!m) return null;
  const hp = Math.round(parseFloat(m[1]));
  return `${hp} hp`;
}

type SourceBrand = { id: number; name: string };
type SourceAutomobile = {
  id: number;
  brand_id: number;
  name: string;
  url: string;
};
type SourceEngine = {
  id: number;
  automobile_id: number;
  name: string;
  specs: Record<string, Record<string, string>>;
};

async function main() {
  const processAll = process.argv.includes("--all");

  console.log(`Zip okunuyor: ${ZIP_PATH}`);
  const zip = new AdmZip(ZIP_PATH);
  const brands: SourceBrand[] = JSON.parse(zip.readAsText("brands.json"));
  const automobiles: SourceAutomobile[] = JSON.parse(zip.readAsText("automobiles.json"));
  const engines: SourceEngine[] = JSON.parse(zip.readAsText("engines.json"));

  const sourceBrands = brands.filter((b) => processAll || PRIORITY_BRANDS.has(b.name));
  console.log(
    `${sourceBrands.length} marka işlenecek (${processAll ? "tümü" : "öncelikli Türkiye listesi"}).`,
  );

  const automobilesByBrand = new Map<number, SourceAutomobile[]>();
  for (const a of automobiles) {
    const list = automobilesByBrand.get(a.brand_id);
    if (list) list.push(a);
    else automobilesByBrand.set(a.brand_id, [a]);
  }
  const enginesByAutomobile = new Map<number, SourceEngine[]>();
  for (const e of engines) {
    const list = enginesByAutomobile.get(e.automobile_id);
    if (list) list.push(e);
    else enginesByAutomobile.set(e.automobile_id, [e]);
  }

  let brandCount = 0;
  let modelCount = 0;
  let generationCount = 0;
  let trimCount = 0;
  let fellBackCount = 0;
  let otherFuelCount = 0;
  let totalAutomobiles = 0;

  for (const srcBrand of sourceBrands) {
    const brandName = canonicalBrandName(srcBrand.name);
    const brandAutos = automobilesByBrand.get(srcBrand.id) ?? [];
    if (brandAutos.length === 0) continue;

    const existingBrandCount = await prisma.vehicleBrand.count();
    const brand = await prisma.vehicleBrand.upsert({
      where: { name: brandName },
      update: {},
      create: { name: brandName, order: existingBrandCount },
    });
    brandCount++;

    const modelIdByName = new Map<string, string>();
    for (const m of await prisma.vehicleModel.findMany({
      where: { brandId: brand.id },
      select: { id: true, name: true },
    })) {
      modelIdByName.set(m.name, m.id);
    }
    let modelOrder = modelIdByName.size;

    const generationIdByKey = new Map<string, string>();
    const trimNamesByGeneration = new Map<string, Set<string>>();

    for (const auto of brandAutos) {
      totalAutomobiles++;
      const autoEngines = enginesByAutomobile.get(auto.id) ?? [];
      if (autoEngines.length === 0) continue;

      const parsed = parseAutomobileName(auto.name, srcBrand.name);
      if (parsed.fellBack) fellBackCount++;

      let modelId = modelIdByName.get(parsed.modelName);
      if (!modelId) {
        const model = await prisma.vehicleModel.create({
          data: { name: parsed.modelName, order: modelOrder++, brandId: brand.id },
        });
        modelId = model.id;
        modelIdByName.set(parsed.modelName, modelId);
        modelCount++;
      }

      const genKey = `${modelId}|${parsed.generationName}`;
      let generationId = generationIdByKey.get(genKey);
      if (!generationId) {
        const existingGen = await prisma.vehicleGeneration.findUnique({
          where: { modelId_name: { modelId, name: parsed.generationName } },
          select: { id: true },
        });
        if (existingGen) {
          generationId = existingGen.id;
        } else {
          const genOrder = await prisma.vehicleGeneration.count({ where: { modelId } });
          const generation = await prisma.vehicleGeneration.create({
            data: {
              name: parsed.generationName,
              yearStart: parsed.yearStart,
              yearEnd: parsed.yearEnd,
              order: genOrder,
              modelId,
            },
          });
          generationId = generation.id;
          generationCount++;
        }
        generationIdByKey.set(genKey, generationId);
      }

      let existingTrimNames = trimNamesByGeneration.get(generationId);
      if (!existingTrimNames) {
        const rows = await prisma.vehicleTrim.findMany({
          where: { generationId },
          select: { name: true },
        });
        existingTrimNames = new Set(rows.map((r) => r.name));
        trimNamesByGeneration.set(generationId, existingTrimNames);
      }

      let trimOrder = existingTrimNames.size;
      for (const engine of autoEngines) {
        if (existingTrimNames.has(engine.name)) continue;

        const engineSpecs = engine.specs["Engine Specs"] ?? {};
        const transmissionSpecs = engine.specs["Transmission Specs"] ?? {};
        const fuelType = mapFuelType(engineSpecs["Fuel:"]);
        if (fuelType === "Diğer") otherFuelCount++;

        await prisma.vehicleTrim.create({
          data: {
            name: engine.name,
            fuelType,
            transmission: mapTransmission(transmissionSpecs["Gearbox:"]),
            engineVolume: mapEngineVolume(engineSpecs["Displacement:"]),
            enginePower: mapEnginePower(engineSpecs["Power:"]),
            drivetrain: mapDrivetrain(transmissionSpecs["Drive Type:"]),
            order: trimOrder++,
            generationId,
            sourceUrl: auto.url,
            rawSpecs: JSON.stringify(engine.specs),
          },
        });
        existingTrimNames.add(engine.name);
        trimCount++;
      }
    }
  }

  console.log("\n=== autoevolution içe aktarma raporu ===");
  console.log(`İşlenen marka: ${brandCount}`);
  console.log(`Yeni eklenen model: ${modelCount}`);
  console.log(`Yeni eklenen jenerasyon: ${generationCount}`);
  console.log(`Yeni eklenen donanım/motor: ${trimCount}`);
  console.log(`Toplam taranan automobile kaydı: ${totalAutomobiles}`);
  console.log(`Yıl ayrıştırılamayıp "(Tüm Yıllar)" bucket'ına düşen kayıt: ${fellBackCount}`);
  console.log(`Yakıt tipi "Diğer" olarak işaretlenen motor: ${otherFuelCount}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
