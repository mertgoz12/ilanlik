import type { ComponentType } from "react";
import { CarIcon, ChartBarIcon, ClockIcon, GearIcon, HeartIcon, MessageIcon } from "@/components/icons";

export type AccountNavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export const ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  { href: "/hesabim", label: "Özet", icon: ChartBarIcon },
  { href: "/hesabim/ilanlarim", label: "İlan Yönetimi", icon: CarIcon },
  { href: "/hesabim/favorilerim", label: "Favorilerim", icon: HeartIcon },
  { href: "/hesabim/opsiyonlarim", label: "Opsiyonladıklarım", icon: ClockIcon },
  { href: "/hesabim/mesajlar", label: "Mesajlar", icon: MessageIcon },
  { href: "/hesabim/ayarlar", label: "Hesap Ayarları", icon: GearIcon },
];
