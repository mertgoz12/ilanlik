import type { ComponentType } from "react";
import {
  CarIcon,
  ChartBarIcon,
  ClockIcon,
  FlagIcon,
  FolderIcon,
  GaugeIcon,
  InboxIcon,
  SparkleIcon,
  TagIcon,
  UserIcon,
} from "@/components/icons";
import type { Accent } from "@/components/admin/accent";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  accent: Accent;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Özet", icon: ChartBarIcon, accent: "slate" },
  { href: "/admin/ilanlar", label: "İlan Yönetimi", icon: CarIcon, accent: "blue" },
  { href: "/admin/opsiyonlar", label: "Opsiyonlama Yönetimi", icon: ClockIcon, accent: "amber" },
  { href: "/admin/moderasyon", label: "Moderasyon Kuyruğu", icon: FlagIcon, accent: "amber" },
  { href: "/admin/kullanicilar", label: "Kullanıcı Yönetimi", icon: UserIcon, accent: "indigo" },
  { href: "/admin/kategoriler", label: "Kategori Yönetimi", icon: FolderIcon, accent: "violet" },
  { href: "/admin/blog", label: "Blog Yönetimi", icon: TagIcon, accent: "violet" },
  { href: "/admin/yapay-zeka", label: "Yapay Zeka Kontrol Paneli", icon: SparkleIcon, accent: "emerald" },
  { href: "/admin/arac-veritabani", label: "Araç Veritabanı", icon: GaugeIcon, accent: "red" },
  { href: "/admin/demo-verileri", label: "Demo Veri Yönetimi", icon: InboxIcon, accent: "slate" },
];
