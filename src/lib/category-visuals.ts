import type { ComponentType } from "react";
import {
  Anchor,
  Armchair,
  Bath,
  BedDouble,
  Brush,
  Drill,
  Droplet,
  Flower2,
  Footprints,
  Glasses,
  Guitar,
  HardDrive,
  Keyboard,
  Lightbulb,
  MemoryStick,
  Microwave,
  Monitor,
  Palette,
  Plane,
  Printer,
  Puzzle,
  Refrigerator,
  Router,
  Scissors,
  Snowflake,
  Speaker,
  Tablet,
  Tent,
  Trophy,
  WashingMachine,
  Waves,
  Wind,
  Baby,
  Backpack,
  Beef,
  Bike,
  Bone,
  Book,
  Boxes,
  Briefcase,
  Building,
  Building2,
  Camera,
  Car,
  Castle,
  Code2,
  Cpu,
  Dumbbell,
  Factory,
  Fish,
  Gamepad2,
  Gem,
  GraduationCap,
  Hammer,
  Headphones,
  Home,
  Languages,
  Laptop,
  MapPin,
  Mountain,
  Music2,
  PaintRoller,
  PawPrint,
  Pencil,
  ShieldPlus,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sofa,
  Sparkles,
  Stethoscope,
  Tractor,
  Truck,
  Tv,
  Users,
  Warehouse,
  Watch,
  Wrench,
  Zap,
} from "lucide-react";

export type CategoryThemeKey =
  | "indigo"
  | "sky"
  | "violet"
  | "rose"
  | "emerald"
  | "amber"
  | "cyan"
  | "fuchsia"
  | "lime"
  | "slate";

// Tailwind sınıfları derleme anında statik taranabilmesi için tam metin
// olarak burada tanımlanır (renk adı çalışma zamanında string
// birleştirmeyle üretilemez) - bkz. featured-categories.tsx, listing-card.tsx.
export const CATEGORY_THEME_CLASSES: Record<
  CategoryThemeKey,
  { badge: string; wash: string; glow: string }
> = {
  indigo: {
    badge: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    wash: "from-white to-indigo-50",
    glow: "bg-indigo-400/25",
  },
  sky: {
    badge: "bg-gradient-to-br from-sky-500 to-sky-600",
    wash: "from-white to-sky-50",
    glow: "bg-sky-400/25",
  },
  violet: {
    badge: "bg-gradient-to-br from-violet-500 to-violet-600",
    wash: "from-white to-violet-50",
    glow: "bg-violet-400/25",
  },
  rose: {
    badge: "bg-gradient-to-br from-rose-500 to-rose-600",
    wash: "from-white to-rose-50",
    glow: "bg-rose-400/25",
  },
  emerald: {
    badge: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    wash: "from-white to-emerald-50",
    glow: "bg-emerald-400/25",
  },
  amber: {
    badge: "bg-gradient-to-br from-amber-500 to-amber-600",
    wash: "from-white to-amber-50",
    glow: "bg-amber-400/25",
  },
  cyan: {
    badge: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    wash: "from-white to-cyan-50",
    glow: "bg-cyan-400/25",
  },
  fuchsia: {
    badge: "bg-gradient-to-br from-fuchsia-500 to-fuchsia-600",
    wash: "from-white to-fuchsia-50",
    glow: "bg-fuchsia-400/25",
  },
  lime: {
    badge: "bg-gradient-to-br from-lime-500 to-lime-600",
    wash: "from-white to-lime-50",
    glow: "bg-lime-400/25",
  },
  slate: {
    badge: "bg-gradient-to-br from-slate-500 to-slate-600",
    wash: "from-white to-slate-50",
    glow: "bg-slate-400/25",
  },
};

type CategoryVisual = { icon: ComponentType<{ className?: string }>; theme: CategoryThemeKey };

// Kategori slug'ına göre ikon + renk teması - ilan görseli olmadığında
// (bkz. listing-card.tsx) ve kategori kartlarında/sol menüde (bkz.
// featured-categories.tsx, category-sidebar.tsx) kullanılır. Eşleşme
// bulunamazsa DEFAULT_CATEGORY_VISUAL'a düşer.
export const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  // Üst kategori başlıkları (sol menüdeki ana satırlar)
  emlak: { icon: Home, theme: "indigo" },
  vasita: { icon: Car, theme: "rose" },
  "yedek-parca-aksesuar-donanim-tuning": { icon: Wrench, theme: "slate" },
  elektronik: { icon: Smartphone, theme: "indigo" },
  "ev-yasam": { icon: Sofa, theme: "amber" },
  "is-makineleri-sanayi": { icon: Factory, theme: "amber" },
  "hayvanlar-alemi": { icon: PawPrint, theme: "lime" },

  // Elektronik
  telefon: { icon: Smartphone, theme: "indigo" },
  "cep-telefonu": { icon: Smartphone, theme: "indigo" },
  tablet: { icon: Tablet, theme: "sky" },
  "akilli-saat-bileklik": { icon: Watch, theme: "fuchsia" },
  "telefon-aksesuarlari": { icon: Headphones, theme: "violet" },
  "telefon-kilif": { icon: Smartphone, theme: "indigo" },
  "telefon-sarj-kablo": { icon: Zap, theme: "amber" },
  "telefon-kulaklik": { icon: Headphones, theme: "violet" },
  powerbank: { icon: Zap, theme: "lime" },
  "ekran-koruyucu": { icon: Smartphone, theme: "sky" },
  bilgisayar: { icon: Laptop, theme: "sky" },
  "dizustu-bilgisayar": { icon: Laptop, theme: "sky" },
  "masaustu-bilgisayar": { icon: Monitor, theme: "slate" },
  "bilgisayar-bilesenleri": { icon: Cpu, theme: "violet" },
  "ekran-karti": { icon: Cpu, theme: "violet" },
  islemci: { icon: Cpu, theme: "rose" },
  ram: { icon: MemoryStick, theme: "emerald" },
  "ssd-harddisk": { icon: HardDrive, theme: "slate" },
  anakart: { icon: Cpu, theme: "cyan" },
  "guc-kaynagi": { icon: Zap, theme: "amber" },
  monitor: { icon: Monitor, theme: "slate" },
  "klavye-mouse": { icon: Keyboard, theme: "indigo" },
  "yazici-tarayici": { icon: Printer, theme: "cyan" },
  "ag-urunleri": { icon: Router, theme: "sky" },
  "tv-ses-goruntu": { icon: Tv, theme: "violet" },
  televizyon: { icon: Tv, theme: "violet" },
  "ev-elektronigi": { icon: Tv, theme: "violet" },
  "hoparlor-ses-sistemi": { icon: Speaker, theme: "rose" },
  kulaklik: { icon: Headphones, theme: "violet" },
  projeksiyon: { icon: Tv, theme: "sky" },
  "fotograf-kamera": { icon: Camera, theme: "cyan" },
  "fotograf-makinesi": { icon: Camera, theme: "cyan" },
  lens: { icon: Camera, theme: "slate" },
  "aksiyon-kamera": { icon: Camera, theme: "rose" },
  drone: { icon: Plane, theme: "sky" },

  // Ev & Yaşam
  mobilya: { icon: Armchair, theme: "amber" },
  "koltuk-kanepe": { icon: Sofa, theme: "amber" },
  "masa-sandalye": { icon: Armchair, theme: "lime" },
  "yatak-odasi": { icon: BedDouble, theme: "violet" },
  "dolap-vestiyer": { icon: Boxes, theme: "slate" },
  "tv-unitesi": { icon: Tv, theme: "slate" },
  "bahce-mobilyasi": { icon: Flower2, theme: "lime" },
  "diger-mobilya": { icon: Sofa, theme: "slate" },
  "beyaz-esya": { icon: Refrigerator, theme: "sky" },
  buzdolabi: { icon: Refrigerator, theme: "sky" },
  "camasir-makinesi": { icon: WashingMachine, theme: "cyan" },
  "bulasik-makinesi": { icon: WashingMachine, theme: "indigo" },
  "firin-ocak": { icon: Microwave, theme: "rose" },
  "kurutma-makinesi": { icon: Wind, theme: "sky" },
  klima: { icon: Snowflake, theme: "cyan" },
  "kucuk-ev-aletleri": { icon: Microwave, theme: "cyan" },
  "elektrikli-supurge": { icon: Wind, theme: "violet" },
  utu: { icon: Zap, theme: "rose" },
  "blender-mutfak-robotu": { icon: Microwave, theme: "lime" },
  "kahve-makinesi": { icon: Microwave, theme: "amber" },
  "su-isitici-cayci": { icon: Droplet, theme: "sky" },
  "tost-izgara": { icon: Microwave, theme: "rose" },
  dekorasyon: { icon: Palette, theme: "fuchsia" },
  "dekoratif-aksesuar": { icon: Gem, theme: "fuchsia" },
  "tablo-cerceve": { icon: Palette, theme: "violet" },
  "vazo-saksi": { icon: Flower2, theme: "lime" },
  ayna: { icon: Sparkles, theme: "cyan" },
  aydinlatma: { icon: Lightbulb, theme: "amber" },
  "hali-kilim": { icon: Boxes, theme: "rose" },
  "ev-tekstili": { icon: Shirt, theme: "rose" },
  perde: { icon: Shirt, theme: "violet" },
  nevresim: { icon: BedDouble, theme: "sky" },
  "havlu-bornoz": { icon: Bath, theme: "cyan" },
  "mutfak-gerecleri": { icon: Microwave, theme: "lime" },
  "tencere-tava": { icon: Microwave, theme: "slate" },
  "sofra-servis": { icon: Microwave, theme: "amber" },
  "saklama-kabi": { icon: Boxes, theme: "emerald" },

  // Moda & Giyim
  "giyim-aksesuar": { icon: Shirt, theme: "rose" },
  "kadin-giyim": { icon: Shirt, theme: "rose" },
  "kadin-elbise": { icon: Shirt, theme: "rose" },
  "kadin-ust-giyim": { icon: Shirt, theme: "fuchsia" },
  "kadin-alt-giyim": { icon: Shirt, theme: "violet" },
  "kadin-dis-giyim": { icon: Shirt, theme: "indigo" },
  "kadin-ic-giyim": { icon: Shirt, theme: "rose" },
  "erkek-giyim": { icon: Shirt, theme: "sky" },
  "erkek-ust-giyim": { icon: Shirt, theme: "sky" },
  "erkek-alt-giyim": { icon: Shirt, theme: "cyan" },
  "erkek-dis-giyim": { icon: Shirt, theme: "indigo" },
  "takim-elbise": { icon: Shirt, theme: "slate" },
  "cocuk-giyim": { icon: Shirt, theme: "lime" },
  ayakkabi: { icon: Footprints, theme: "amber" },
  "kadin-ayakkabi": { icon: Footprints, theme: "rose" },
  "erkek-ayakkabi": { icon: Footprints, theme: "sky" },
  "spor-ayakkabi": { icon: Footprints, theme: "emerald" },
  canta: { icon: Backpack, theme: "amber" },
  saat: { icon: Watch, theme: "fuchsia" },
  "taki-mucevher": { icon: Gem, theme: "fuchsia" },
  gozluk: { icon: Glasses, theme: "slate" },
  "giyim-aksesuar-diger": { icon: Sparkles, theme: "violet" },

  // Anne & Bebek
  "anne-bebek": { icon: Baby, theme: "rose" },
  "bebek-arabasi": { icon: Baby, theme: "rose" },
  "bebek-giyim": { icon: Shirt, theme: "fuchsia" },
  "bebek-oyuncak": { icon: Puzzle, theme: "amber" },
  "bebek-bakim": { icon: Droplet, theme: "sky" },
  "bebek-odasi": { icon: BedDouble, theme: "violet" },
  "oto-koltugu": { icon: Baby, theme: "lime" },

  // Spor & Outdoor
  spor: { icon: Dumbbell, theme: "emerald" },
  "fitness-kondisyon": { icon: Dumbbell, theme: "emerald" },
  bisiklet: { icon: Bike, theme: "sky" },
  "kamp-doga": { icon: Tent, theme: "lime" },
  "spor-giyim": { icon: Shirt, theme: "emerald" },
  "scooter-paten": { icon: Bike, theme: "violet" },
  "su-sporlari": { icon: Waves, theme: "cyan" },
  "takim-sporlari": { icon: Trophy, theme: "amber" },

  // Hobi & Eğlence
  "hobi-oyuncak": { icon: Gamepad2, theme: "emerald" },
  "konsol-oyun": { icon: Gamepad2, theme: "violet" },
  "oyun-konsolu": { icon: Gamepad2, theme: "violet" },
  "konsol-oyunlari": { icon: Gamepad2, theme: "indigo" },
  "oyuncu-ekipmanlari": { icon: Headphones, theme: "violet" },
  muzik: { icon: Music2, theme: "violet" },
  gitar: { icon: Guitar, theme: "amber" },
  "klavye-piyano": { icon: Music2, theme: "slate" },
  "diger-enstruman": { icon: Music2, theme: "rose" },
  "kitap-dergi-film": { icon: Book, theme: "sky" },
  antika: { icon: Gem, theme: "amber" },
  "el-isi-hobi": { icon: Palette, theme: "fuchsia" },
  oyuncak: { icon: Puzzle, theme: "rose" },

  // Kişisel Bakım & Kozmetik
  "kisisel-bakim-kozmetik": { icon: Sparkles, theme: "fuchsia" },
  parfum: { icon: Droplet, theme: "violet" },
  "cilt-bakimi": { icon: Sparkles, theme: "rose" },
  makyaj: { icon: Brush, theme: "fuchsia" },
  "sac-bakimi": { icon: Scissors, theme: "amber" },
  "tiras-epilasyon": { icon: Scissors, theme: "sky" },

  // Ofis & Kırtasiye
  "ofis-kirtasiye": { icon: Pencil, theme: "cyan" },
  "ofis-mobilyasi": { icon: Armchair, theme: "slate" },
  "kirtasiye-malzemeleri": { icon: Pencil, theme: "cyan" },
  "yazici-sarf": { icon: Printer, theme: "indigo" },

  // Bahçe & Yapı Market
  "bahce-yapi-market": { icon: Hammer, theme: "lime" },
  "bahce-aletleri": { icon: Flower2, theme: "lime" },
  "el-aletleri": { icon: Wrench, theme: "slate" },
  "elektrikli-aletler": { icon: Drill, theme: "amber" },
  hirdavat: { icon: Hammer, theme: "slate" },
  "banyo-yapi": { icon: Bath, theme: "cyan" },

  diger: { icon: Boxes, theme: "slate" },

  // Yedek Parça, Aksesuar, Donanım & Tuning
  "otomotiv-ekipmanlari": { icon: Wrench, theme: "slate" },
  "motosiklet-ekipmanlari": { icon: Bike, theme: "slate" },
  "deniz-araclari-ekipmanlari": { icon: Anchor, theme: "cyan" },

  // İş Makineleri & Sanayi
  "is-makineleri": { icon: Tractor, theme: "amber" },
  "tarim-makineleri": { icon: Tractor, theme: "lime" },
  sanayi: { icon: Factory, theme: "slate" },
  "elektrik-enerji": { icon: Zap, theme: "amber" },

  // Bağımsız üst kategoriler ve alt kategorileri
  "ustalar-ve-hizmetler": { icon: Wrench, theme: "sky" },
  "ic-tadilat-dekorasyon": { icon: PaintRoller, theme: "amber" },
  nakliye: { icon: Truck, theme: "sky" },
  "arac-servis-bakim": { icon: Wrench, theme: "slate" },

  "ozel-ders-verenler": { icon: GraduationCap, theme: "violet" },
  "lise-universite": { icon: GraduationCap, theme: "violet" },
  "ilkokul-ortaokul": { icon: Backpack, theme: "rose" },
  "yabanci-dil": { icon: Languages, theme: "sky" },

  "is-ilanlari": { icon: Briefcase, theme: "indigo" },
  egitim: { icon: GraduationCap, theme: "indigo" },
  saglik: { icon: Stethoscope, theme: "rose" },
  "guzellik-bakim": { icon: Sparkles, theme: "fuchsia" },
  "it-yazilim": { icon: Code2, theme: "indigo" },
  bilisim: { icon: Laptop, theme: "sky" },
  "insan-kaynaklari": { icon: Users, theme: "emerald" },

  "yardimci-arayanlar": { icon: Users, theme: "emerald" },

  // Hayvanlar Alemi
  "hayvan-aksesuar-ekipman": { icon: ShoppingBag, theme: "amber" },
  "yem-mama": { icon: Bone, theme: "amber" },
  "evcil-hayvanlar": { icon: PawPrint, theme: "amber" },
  "ciftlik-hayvanlari": { icon: Beef, theme: "lime" },
  buyukbas: { icon: Beef, theme: "lime" },
  kucukbas: { icon: ShieldPlus, theme: "emerald" },
  "deniz-canlilari": { icon: Fish, theme: "cyan" },

  // Vasıta / Emlak (ARAC_EMLAK_AKTIF açılana kadar ilan girişine kapalı ama
  // yine de tanımlı tutulur)
  otomobil: { icon: Car, theme: "indigo" },
  "arazi-suv-pickup": { icon: Mountain, theme: "emerald" },
  motosiklet: { icon: Bike, theme: "rose" },
  "minivan-panelvan": { icon: Truck, theme: "sky" },
  "ticari-araclar": { icon: Truck, theme: "slate" },
  "deniz-araclari": { icon: Anchor, theme: "cyan" },
  "hasarli-araclar": { icon: Car, theme: "amber" },
  "elektrikli-araclar": { icon: Zap, theme: "lime" },
  konut: { icon: Home, theme: "indigo" },
  "is-yeri": { icon: Building2, theme: "slate" },
  arsa: { icon: MapPin, theme: "lime" },
  "konut-projeleri": { icon: Building, theme: "sky" },
  bina: { icon: Building2, theme: "violet" },
  "devre-mulk": { icon: Castle, theme: "fuchsia" },
  "turistik-tesis": { icon: Warehouse, theme: "amber" },
};

export const DEFAULT_CATEGORY_VISUAL: CategoryVisual = { icon: Gem, theme: "indigo" };

export function getCategoryVisual(slug: string): CategoryVisual {
  return CATEGORY_VISUALS[slug] ?? DEFAULT_CATEGORY_VISUAL;
}
