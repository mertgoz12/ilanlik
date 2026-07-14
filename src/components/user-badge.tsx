import Image from "next/image";

const TEXT_BADGES: Record<string, { label: string; className: string }> = {
  galeri: {
    label: "Galeri",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  kurumsal: {
    label: "Yetkili Bayi",
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
};

type UserBadgeProps = {
  badge: string;
  // "sm" → profil başlığı / SellerCard  "xs" → listing card overlay gibi küçük alanlar
  size?: "xs" | "sm";
};

export function UserBadge({ badge, size = "sm" }: UserBadgeProps) {
  if (badge === "premium-satici") {
    const dim = size === "xs" ? 48 : 72;
    return (
      <Image
        src="/premiumsatici.png"
        alt="Premium Satıcı"
        width={dim}
        height={dim}
        className="shrink-0 object-contain"
      />
    );
  }

  const def = TEXT_BADGES[badge];
  if (!def) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${def.className}`}
    >
      {def.label}
    </span>
  );
}
