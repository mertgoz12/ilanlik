import type { ComponentType } from "react";
import { Bell, Bookmark, Heart, LayoutDashboard, MessageCircle, Package, Settings } from "lucide-react";

export type AccountNavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: ComponentType<{ className?: string }>;
};

export const ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  { href: "/hesabim", label: "Özet", shortLabel: "Özet", icon: LayoutDashboard },
  { href: "/hesabim/ilanlarim", label: "İlan Yönetimi", shortLabel: "İlanlarım", icon: Package },
  { href: "/hesabim/favorilerim", label: "Favorilerim", shortLabel: "Favoriler", icon: Heart },
  { href: "/hesabim/opsiyonlarim", label: "Opsiyonladıklarım", shortLabel: "Opsiyonlar", icon: Bookmark },
  { href: "/hesabim/mesajlar", label: "Mesajlar", shortLabel: "Mesajlar", icon: MessageCircle },
  { href: "/hesabim/bildirimler", label: "Bildirimler", shortLabel: "Bildirimler", icon: Bell },
  { href: "/hesabim/ayarlar", label: "Hesap Ayarları", shortLabel: "Ayarlar", icon: Settings },
];
