import type { ComponentType } from "react";
import {
  Anchor,
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
  "ikinci-el-ve-sifir-alisveris": { icon: ShoppingBag, theme: "emerald" },
  "is-makineleri-sanayi": { icon: Factory, theme: "amber" },
  "hayvanlar-alemi": { icon: PawPrint, theme: "lime" },

  // İkinci El ve Sıfır Alışveriş
  "cep-telefonu": { icon: Smartphone, theme: "indigo" },
  bilgisayar: { icon: Laptop, theme: "sky" },
  "fotograf-kamera": { icon: Camera, theme: "cyan" },
  "ev-dekorasyon": { icon: Sofa, theme: "amber" },
  "ev-elektronigi": { icon: Tv, theme: "violet" },
  "elektrikli-ev-aletleri": { icon: Zap, theme: "cyan" },
  "giyim-aksesuar": { icon: Shirt, theme: "rose" },
  saat: { icon: Watch, theme: "fuchsia" },
  "anne-bebek": { icon: Baby, theme: "rose" },
  "kisisel-bakim-kozmetik": { icon: Sparkles, theme: "fuchsia" },
  "hobi-oyuncak": { icon: Gamepad2, theme: "emerald" },
  "oyuncu-ekipmanlari": { icon: Headphones, theme: "violet" },
  "kitap-dergi-film": { icon: Book, theme: "sky" },
  muzik: { icon: Music2, theme: "violet" },
  antika: { icon: Gem, theme: "amber" },
  "bahce-yapi-market": { icon: Hammer, theme: "lime" },
  "teknik-elektronik": { icon: Cpu, theme: "slate" },
  "ofis-kirtasiye": { icon: Pencil, theme: "cyan" },
  spor: { icon: Dumbbell, theme: "emerald" },
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
