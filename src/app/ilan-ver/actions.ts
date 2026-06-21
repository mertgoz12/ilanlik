"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { destroySession, getSession } from "@/lib/session";
import { buildAnalysisInput, buildGenericAnalysisInput, runAiAnalysis, runGenericAiAnalysis } from "@/lib/ai-analysis";
import { getEffectiveSettings, isAiAnalysisAutoEnabled } from "@/lib/analysis-config";
import { MAX_IMAGES_PER_LISTING, uploadListingPhoto } from "@/lib/listing-photos";
import {
  computeGenericRuleAnalysis,
  computeRuleAnalysis,
  toComparable,
  toGenericComparable,
  type ComparableListing,
} from "@/lib/rule-analysis";
import {
  ALL_DAMAGE_PART_KEYS,
  DAMAGE_PART_STATUSES,
  deriveDamageStatus,
  type DamagePartStatus,
} from "@/lib/car-data";
import { generateListingNo } from "@/lib/listing-no";
import {
  listingSchema,
  simpleListingSchema,
  type ListingInput,
  type SimpleListingInput,
} from "@/lib/validation";

const DAMAGE_PART_STATUS_VALUES = new Set(DAMAGE_PART_STATUSES.map((s) => s.value));

// Oturum çerezi, en son veritabanı sıfırlama/seed işleminden önce oluşturulmuş
// olabilir; bu durumda session.id artık User tablosunda yok ve
// prisma.listing.create() foreign key hatasıyla patlar. Önceden doğrula.
async function requireValidUser() {
  const session = await getSession();
  if (!session) {
    redirect("/giris?callbackUrl=/ilan-ver");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true },
  });
  if (!user) {
    await destroySession();
    redirect("/giris?callbackUrl=/ilan-ver");
  }

  return session;
}

// Kategori listesi de bir sayfa yüklemesi anında veritabanından okunuyor; eğer
// o yüklemeden sonra kategoriler yeniden seed edildiyse (yeni id'lerle),
// formdan gelen categoryId artık Category tablosunda olmayabilir.
async function categoryExists(categoryId: string): Promise<boolean> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
  return !!category;
}

const INVALID_CATEGORY_ERROR =
  "Seçilen kategori artık mevcut değil. Lütfen sayfayı yenileyip kategoriyi tekrar seçin.";

async function generateUniqueListingNo(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateListingNo();
    const existing = await prisma.listing.findUnique({
      where: { listingNo: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  throw new Error("İlan numarası oluşturulamadı.");
}

function parseDamageInfo(raw: FormDataEntryValue | null): Record<string, DamagePartStatus> {
  let parsed: Record<string, unknown> = {};
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }
  }

  const result: Record<string, DamagePartStatus> = {};
  for (const key of ALL_DAMAGE_PART_KEYS) {
    const value = parsed[key];
    result[key] =
      typeof value === "string" && DAMAGE_PART_STATUS_VALUES.has(value as DamagePartStatus)
        ? (value as DamagePartStatus)
        : "orijinal";
  }
  return result;
}

function parseEquipment(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export type ListingFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof ListingInput, string[]>>;
  priceWarning?: boolean;
  listingNo?: string;
};

export type SimpleListingFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof SimpleListingInput, string[]>>;
  priceWarning?: boolean;
  listingNo?: string;
};

// Kaydedilen fotoğraf sayısını döner - "eksik bilgi" güven puanı kontrolü
// için kullanılır (bkz. computeRuleTrustScore/computeGenericTrustScore).
//
// Fotoğraflar Vercel'in sunucusuz ortamında kalıcı olmayan yerel diske değil,
// Vercel Blob'a yüklenir (bkz. lib/listing-photos.ts, BLOB_READ_WRITE_TOKEN).
// Bir fotoğrafın yüklenmesi başarısız olursa o fotoğraf atlanır, ilan diğer
// fotoğraflarla (veya fotoğrafsız) yayınlanmaya devam eder - tek bir bozuk
// dosya tüm ilan oluşturma akışını çökertmez.
async function saveListingImages(formData: FormData, listingId: string): Promise<number> {
  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)
    .slice(0, MAX_IMAGES_PER_LISTING);

  if (files.length === 0) return 0;

  let order = 0;
  for (const file of files) {
    const result = await uploadListingPhoto(file, listingId);
    if (result.ok) {
      await prisma.listingImage.create({
        data: { url: result.url, order: order++, listingId },
      });
    }
  }
  return order;
}

export async function createListingAction(
  _prevState: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const session = await requireValidUser();

  const damageInfo = parseDamageInfo(formData.get("damageInfo"));
  const equipment = parseEquipment(formData.get("equipment"));

  const brand = (formData.get("brand") as string) || "";
  const model = (formData.get("model") as string) || "";
  const year = (formData.get("year") as string) || "";
  const series = (formData.get("series") as string) || "";

  let title = ((formData.get("title") as string) || "").trim();
  if (!title) {
    title = [brand, series, model, year].filter(Boolean).join(" ");
  }

  const raw = {
    title,
    categoryId: formData.get("categoryId"),
    brand,
    model,
    series,
    year,
    km: formData.get("km"),
    price: formData.get("price"),
    fuelType: formData.get("fuelType"),
    transmission: formData.get("transmission"),
    bodyType: formData.get("bodyType"),
    color: formData.get("color"),
    enginePower: formData.get("enginePower"),
    engineVolume: formData.get("engineVolume"),
    drivetrain: formData.get("drivetrain"),
    vehicleCondition: formData.get("vehicleCondition"),
    doorCount: formData.get("doorCount"),
    plateOrigin: formData.get("plateOrigin"),
    fromWho: formData.get("fromWho"),
    exchange: formData.get("exchange"),
    warranty: formData.get("warranty"),
    trimId: formData.get("trimId"),
    description: formData.get("description"),
    damageInfo,
    tramerAmount: formData.get("tramerAmount"),
    equipment,
    il: formData.get("il"),
    ilce: formData.get("ilce"),
  };

  const parsed = listingSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: "Lütfen formdaki hataları düzeltin.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  if (!(await categoryExists(data.categoryId))) {
    return { error: INVALID_CATEGORY_ERROR };
  }

  const tramerAmount = data.tramerAmount && data.tramerAmount > 0 ? data.tramerAmount : null;
  const damageStatus = deriveDamageStatus(tramerAmount);
  const listingNo = await generateUniqueListingNo();

  // Seçilen motor/donanım (VehicleTrim) autoevolution kaynaklı ham teknik
  // verisini (tork, yakıt tüketimi, boyutlar vb.) barındırıyorsa, ilan detay
  // sayfasındaki "Detaylı Teknik Özellikler" panelinde göstermek için bir
  // anlık görüntü olarak kopyalanır. Katalog listesi performans nedeniyle bu
  // veriyi içermez (bkz. vehicle-catalog.ts); burada SADECE seçilen tek
  // donanım için tek satır sorgulanır.
  let vehicleTrimRawSpecs: string | null = null;
  if (data.trimId) {
    const trim = await prisma.vehicleTrim.findUnique({
      where: { id: data.trimId },
      select: { rawSpecs: true },
    });
    vehicleTrimRawSpecs = trim?.rawSpecs ?? null;
  }

  const listing = await prisma.listing.create({
    data: {
      listingNo,
      title: data.title,
      categoryId: data.categoryId,
      brand: data.brand,
      model: data.model,
      series: data.series || null,
      year: data.year,
      km: data.km,
      price: data.price,
      fuelType: data.fuelType,
      transmission: data.transmission,
      bodyType: data.bodyType || null,
      color: data.color || null,
      enginePower: data.enginePower || null,
      engineVolume: data.engineVolume || null,
      drivetrain: data.drivetrain || null,
      vehicleCondition: data.vehicleCondition || null,
      doorCount: data.doorCount || null,
      plateOrigin: data.plateOrigin || null,
      fromWho: data.fromWho || null,
      exchange: data.exchange || null,
      warranty: data.warranty || null,
      vehicleTrimRawSpecs,
      description: data.description || null,
      damageStatus,
      damageInfo: JSON.stringify(data.damageInfo),
      tramerAmount,
      equipment: JSON.stringify(data.equipment),
      il: data.il,
      ilce: data.ilce,
      userId: session.id,
    },
  });

  const photoCount = await saveListingImages(formData, listing.id);

  // KATMAN 1 — KURAL TABANLI ANALİZ: yapay zeka yok, her ilanda çalışır, ücretsiz.
  // Aynı marka/model ve yakın yıl/km aralığındaki ilanlardan fiyat durumu hesaplanır.
  const comparableRows = await prisma.listing.findMany({
    where: {
      id: { not: listing.id },
      brand: data.brand,
      model: data.model,
      year: { not: null },
      km: { not: null },
      status: { not: "silindi" },
    },
    select: { id: true, brand: true, model: true, year: true, km: true, price: true },
  });
  const comparables = comparableRows.map(toComparable).filter((c): c is ComparableListing => c !== null);
  const settings = await getEffectiveSettings();

  const ruleAnalysis = computeRuleAnalysis(
    {
      id: listing.id,
      brand: data.brand,
      model: data.model,
      year: data.year,
      km: data.km,
      price: data.price,
      description: data.description || null,
      damageInfo: JSON.stringify(data.damageInfo),
      tramerAmount,
      photoCount,
      bodyType: data.bodyType || null,
      color: data.color || null,
      enginePower: data.enginePower || null,
      engineVolume: data.engineVolume || null,
      drivetrain: data.drivetrain || null,
    },
    comparables,
    settings.deprecation,
  );

  const priceWarning = ruleAnalysis?.fiyat_analizi.fiyat_durumu === "asiri_yuksek";

  await prisma.listing.update({
    where: { id: listing.id },
    data: { status: priceWarning ? "pending_review" : "active" },
  });

  // KATMAN 2 — YAPAY ZEKA: opsiyonel, varsayılan KAPALI. Otomatik çalışması için
  // .env dosyasına AI_ANALYSIS_AUTO=true eklenmelidir. Aksi halde sonuç sadece
  // ilan detay sayfasındaki manuel tetikleyiciyle üretilir.
  if (isAiAnalysisAutoEnabled()) {
    const analysisInput = buildAnalysisInput({
      brand: data.brand,
      model: data.model,
      series: data.series || null,
      year: data.year,
      km: data.km,
      fuelType: data.fuelType,
      transmission: data.transmission,
      bodyType: data.bodyType || null,
      engineVolume: data.engineVolume || null,
      enginePower: data.enginePower || null,
      drivetrain: data.drivetrain || null,
      color: data.color || null,
      equipment: data.equipment,
      damageInfo: data.damageInfo,
      tramerAmount,
      damageStatus,
      price: data.price,
      description: data.description || null,
    });

    const analysis = await runAiAnalysis(analysisInput);
    if (analysis.ok) {
      await prisma.listing.update({
        where: { id: listing.id },
        data: { aiAnalysis: JSON.stringify(analysis.result) },
      });
    }
  }

  if (priceWarning) {
    return { priceWarning: true, listingNo: listing.listingNo };
  }

  redirect(`/ilan/${listing.listingNo}`);
}

export async function createSimpleListingAction(
  _prevState: SimpleListingFormState,
  formData: FormData,
): Promise<SimpleListingFormState> {
  const session = await requireValidUser();

  const raw = {
    title: formData.get("title"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    price: formData.get("price"),
    il: formData.get("il"),
    ilce: formData.get("ilce"),
  };

  const parsed = simpleListingSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: "Lütfen formdaki hataları düzeltin.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  if (!(await categoryExists(data.categoryId))) {
    return { error: INVALID_CATEGORY_ERROR };
  }

  const listingNo = await generateUniqueListingNo();

  const listing = await prisma.listing.create({
    data: {
      listingNo,
      title: data.title,
      categoryId: data.categoryId,
      description: data.description || null,
      price: data.price,
      il: data.il,
      ilce: data.ilce,
      userId: session.id,
    },
  });

  const photoCount = await saveListingImages(formData, listing.id);

  // KATMAN 1 — KURAL TABANLI ANALİZ (vasıta dışı ilanlar için): yapay zeka
  // yok, her ilanda çalışır, ücretsiz. Aynı kategorideki diğer aktif
  // ilanlardan fiyat durumu hesaplanır (bkz. computeGenericRuleAnalysis).
  const comparableRows = await prisma.listing.findMany({
    where: { id: { not: listing.id }, categoryId: data.categoryId, status: { not: "silindi" } },
    select: { id: true, categoryId: true, title: true, price: true },
  });
  const comparables = comparableRows.map(toGenericComparable);

  const ruleAnalysis = computeGenericRuleAnalysis(
    {
      id: listing.id,
      categoryId: data.categoryId,
      title: data.title,
      price: data.price,
      description: data.description || null,
      photoCount,
    },
    comparables,
  );

  const priceWarning = ruleAnalysis.fiyat_analizi.fiyat_durumu === "asiri_yuksek";

  await prisma.listing.update({
    where: { id: listing.id },
    data: { status: priceWarning ? "pending_review" : "active" },
  });

  // KATMAN 2 — YAPAY ZEKA: opsiyonel, varsayılan KAPALI (bkz. createListingAction).
  if (isAiAnalysisAutoEnabled()) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId }, select: { name: true } });
    const analysisInput = buildGenericAnalysisInput({
      title: data.title,
      categoryName: category?.name ?? "",
      price: data.price,
      description: data.description || null,
      photoCount,
      comparables: comparableRows.slice(0, 5).map((c) => ({ title: c.title, price: c.price })),
    });

    const analysis = await runGenericAiAnalysis(analysisInput);
    if (analysis.ok) {
      await prisma.listing.update({
        where: { id: listing.id },
        data: { aiAnalysis: JSON.stringify(analysis.result) },
      });
    }
  }

  if (priceWarning) {
    return { priceWarning: true, listingNo: listing.listingNo };
  }

  redirect(`/ilan/${listing.listingNo}`);
}
