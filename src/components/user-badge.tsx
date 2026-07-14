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

function membershipYears(createdAt: Date | string): number {
  const joined = new Date(createdAt);
  const now = new Date();
  let years = now.getFullYear() - joined.getFullYear();
  const passedAnniversary =
    now.getMonth() > joined.getMonth() ||
    (now.getMonth() === joined.getMonth() && now.getDate() >= joined.getDate());
  if (!passedAnniversary) years -= 1;
  return Math.max(1, years);
}

type UserBadgeProps = {
  badge: string;
  memberSince?: Date | string;
  // "sm" → profil başlığı / SellerCard   "xs" → satır içi küçük alanlar
  size?: "xs" | "sm";
};

export function UserBadge({ badge, memberSince, size = "sm" }: UserBadgeProps) {
  if (badge === "premium-satici") {
    const years = memberSince ? membershipYears(memberSince) : 1;
    const imgSize = size === "xs" ? 44 : 60;

    return (
      <div className="inline-flex shrink-0 flex-col items-center gap-1">
        <Image
          src="/premiumsatici.png"
          alt="Premium Satıcı"
          width={imgSize}
          height={imgSize}
          className="object-contain"
        />
        <span
          className="rounded-full border border-slate-300/70 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-500 shadow-sm"
          style={{
            background:
              "linear-gradient(160deg, #e6e6e6 0%, #f8f8f8 40%, #ffffff 50%, #e0e0e0 72%, #c8c8c8 100%)",
          }}
        >
          {years} Yıl
        </span>
      </div>
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
