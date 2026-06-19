import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { hashPassword } from "../src/lib/password";
import { ALL_DAMAGE_PART_KEYS, type DamagePartStatus } from "../src/lib/car-data";
import { CATEGORY_TREE, type CategoryNode } from "../src/lib/categories";
import { generateListingNo } from "../src/lib/listing-no";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

function nextListingNo(used: Set<string>): string {
  let no = generateListingNo();
  while (used.has(no)) {
    no = generateListingNo();
  }
  used.add(no);
  return no;
}

function buildDamageInfo(overrides: Record<string, DamagePartStatus> = {}) {
  const info: Record<string, DamagePartStatus> = {};
  for (const key of ALL_DAMAGE_PART_KEYS) {
    info[key] = overrides[key] ?? "orijinal";
  }
  return info;
}

function genericPlaceholderSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <rect width="400" height="300" fill="#F1F5F9"/>
  <g transform="translate(150,112)" fill="none" stroke="#CBD5E1" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="0" y="0" width="100" height="76" rx="8" />
    <circle cx="24" cy="24" r="9" />
    <path d="M0 60 L28 36 L52 56 L72 38 L100 60" />
  </g>
</svg>`;
}

const COLOR_PALETTE: Record<string, string> = {
  blue: "#2563eb",
  slate: "#334155",
  emerald: "#059669",
  amber: "#d97706",
  rose: "#e11d48",
  indigo: "#4f46e5",
  teal: "#0d9488",
  zinc: "#52525b",
  cyan: "#0891b2",
  violet: "#7c3aed",
  orange: "#ea580c",
  lime: "#65a30d",
};

// Gerçek araç fotoğrafları (public/uploads/seed/cars/) - renk anahtarı başına
// ön/yan görsel eşlemesi. Görseller serbest lisanslı (Unsplash) stok fotoğraflardır.
const CAR_PHOTO_FRONT: Record<string, string> = {
  emerald: "car-15", indigo: "car-05", teal: "car-19", cyan: "car-04",
  zinc: "car-01", blue: "car-14", amber: "car-12", violet: "car-06",
  rose: "car-02", orange: "car-11", lime: "car-09", slate: "car-03",
};
const CAR_PHOTO_SIDE: Record<string, string> = {
  emerald: "car-07", indigo: "car-08", teal: "car-10", cyan: "car-13",
  zinc: "car-16", blue: "car-17", amber: "car-18", violet: "car-05",
  rose: "car-19", orange: "car-01", lime: "car-15", slate: "car-14",
};

async function ensurePlaceholderImages() {
  const dir = path.join(process.cwd(), "public", "uploads", "seed");
  await mkdir(dir, { recursive: true });

  const car: Record<string, [string, string]> = {};
  const generic: Record<string, [string, string]> = {};

  for (const name of Object.keys(COLOR_PALETTE)) {
    car[name] = [
      `/uploads/seed/cars/${CAR_PHOTO_FRONT[name]}.jpg`,
      `/uploads/seed/cars/${CAR_PHOTO_SIDE[name]}.jpg`,
    ];

    const a = `${name}-a.svg`;
    const b = `${name}-b.svg`;
    await writeFile(path.join(dir, a), genericPlaceholderSvg());
    await writeFile(path.join(dir, b), genericPlaceholderSvg());
    generic[name] = [`/uploads/seed/${a}`, `/uploads/seed/${b}`];
  }

  return { car, generic };
}

// upsert kullanır (create değil): kategoriler gerçek ilanlar tarafından
// referans alınabildiği için seed tekrar çalıştırıldığında ID'leri sabit
// kalmalı - aksi halde gerçek ilanların categoryId'si geçersiz kalır.
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

type VehicleSeed = {
  title: string;
  brand: string;
  model: string;
  series: string;
  year: number;
  km: number;
  price: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  enginePower: string;
  engineVolume: string | null;
  drivetrain: string;
  description: string;
  damageStatus: string;
  damageOverrides?: Record<string, DamagePartStatus>;
  il: string;
  ilce: string;
  categorySlug: string;
  isFeatured: boolean;
  colorKey: string;
};

type SimpleSeed = {
  title: string;
  description: string;
  price: number;
  il: string;
  ilce: string;
  categorySlug: string;
  colorKey: string;
  isFeatured?: boolean;
};

// İlk yayın sürümünde Vasıta ilan girişine kapalı ("çok yakında", bkz.
// ARAC_EMLAK_AKTIF) - bu yüzden burada sadece az sayıda örnek araç tutulur.
// Bayrak açıldığında bu liste tekrar genişletilebilir; kod silinmedi.
const VEHICLES: VehicleSeed[] = [
  {
    title: "Toyota Corolla 1.6 Vision",
    brand: "Toyota",
    model: "Corolla",
    series: "1.6 Vision",
    year: 2023,
    km: 28000,
    price: 2150000,
    fuelType: "Benzin",
    transmission: "Otomatik",
    bodyType: "Sedan",
    color: "Beyaz",
    enginePower: "132 hp",
    engineVolume: "1.6",
    drivetrain: "Önden Çekiş",
    description:
      "2023 model, garanti süresi devam ediyor. Yetkili serviste bakımlı, hatasız ve boyasızdır.",
    damageStatus: "hasarsiz",
    il: "İstanbul",
    ilce: "Kadıköy",
    categorySlug: "otomobil",
    isFeatured: false,
    colorKey: "emerald",
  },
  {
    title: "BMW 3 Serisi 320i M Sport",
    brand: "BMW",
    model: "3 Serisi",
    series: "320i M Sport",
    year: 2021,
    km: 62000,
    price: 3250000,
    fuelType: "Benzin",
    transmission: "Otomatik",
    bodyType: "Sedan",
    color: "Siyah",
    enginePower: "184 hp",
    engineVolume: "2.0",
    drivetrain: "Arkadan İtiş",
    description:
      "M Sport donanım paketi, orijinal 18 jant ve head-up display mevcut. Ön tampon lokal, sağ ön kapı boyalıdır.",
    damageStatus: "hasar-kayitli",
    damageOverrides: { "on-tampon": "lokal-boyali", "kapi-sag-on": "boyali" },
    il: "Ankara",
    ilce: "Çankaya",
    categorySlug: "otomobil",
    isFeatured: false,
    colorKey: "indigo",
  },
  {
    title: "Hyundai Tucson 1.6 CRDi Elite",
    brand: "Hyundai",
    model: "Tucson",
    series: "1.6 CRDi Elite",
    year: 2022,
    km: 41000,
    price: 2650000,
    fuelType: "Dizel",
    transmission: "Otomatik",
    bodyType: "SUV",
    color: "Gri",
    enginePower: "136 hp",
    engineVolume: "1.6",
    drivetrain: "4x4",
    description:
      "Tek elden, düşük kilometrede. Isıtmalı koltuklar ve geri görüş kamerası mevcuttur.",
    damageStatus: "hasarsiz",
    il: "İzmir",
    ilce: "Bornova",
    categorySlug: "arazi-suv-pickup",
    isFeatured: false,
    colorKey: "teal",
  },
  {
    title: "TOGG T10X V2 Long Range RWD",
    brand: "TOGG",
    model: "T10X",
    series: "V2 Long Range RWD",
    year: 2024,
    km: 15000,
    price: 2050000,
    fuelType: "Elektrik",
    transmission: "Otomatik",
    bodyType: "SUV",
    color: "Beyaz",
    enginePower: "218 hp",
    engineVolume: null,
    drivetrain: "Arkadan İtiş",
    description:
      "Yerli ve milli elektrikli SUV. Hızlı şarj desteği, yaklaşık 500 km menzil. Sıfır ayarındadır.",
    damageStatus: "hasarsiz",
    il: "Bursa",
    ilce: "Nilüfer",
    categorySlug: "elektrikli-araclar",
    isFeatured: false,
    colorKey: "cyan",
  },
  {
    title: "Volkswagen Golf 1.5 TSI Style",
    brand: "Volkswagen",
    model: "Golf",
    series: "1.5 TSI Style",
    year: 2022,
    km: 35000,
    price: 1950000,
    fuelType: "Benzin",
    transmission: "Otomatik",
    bodyType: "Hatchback/5",
    color: "Gri",
    enginePower: "150 hp",
    engineVolume: "1.5",
    drivetrain: "Önden Çekiş",
    description:
      "Dijital gösterge paneli, IQ Light farlar. Sadece kaput lokal boyalıdır, başka boya/değişen yoktur.",
    damageStatus: "hasar-kayitli",
    damageOverrides: { kaput: "lokal-boyali" },
    il: "Antalya",
    ilce: "Muratpaşa",
    categorySlug: "otomobil",
    isFeatured: false,
    colorKey: "blue",
  },
  {
    title: "Renault Megane Sedan 1.5 dCi Touch",
    brand: "Renault",
    model: "Megane",
    series: "1.5 dCi Touch",
    year: 2017,
    km: 178000,
    price: 620000,
    fuelType: "Dizel",
    transmission: "Manuel",
    bodyType: "Sedan",
    color: "Bordo",
    enginePower: "90 hp",
    engineVolume: "1.5",
    drivetrain: "Önden Çekiş",
    description:
      "Ağır hasar kayıtlı. Motor ve şanzıman sorunsuz çalışmaktadır, parça niyetine veya tamir edilerek kullanıma uygundur. Fiyatında ciddi pazarlık payı vardır.",
    damageStatus: "agir-hasarli",
    damageOverrides: {
      "on-tampon": "degisen",
      kaput: "degisen",
      "camurluk-sag-on": "degisen",
      "camurluk-sol-on": "degisen",
      "kapi-sag-on": "boyali",
      tavan: "lokal-boyali",
    },
    il: "Şanlıurfa",
    ilce: "Haliliye",
    categorySlug: "hasarli-araclar",
    isFeatured: false,
    colorKey: "cyan",
  },
];

const EMLAK_LISTINGS: SimpleSeed[] = [
  {
    title: "Kadıköy'de Deniz Manzaralı Satılık 3+1 Daire",
    description:
      "Sahile yürüme mesafesinde, güneş gören, asansörlü ve kombili. Eşyalı teslim edilebilir 3+1 daire.",
    price: 8750000,
    il: "İstanbul",
    ilce: "Kadıköy",
    categorySlug: "konut",
    colorKey: "blue",
  },
  {
    title: "Çankaya Merkezde Yatırımlık Dükkan",
    description: "Ana cadde üzerinde, yüksek tabela alanına sahip, kirada yatırımlık dükkan.",
    price: 6400000,
    il: "Ankara",
    ilce: "Çankaya",
    categorySlug: "is-yeri",
    colorKey: "slate",
  },
  {
    title: "Bodrum'da Deniz Manzaralı İmarlı Arsa",
    description: "1.000 m² imarlı, deniz manzaralı, villa inşaatına uygun ve tapulu arsa.",
    price: 12500000,
    il: "Muğla",
    ilce: "Bodrum",
    categorySlug: "arsa",
    colorKey: "teal",
  },
  {
    title: "Yeni Projede Teslime Hazır 2+1 Daire",
    description:
      "Sosyal donanımlı sitede, otoparklı ve kapalı yüzme havuzlu. Anahtar teslim 2+1 daire.",
    price: 4950000,
    il: "İzmir",
    ilce: "Bornova",
    categorySlug: "konut-projeleri",
    colorKey: "emerald",
  },
  {
    title: "Antalya'da Tatil Köyünde Devre Mülk",
    description:
      "Yılda bir hafta kullanım hakkı, havuzlu site içinde, deniz manzaralı devre mülk fırsatı.",
    price: 980000,
    il: "Antalya",
    ilce: "Konyaaltı",
    categorySlug: "devre-mulk",
    colorKey: "amber",
  },
];

// İlk yayın sürümünde vitrin ve "Son Eklenen İlanlar" bu kategoriye odaklanır
// (bkz. ARAC_EMLAK_AKTIF). Son ilan ("iPhone 15 Pro Max...") bilinçli olarak
// dolandırıcılık sinyalleri (anormal ucuz + aciliyet/kapora baskısı dili)
// içerir; yapay zeka/kural tabanlı güven puanı denetiminin gerçekten
// çalıştığını göstermek için eklenmiştir - diğer tüm ilanlar dürüst ve
// eksiksizdir.
const IKINCI_EL_LISTINGS: SimpleSeed[] = [
  // --- cep-telefonu ---
  {
    title: "iPhone 14 Pro 256GB Mor Renk Temiz",
    description:
      "Kutulu ve faturalı, batarya sağlığı %92. Ekran koruyucu ve kılıfla birlikte satılır. Çizik veya darbe izi yoktur, kendim kullandım.",
    price: 42000,
    il: "İstanbul",
    ilce: "Üsküdar",
    categorySlug: "cep-telefonu",
    colorKey: "rose",
    isFeatured: true,
  },
  {
    title: "Samsung Galaxy S23 Ultra 512GB Krem",
    description:
      "Faturalı, tüm aksesuarları kutusunda. S Pen dahildir. Ekranda koruyucu cam takılı, çizik yoktur.",
    price: 39500,
    il: "Bursa",
    ilce: "Nilüfer",
    categorySlug: "cep-telefonu",
    colorKey: "indigo",
  },
  {
    title: "Xiaomi Redmi Note 12 Pro 128GB",
    description: "8 ay kullanıldı, garantisi devam ediyor. Orijinal kutu ve şarj aleti mevcuttur.",
    price: 13500,
    il: "Konya",
    ilce: "Selçuklu",
    categorySlug: "cep-telefonu",
    colorKey: "teal",
  },
  {
    title: "iPhone 15 Pro Max 256GB Acil Satılık",
    description:
      "Faturasız acil satılık, bugün gelen alır. Sadece havale/EFT ile kapora alınır, pazarlık yok kesin fiyat.",
    price: 6000,
    il: "Adana",
    ilce: "Seyhan",
    categorySlug: "cep-telefonu",
    colorKey: "orange",
  },

  // --- bilgisayar ---
  {
    title: "MacBook Air M2 13 inç 8GB/256GB",
    description:
      "2023 model, az kullanılmış. Orijinal kutusu ve şarj aleti mevcut, garantisi devam ediyor. Pil döngü sayısı 85.",
    price: 38500,
    il: "Ankara",
    ilce: "Yenimahalle",
    categorySlug: "bilgisayar",
    colorKey: "indigo",
    isFeatured: true,
  },
  {
    title: "Lenovo ThinkPad X1 Carbon Gen 10",
    description:
      "i7 / 16GB RAM / 512GB SSD. İş amaçlı kullanıldı, tüm bakımları yapılmıştır. Orijinal şarj aleti dahildir.",
    price: 32000,
    il: "İstanbul",
    ilce: "Şişli",
    categorySlug: "bilgisayar",
    colorKey: "zinc",
  },
  {
    title: "Asus ROG Strix G15 Gaming Laptop",
    description:
      "RTX 3060 / Ryzen 7 / 16GB RAM. Oyun performansı yüksek, kasası temiz. Kutusu ve faturası mevcuttur.",
    price: 45000,
    il: "İzmir",
    ilce: "Karşıyaka",
    categorySlug: "bilgisayar",
    colorKey: "violet",
  },

  // --- ev-elektronigi ---
  {
    title: "LG 55 inç OLED 4K Smart TV",
    description:
      "1 yıllık, ekranda hiçbir piksel hatası yoktur. Orijinal kutusu ve uzaktan kumandası mevcuttur, taşınma nedeniyle satılıktır.",
    price: 28000,
    il: "Antalya",
    ilce: "Muratpaşa",
    categorySlug: "ev-elektronigi",
    colorKey: "cyan",
    isFeatured: true,
  },
  {
    title: "Dyson V11 Kablosuz Şarjlı Süpürge",
    description: "8 ay kullanıldı, tüm başlıkları ve şarj standı eksiksizdir. Garantisi devam ediyor.",
    price: 9500,
    il: "Kocaeli",
    ilce: "İzmit",
    categorySlug: "ev-elektronigi",
    colorKey: "slate",
  },
  {
    title: "Bosch 9 kg Çamaşır Makinesi A+++",
    description:
      "Taşınma nedeniyle satılık, çalışır ve bakımlıdır. Yaklaşık 2 yaşında, hiçbir arızası yoktur.",
    price: 11000,
    il: "Eskişehir",
    ilce: "Odunpazarı",
    categorySlug: "ev-elektronigi",
    colorKey: "blue",
  },

  // --- fotograf-kamera ---
  {
    title: "Sony Alpha A7 III + 28-70mm Lens",
    description: "Az kullanılmış, deklanşör sayısı düşük. Çanta ve yedek batarya hediyedir.",
    price: 58000,
    il: "İzmir",
    ilce: "Karşıyaka",
    categorySlug: "fotograf-kamera",
    colorKey: "zinc",
    isFeatured: true,
  },
  {
    title: "Canon EOS M50 + 15-45mm Kit Lens",
    description: "Vlog ve fotoğrafçılık için ideal, az kullanılmış. Hafıza kartı ve çanta dahildir.",
    price: 19500,
    il: "Trabzon",
    ilce: "Ortahisar",
    categorySlug: "fotograf-kamera",
    colorKey: "amber",
  },

  // --- giyim-aksesuar ---
  {
    title: "Hakiki Deri Erkek Ceket L Beden",
    description: "1-2 kez giyildi, yeni gibi. Marka mağazasından alınmıştır, faturası mevcuttur.",
    price: 4200,
    il: "İstanbul",
    ilce: "Beşiktaş",
    categorySlug: "giyim-aksesuar",
    colorKey: "rose",
  },
  {
    title: "Nike Air Max 90 Sıfır Kutusunda 42 Numara",
    description: "Hiç giyilmedi, kutusunda ve etiketlidir. Hediye gelip beden uymadığı için satılıktır.",
    price: 3300,
    il: "Ankara",
    ilce: "Çankaya",
    categorySlug: "giyim-aksesuar",
    colorKey: "lime",
  },

  // --- saat ---
  {
    title: "Casio G-Shock GA-2100 Siyah",
    description: "Yeni gibi, az kullanıldı. Orijinal kutusu ve garanti belgesi mevcuttur.",
    price: 3800,
    il: "Bursa",
    ilce: "Osmangazi",
    categorySlug: "saat",
    colorKey: "zinc",
    isFeatured: true,
  },
  {
    title: "Michael Kors Kadın Kol Saati",
    description: "Az kullanıldı, kayışı orijinaldir. Hediye alınmıştı, kutusu mevcuttur.",
    price: 2900,
    il: "İstanbul",
    ilce: "Kadıköy",
    categorySlug: "saat",
    colorKey: "violet",
  },

  // --- anne-bebek ---
  {
    title: "Chicco Travel Sistem Bebek Arabası",
    description:
      "Puset, oto koltuğu ve taşıma kolu dahil tam set. Temiz kullanılmıştır, yıkanmış ve dezenfekte edilmiştir.",
    price: 6500,
    il: "İzmir",
    ilce: "Bornova",
    categorySlug: "anne-bebek",
    colorKey: "teal",
  },
  {
    title: "Ahşap Beşik + Yatak Seti",
    description: "Çocuğumuz büyüdüğü için satılıktır, sallanabilir özellikli, eksiksiz ve sağlamdır.",
    price: 3200,
    il: "Konya",
    ilce: "Selçuklu",
    categorySlug: "anne-bebek",
    colorKey: "amber",
  },

  // --- kitap-dergi-film-muzik ---
  {
    title: "Kişisel Gelişim Kitap Seti (20 Kitap)",
    description: "Temiz ve az okunmuş 20 kitaplık set. Kargo ile gönderilebilir.",
    price: 1200,
    il: "Ankara",
    ilce: "Keçiören",
    categorySlug: "kitap-dergi-film-muzik",
    colorKey: "slate",
  },
  {
    title: "Türkçe Pop Vinil Plak Koleksiyonu (35 Adet)",
    description: "1980-1990 dönemi orijinal plaklar, iyi durumda saklanmıştır. Liste talep üzerine gönderilir.",
    price: 7500,
    il: "İstanbul",
    ilce: "Beyoğlu",
    categorySlug: "kitap-dergi-film-muzik",
    colorKey: "cyan",
  },

  // --- spor ---
  {
    title: "Trek Marlin 7 Dağ Bisikleti L Beden",
    description: "27.5 jant, hidrolik disk fren. Az kullanılmış, bakımları yapılmıştır.",
    price: 24000,
    il: "Antalya",
    ilce: "Muratpaşa",
    categorySlug: "spor",
    colorKey: "lime",
    isFeatured: true,
  },
  {
    title: "Ev Fitness Seti (Halter + Bench + Disk)",
    description: "50 kg disk seti, ayarlanabilir bench ve halter çubuğu dahildir. Az kullanılmıştır.",
    price: 8500,
    il: "Mersin",
    ilce: "Yenişehir",
    categorySlug: "spor",
    colorKey: "orange",
  },
  {
    title: "Decathlon Kayak Takımı (Bot + Kayak + Baton)",
    description: "2 sezon kullanıldı, bakımlıdır. Bot numarası 42, kayak boyu 165 cm.",
    price: 9000,
    il: "Bolu",
    ilce: "Merkez",
    categorySlug: "spor",
    colorKey: "indigo",
  },

  // --- muzik-enstrumanlari ---
  {
    title: "Yamaha F310 Akustik Gitar Seti",
    description: "Çanta, kapo ve ekstra tel takımıyla birlikte. Yeni gibi temiz kullanım.",
    price: 6500,
    il: "Bursa",
    ilce: "Osmangazi",
    categorySlug: "muzik-enstrumanlari",
    colorKey: "violet",
    isFeatured: true,
  },
  {
    title: "Casio Privia PX-160 Dijital Piyano",
    description: "88 tuş, ağırlıklı tuş mekanizması. Standı ve pedalı dahildir, az kullanılmıştır.",
    price: 14500,
    il: "İzmir",
    ilce: "Konak",
    categorySlug: "muzik-enstrumanlari",
    colorKey: "blue",
  },

  // --- koleksiyon ---
  {
    title: "Eski Türk Lirası Madeni Para Koleksiyonu",
    description: "1970-2005 dönemi madeni paralardan oluşan 80 parçalık koleksiyon, albümlüdür.",
    price: 4500,
    il: "Ankara",
    ilce: "Çankaya",
    categorySlug: "koleksiyon",
    colorKey: "amber",
  },
  {
    title: "Dünya Pulları Koleksiyon Albümü",
    description: "40 yılı kapsayan, 300'den fazla farklı ülke pulu içeren albüm. İyi korunmuştur.",
    price: 3100,
    il: "İstanbul",
    ilce: "Bakırköy",
    categorySlug: "koleksiyon",
    colorKey: "teal",
  },

  // --- taki-mucevher ---
  {
    title: "22 Ayar Bilezik 25 Gram",
    description: "Has altın bilezik, ayar damgalıdır. Kuyumcu faturası mevcuttur.",
    price: 62000,
    il: "İstanbul",
    ilce: "Fatih",
    categorySlug: "taki-mucevher",
    colorKey: "amber",
  },
  {
    title: "925 Gümüş Kolye ve Küpe Seti",
    description: "Yeni gibi, 2 kez takıldı. Orijinal kutusunda, hediye alınmıştı.",
    price: 1800,
    il: "İzmir",
    ilce: "Karşıyaka",
    categorySlug: "taki-mucevher",
    colorKey: "rose",
  },

  // --- oyun-hobi ---
  {
    title: "PlayStation 5 + 2 Kol + 3 Oyun",
    description:
      "Standart sürüm, kutulu. 2 orijinal DualSense kol ve 3 fiziksel oyun ile birlikte satılır. Garantisi devam ediyor.",
    price: 22000,
    il: "Ankara",
    ilce: "Yenimahalle",
    categorySlug: "oyun-hobi",
    colorKey: "indigo",
    isFeatured: true,
  },
  {
    title: "LEGO Star Wars Millennium Falcon (75192)",
    description: "Hiç açılmadı, kutusu mühürlüdür. Koleksiyonluk, sınırlı üretim setidir.",
    price: 18500,
    il: "İstanbul",
    ilce: "Ataşehir",
    categorySlug: "oyun-hobi",
    colorKey: "zinc",
  },

  // --- ev-dekorasyon ---
  {
    title: "IKEA 3'lü Kumaş Oturma Grubu Koltuk",
    description: "1 yıllık, temiz ve lekesizdir. Taşınma nedeniyle satılıktır, kendi imkanınızla alınmalıdır.",
    price: 12500,
    il: "Bursa",
    ilce: "Nilüfer",
    categorySlug: "ev-dekorasyon",
    colorKey: "slate",
  },
  {
    title: "El Dokuması Hereke Desenli Halı 200x300",
    description: "Yünlü, el dokuması. Çok az kullanılmıştır, hiçbir leke veya yıpranma yoktur.",
    price: 15000,
    il: "Kayseri",
    ilce: "Melikgazi",
    categorySlug: "ev-dekorasyon",
    colorKey: "rose",
  },
];

// Gerçekçi satıcı isimleri - "Demo Kullanıcı" gibi sahte/jenerik isimler
// kullanılmaz. demo@ilanlik.com / satici@ilanlik.com giriş bilgileri test
// amaçlı korunur, ancak görünen ad gerçekçi bir kişi adıdır.
const SEED_USERS = [
  { name: "Mehmet Demir", email: "demo@ilanlik.com", phone: "0532 412 67 18" },
  { name: "Ayşe Yılmaz", email: "satici@ilanlik.com", phone: "0533 778 24 05" },
  { name: "Can Öztürk", email: "can.ozturk@ilanlik.com", phone: "0534 221 90 36" },
  { name: "Zeynep Kaya", email: "zeynep.kaya@ilanlik.com", phone: "0535 660 13 82" },
  { name: "Emre Şahin", email: "emre.sahin@ilanlik.com", phone: "0536 304 57 91" },
  { name: "Elif Çelik", email: "elif.celik@ilanlik.com", phone: "0537 845 32 19" },
  { name: "Burak Aydın", email: "burak.aydin@ilanlik.com", phone: "0538 192 76 40" },
];

// SADECE önceki demo verisi (isDemo=true) temizlenir - gerçek kullanıcı/ilan
// verisine ASLA dokunulmaz. Bu sayede seed, gerçek ilanlar girildikten sonra
// tekrar çalıştırılsa bile güvenlidir (örn. demo verisini yenilemek için).
async function main() {
  await prisma.listing.deleteMany({ where: { isDemo: true } });
  await prisma.user.deleteMany({
    where: { OR: [{ isDemo: true }, { email: { in: SEED_USERS.map((u) => u.email) } }] },
  });

  const idBySlug = await seedCategories();
  const images = await ensurePlaceholderImages();

  const password = await hashPassword("demo1234");

  const users = await Promise.all(
    SEED_USERS.map((u) => prisma.user.create({ data: { ...u, password, isDemo: true } })),
  );
  const usedListingNos = new Set<string>();

  for (let i = 0; i < VEHICLES.length; i++) {
    const v = VEHICLES[i];
    const categoryId = idBySlug.get(v.categorySlug);
    if (!categoryId) throw new Error(`Kategori bulunamadı: ${v.categorySlug}`);

    const listing = await prisma.listing.create({
      data: {
        listingNo: nextListingNo(usedListingNos),
        title: v.title,
        brand: v.brand,
        model: v.model,
        series: v.series,
        year: v.year,
        km: v.km,
        price: v.price,
        fuelType: v.fuelType,
        transmission: v.transmission,
        bodyType: v.bodyType,
        color: v.color,
        enginePower: v.enginePower,
        engineVolume: v.engineVolume,
        drivetrain: v.drivetrain,
        description: v.description,
        damageStatus: v.damageStatus,
        damageInfo: JSON.stringify(buildDamageInfo(v.damageOverrides)),
        il: v.il,
        ilce: v.ilce,
        isFeatured: v.isFeatured,
        // Demo ilanlar canlıda gizli kalsın diye "pasif" (yayında değil)
        // olarak oluşturulur - sadece admin panelinden görülebilir. Gerçek
        // ilanlar girilip hazır olununca "Demo Veri Yönetimi"nden tek tıkla
        // kalıcı olarak silinebilir (bkz. isDemo).
        status: "pasif",
        isDemo: true,
        categoryId,
        userId: users[i % users.length].id,
      },
    });

    const [front, side] = images.car[v.colorKey];
    await prisma.listingImage.createMany({
      data: [
        { url: front, order: 0, listingId: listing.id },
        { url: side, order: 1, listingId: listing.id },
      ],
    });
  }

  const simpleListings = [...EMLAK_LISTINGS, ...IKINCI_EL_LISTINGS];
  for (let i = 0; i < simpleListings.length; i++) {
    const s = simpleListings[i];
    const categoryId = idBySlug.get(s.categorySlug);
    if (!categoryId) throw new Error(`Kategori bulunamadı: ${s.categorySlug}`);

    const listing = await prisma.listing.create({
      data: {
        listingNo: nextListingNo(usedListingNos),
        title: s.title,
        description: s.description,
        price: s.price,
        il: s.il,
        ilce: s.ilce,
        isFeatured: s.isFeatured ?? false,
        status: "pasif",
        isDemo: true,
        categoryId,
        userId: users[i % users.length].id,
      },
    });

    const [a, b] = images.generic[s.colorKey];
    await prisma.listingImage.createMany({
      data: [
        { url: a, order: 0, listingId: listing.id },
        { url: b, order: 1, listingId: listing.id },
      ],
    });
  }

  console.log(`Seed tamamlandı: ${idBySlug.size} kategori, ${VEHICLES.length + simpleListings.length} ilan oluşturuldu.`);
  console.log("Tüm demo ilanlar \"pasif\" (yayında değil) olarak oluşturuldu - canlı sitede görünmezler,");
  console.log("sadece admin panelinden (/admin/ilanlar, /admin/demo-verileri) görülebilirler.");
  console.log("Canlıya geçmeden önce admin panelden \"Tüm Demo Verilerini Temizle\" ile kalıcı olarak silebilirsiniz.");
  console.log("Demo giriş bilgileri (tüm hesaplar için şifre: demo1234):");
  for (const u of SEED_USERS) console.log(`  ${u.email} (${u.name})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
