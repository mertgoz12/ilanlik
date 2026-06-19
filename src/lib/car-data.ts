export const BRANDS: Record<string, string[]> = {
  Volkswagen: ["Golf", "Passat", "Polo", "Tiguan", "Jetta", "Caddy", "T-Roc"],
  Renault: ["Clio", "Megane", "Symbol", "Fluence", "Captur", "Talisman"],
  Fiat: ["Egea", "Linea", "Doblo", "Punto", "500"],
  Toyota: ["Corolla", "Yaris", "Corolla Cross", "RAV4", "C-HR"],
  Ford: ["Focus", "Fiesta", "Kuga", "Transit", "Puma"],
  Honda: ["Civic", "City", "CR-V", "Jazz"],
  Hyundai: ["i20", "i30", "Tucson", "Accent Blue", "Bayon"],
  BMW: ["1 Serisi", "3 Serisi", "5 Serisi", "X1", "X3", "X5"],
  "Mercedes-Benz": ["A Serisi", "C Serisi", "E Serisi", "GLA", "GLC"],
  Audi: ["A3", "A4", "A6", "Q3", "Q5"],
  Opel: ["Astra", "Corsa", "Insignia", "Mokka"],
  Peugeot: ["301", "308", "2008", "3008", "208"],
  "Citroën": ["C3", "C4", "C-Elysée", "C3 Aircross"],
  Skoda: ["Octavia", "Fabia", "Superb", "Karoq"],
  Nissan: ["Qashqai", "Micra", "Juke", "X-Trail"],
  Dacia: ["Duster", "Sandero", "Logan", "Jogger"],
  Kia: ["Ceed", "Sportage", "Rio", "Stonic"],
  Seat: ["Leon", "Ibiza", "Ateca", "Arona"],
  Mazda: ["3", "CX-5", "CX-30", "2"],
  Volvo: ["S60", "XC40", "XC60", "V60"],
  TOGG: ["T10X"],
};

export const BRAND_NAMES = Object.keys(BRANDS).sort((a, b) => a.localeCompare(b, "tr"));

export const FUEL_TYPES = [
  "Benzin",
  "Dizel",
  "LPG & Benzin",
  "Hibrit",
  "Elektrik",
  "Benzin & Elektrik (Plug-in Hibrit)",
  "Diğer",
] as const;

export const TRANSMISSIONS = ["Manuel", "Otomatik", "Yarı Otomatik", "CVT"] as const;

export const BODY_TYPES = [
  "Sedan",
  "Hatchback",
  "Station Wagon",
  "SUV",
  "Coupe",
  "Cabrio",
  "MPV",
  "Pick-up",
  "Van",
] as const;

export const DRIVETRAINS = ["Önden Çekiş", "Arkadan İtiş", "4x4"] as const;

export const VEHICLE_CONDITIONS = ["İkinci El", "Sıfır", "Klasik"] as const;

export const DOOR_COUNTS = ["2", "3", "4", "5"] as const;

export const PLATE_ORIGINS = ["Türkiye (TR) Plakalı", "Yabancı Plakalı", "Mavi Plakalı"] as const;

export const FROM_WHO_OPTIONS = ["Sahibinden", "Galeriden", "Yetkili Bayiden"] as const;

export const EXCHANGE_OPTIONS = ["Evet", "Hayır", "Düşünürüm"] as const;

export const WARRANTY_OPTIONS = ["Evet", "Hayır", "Belirtilmemiş"] as const;

export const COLORS = [
  "Beyaz",
  "Siyah",
  "Gri",
  "Gümüş Gri",
  "Füme",
  "Lacivert",
  "Mavi",
  "Açık Mavi",
  "Kırmızı",
  "Bordo",
  "Yeşil",
  "Açık Yeşil",
  "Kahverengi",
  "Bej",
  "Sarı",
  "Turuncu",
  "Mor",
  "Pembe",
  "Altın",
  "Şampanya",
  "Turkuaz",
  "Petrol Mavisi",
  "Antrasit",
  "Diğer",
] as const;

export const DAMAGE_STATUSES = [
  { value: "hasarsiz", label: "Hasar Kaydı Yok" },
  { value: "hasar-kayitli", label: "Hasar Kayıtlı" },
  { value: "agir-hasarli", label: "Ağır Hasar Kayıtlı / Pert" },
] as const;

export const DAMAGE_STATUS_STYLES: Record<string, string> = {
  hasarsiz: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "hasar-kayitli": "border-amber-200 bg-amber-50 text-amber-700",
  "agir-hasarli": "border-red-200 bg-red-50 text-red-700",
};

export function damageStatusLabel(value: string) {
  return DAMAGE_STATUSES.find((s) => s.value === value)?.label ?? value;
}

// Part keys match the `data-part`/`id` attributes on the paths in
// /ilanlik-arac-sema.svg (inlined by CarDiagram).
export const DAMAGE_PART_LABELS: Record<string, string> = {
  "on-tampon": "Ön Tampon",
  kaput: "Kaput",
  tavan: "Tavan",
  bagaj: "Bagaj Kapağı",
  "arka-tampon": "Arka Tampon",
  "camurluk-sol-on": "Sol Ön Çamurluk",
  "kapi-sol-on": "Sol Ön Kapı",
  "kapi-sol-arka": "Sol Arka Kapı",
  "camurluk-sol-arka": "Sol Arka Çamurluk",
  "marspiyel-sol": "Sol Marşpiyel",
  "camurluk-sag-on": "Sağ Ön Çamurluk",
  "kapi-sag-on": "Sağ Ön Kapı",
  "kapi-sag-arka": "Sağ Arka Kapı",
  "camurluk-sag-arka": "Sağ Arka Çamurluk",
  "marspiyel-sag": "Sağ Marşpiyel",
};

export const ALL_DAMAGE_PART_KEYS = Object.keys(DAMAGE_PART_LABELS);

export function damagePartLabel(key: string): string {
  return DAMAGE_PART_LABELS[key] ?? key;
}

export const DAMAGE_PART_STATUSES = [
  { value: "orijinal", label: "Orijinal" },
  { value: "boyali", label: "Boyalı" },
  { value: "degisen", label: "Değişen" },
  { value: "lokal-boyali", label: "Lokal Boyalı" },
  { value: "tramer", label: "Tramer" },
  { value: "ezik-gocuk", label: "Ezik / Göçük" },
  { value: "plastik", label: "Plastik" },
] as const;

export type DamagePartStatus = (typeof DAMAGE_PART_STATUSES)[number]["value"];

export const DAMAGE_PART_STATUS_STYLES: Record<DamagePartStatus, string> = {
  orijinal: "border-slate-200 bg-slate-50 text-slate-600",
  boyali: "border-blue-200 bg-blue-50 text-blue-700",
  degisen: "border-red-200 bg-red-50 text-red-700",
  "lokal-boyali": "border-orange-200 bg-orange-50 text-orange-700",
  tramer: "border-green-200 bg-green-50 text-green-700",
  "ezik-gocuk": "border-amber-200 bg-amber-50 text-amber-700",
  plastik: "border-rose-200 bg-rose-50 text-rose-700",
};

export function damagePartStatusLabel(value: DamagePartStatus): string {
  return DAMAGE_PART_STATUSES.find((s) => s.value === value)?.label ?? value;
}

// Fill colors for the inline /ilanlik-arac-sema.svg car diagram. Each part's
// <path> fill is set directly to the color matching its current status.
export const DAMAGE_PART_FILL_COLORS: Record<DamagePartStatus, string> = {
  orijinal: "#d7d7d7",
  boyali: "#3b82f6",
  degisen: "#ef4444",
  "lokal-boyali": "#fb923c",
  tramer: "#22c55e",
  "ezik-gocuk": "#f97316",
  plastik: "#dc2626",
};

// --- Donanım (equipment) checkbox groups (Step 3) ---

export const EQUIPMENT_GROUPS: { title: string; items: { key: string; label: string }[] }[] = [
  {
    title: "Güvenlik",
    items: [
      { key: "abs", label: "ABS" },
      { key: "esp", label: "ESP" },
      { key: "hava-yastigi-surucu", label: "Sürücü Hava Yastığı" },
      { key: "hava-yastigi-yolcu", label: "Yolcu Hava Yastığı" },
      { key: "hava-yastigi-yan", label: "Yan Hava Yastığı" },
      { key: "hava-yastigi-perde", label: "Perde Hava Yastığı" },
      { key: "serit-takip", label: "Şerit Takip Sistemi" },
      { key: "kor-nokta-uyari", label: "Kör Nokta Uyarı Sistemi" },
      { key: "cocuk-kilidi", label: "Çocuk Kilidi" },
      { key: "yokus-kalkis-destegi", label: "Yokuş Kalkış Desteği" },
      { key: "isofix", label: "Isofix" },
    ],
  },
  {
    title: "İç Donanım",
    items: [
      { key: "klima-manuel", label: "Klima (Manuel)" },
      { key: "klima-dijital", label: "Klima (Dijital/Otomatik)" },
      { key: "deri-koltuk", label: "Deri Koltuk" },
      { key: "isitmali-koltuklar", label: "Isıtmalı Koltuklar" },
      { key: "elektrikli-koltuklar", label: "Elektrikli Koltuklar" },
      { key: "hiz-sabitleme", label: "Hız Sabitleme (Cruise Control)" },
      { key: "adaptive-cruise", label: "Adaptive Cruise Control" },
      { key: "anahtarsiz-calistirma", label: "Anahtarsız Çalıştırma" },
      { key: "start-stop", label: "Start/Stop Sistemi" },
    ],
  },
  {
    title: "Dış Donanım",
    items: [
      { key: "sunroof", label: "Sunroof" },
      { key: "panoramik-tavan", label: "Panoramik Tavan" },
      { key: "park-sensoru-on", label: "Park Sensörü (Ön)" },
      { key: "park-sensoru-arka", label: "Park Sensörü (Arka)" },
      { key: "geri-gorus-kamerasi", label: "Geri Görüş Kamerası" },
      { key: "led-far", label: "LED Far" },
      { key: "xenon-far", label: "Xenon Far" },
      { key: "elektrikli-aynalar", label: "Elektrikli Aynalar" },
      { key: "isitmali-aynalar", label: "Isıtmalı Aynalar" },
    ],
  },
  {
    title: "Multimedya",
    items: [
      { key: "android-auto", label: "Android Auto" },
      { key: "apple-carplay", label: "Apple CarPlay" },
      { key: "bluetooth", label: "Bluetooth" },
      { key: "navigasyon", label: "Navigasyon" },
      { key: "usb", label: "USB" },
    ],
  },
];

export const ALL_EQUIPMENT_KEYS = EQUIPMENT_GROUPS.flatMap((g) => g.items.map((i) => i.key));

export function equipmentLabel(key: string): string {
  for (const group of EQUIPMENT_GROUPS) {
    const item = group.items.find((i) => i.key === key);
    if (item) return item.label;
  }
  return key;
}

// --- TRAMER amount -> overall damage status ---

// TRAMER kaydı bu tutarın (TL) üzerindeyse "Ağır Hasar Kayıtlı / Pert" kabul edilir.
export const TRAMER_AGIR_HASAR_THRESHOLD = 100_000;

export function deriveDamageStatus(tramerAmount: number | null | undefined): string {
  if (!tramerAmount || tramerAmount <= 0) return "hasarsiz";
  if (tramerAmount >= TRAMER_AGIR_HASAR_THRESHOLD) return "agir-hasarli";
  return "hasar-kayitli";
}
