"use client";

import { useState } from "react";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-sm",
  lg: "h-11 w-11 text-sm",
  xl: "h-16 w-16 text-lg",
};

// Kullanıcının baş harflerine göre sabit ama çeşitli bir renk seçer - aynı
// kullanıcı her zaman aynı rengi alır (rastgele değil, ada bağlı bir hash).
const COLOR_CLASSES = [
  "bg-brand text-accent",
  "bg-emerald-600 text-white",
  "bg-amber-600 text-white",
  "bg-sky-600 text-white",
  "bg-rose-600 text-white",
  "bg-violet-600 text-white",
  "bg-teal-600 text-white",
  "bg-orange-600 text-white",
];

function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return COLOR_CLASSES[hash % COLOR_CLASSES.length];
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type AvatarProps = {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
};

// Sitedeki TEK avatar gösterim mantığı: fotoğraf varsa onu gösterir,
// yoksa (veya yüklenemezse - bkz. onError) kullanıcının baş harflerini
// renkli bir daire üzerinde gösterir. Hiçbir yerde boş/kırık görünmez.
export function Avatar({ name, src, size = "md", className = "" }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const sizeClass = SIZE_CLASSES[size];

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Google/Blob fotoğrafları next/image'in remotePatterns izin listesinde değil; kırılırsa initials'a düşmek için onError gerekiyor.
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-full object-cover ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${colorFor(name)} ${sizeClass} ${className}`}
    >
      {initialsFor(name)}
    </span>
  );
}
