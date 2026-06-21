import type { ComponentType } from "react";
import {
  Anchor,
  Baby,
  Beef,
  Bike,
  Bird,
  Book,
  Briefcase,
  Building,
  Building2,
  Camera,
  Car,
  Castle,
  Dumbbell,
  Factory,
  Fish,
  Gamepad2,
  Gem,
  GraduationCap,
  Home,
  Laptop,
  MapPin,
  Mountain,
  Music2,
  PawPrint,
  Shirt,
  Smartphone,
  Sofa,
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
// (bkz. listing-card.tsx) ve kategori kartlarında (featured-categories.tsx)
// kullanılır. Eşleşme bulunamazsa DEFAULT_CATEGORY_VISUAL'a düşer.
export const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  // İkinci El ve Sıfır Alışveriş
  "cep-telefonu": { icon: Smartphone, theme: "indigo" },
  bilgisayar: { icon: Laptop, theme: "sky" },
  "fotograf-kamera": { icon: Camera, theme: "cyan" },
  "ev-dekorasyon": { icon: Sofa, theme: "amber" },
  "ev-elektronigi": { icon: Tv, theme: "violet" },
  "giyim-aksesuar": { icon: Shirt, theme: "rose" },
  saat: { icon: Watch, theme: "fuchsia" },
  "anne-bebek": { icon: Baby, theme: "rose" },
  "kitap-dergi-film-muzik": { icon: Book, theme: "sky" },
  spor: { icon: Dumbbell, theme: "emerald" },
  "muzik-enstrumanlari": { icon: Music2, theme: "violet" },
  koleksiyon: { icon: Gem, theme: "amber" },
  "taki-mucevher": { icon: Gem, theme: "fuchsia" },
  "oyun-hobi": { icon: Gamepad2, theme: "emerald" },

  // Yedek Parça, Aksesuar, Donanım & Tuning
  "otomotiv-ekipmanlari": { icon: Wrench, theme: "slate" },
  "motosiklet-ekipmanlari": { icon: Bike, theme: "slate" },
  "deniz-araci-ekipmanlari": { icon: Anchor, theme: "cyan" },

  // İş Makineleri & Sanayi
  "is-makineleri": { icon: Tractor, theme: "amber" },
  "tarim-makineleri": { icon: Tractor, theme: "lime" },
  sanayi: { icon: Factory, theme: "slate" },
  "elektrik-enerji": { icon: Zap, theme: "amber" },

  // Bağımsız üst kategoriler
  "ustalar-ve-hizmetler": { icon: Wrench, theme: "sky" },
  "ozel-ders-verenler": { icon: GraduationCap, theme: "violet" },
  "is-ilanlari": { icon: Briefcase, theme: "indigo" },
  "yardimci-arayanlar": { icon: Users, theme: "emerald" },

  // Hayvanlar Alemi
  "evcil-hayvanlar": { icon: PawPrint, theme: "amber" },
  "akvaryum-baliklari": { icon: Fish, theme: "cyan" },
  "kumes-hayvanlari": { icon: Bird, theme: "lime" },
  "buyukbas-kucukbas": { icon: Beef, theme: "rose" },

  // Vasıta / Emlak (ARAC_EMLAK_AKTIF açılana kadar ilan girişine kapalı ama
  // yine de tanımlı tutulur)
  otomobil: { icon: Car, theme: "indigo" },
  "arazi-suv-pickup": { icon: Mountain, theme: "emerald" },
  motosiklet: { icon: Bike, theme: "rose" },
  "minivan-panelvan": { icon: Truck, theme: "sky" },
  "ticari-araclar": { icon: Truck, theme: "slate" },
  "kiralik-araclar": { icon: Car, theme: "violet" },
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
