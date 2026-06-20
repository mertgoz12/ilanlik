import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { DAMAGE_STATUS_STYLES, damageStatusLabel } from "@/lib/car-data";
import { formatKm, formatPrice } from "@/lib/format";
import {
  computeFallbackTrustScore,
  computeGenericFallbackTrustScore,
  RULE_FIYAT_DURUMU_LABELS,
  RULE_FIYAT_DURUMU_STYLES,
  type RuleAnalysisResult,
} from "@/lib/rule-analysis";
import type { ListingWithImages } from "@/lib/types";
import { FavoriteButton } from "./favorite-button";
import { ImageIcon, LocationIcon } from "./icons";
import { TrustBadge } from "./trust-badge";

type ListingCardProps = {
  listing: ListingWithImages;
  ruleAnalysis?: RuleAnalysisResult | null;
  currentUserId?: string | null;
  isFavorited?: boolean;
};

export function ListingCard({ listing, ruleAnalysis, currentUserId = null, isFavorited = false }: ListingCardProps) {
  const image = listing.images[0];
  const isVehicle = listing.brand !== null && listing.damageStatus !== null;
  const trustScore =
    ruleAnalysis?.tutarlilik_analizi.guven_puani ??
    (isVehicle
      ? computeFallbackTrustScore({ ...listing, photoCount: listing.images.length })
      : computeGenericFallbackTrustScore({ ...listing, photoCount: listing.images.length }));
  const fiyatDurumu = ruleAnalysis?.fiyat_analizi.fiyat_durumu;

  return (
    <Link
      href={`/ilan/${listing.listingNo}`}
      className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {image ? (
          <Image
            src={image.url}
            alt={listing.title}
            fill
            sizes="(min-width: 1280px) 23vw, (min-width: 1024px) 31vw, 45vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}

        <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-2">
          {isVehicle ? (
            <span
              className={`min-w-0 truncate rounded-md border px-2 py-0.5 text-xs font-semibold backdrop-blur-md bg-white/70 ${DAMAGE_STATUS_STYLES[listing.damageStatus!]}`}
            >
              {damageStatusLabel(listing.damageStatus!)}
            </span>
          ) : (
            <span className="min-w-0 truncate rounded-md border border-slate-200 bg-white/80 px-2 py-0.5 text-xs font-semibold text-slate-600 backdrop-blur-md">
              {listing.category.name}
            </span>
          )}
          <TrustBadge
            score={trustScore}
            size="sm"
            className="shrink-0 rounded-full bg-white/80 shadow-soft backdrop-blur-md"
          />
        </div>

        <span
          title="Yapay Zeka Onaylı"
          className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md border border-white/40 bg-white/55 px-1.5 py-0.5 text-[10px] font-semibold text-brand backdrop-blur-md"
        >
          <Sparkles className="h-3 w-3 shrink-0 text-accent-dark" />
          Yapay Zeka Onaylı
        </span>

        <FavoriteButton
          className="absolute bottom-2 right-2"
          listingId={listing.id}
          initialFavorited={isFavorited}
          isLoggedIn={!!currentUserId}
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
        <h3 className="line-clamp-2 min-h-10 break-words text-sm font-semibold text-foreground transition-colors group-hover:text-brand">
          {listing.title}
        </h3>

        {isVehicle ? (
          <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500">
            <span>{listing.year}</span>
            <span className="text-slate-300">·</span>
            <span>{formatKm(listing.km!)}</span>
            <span className="text-slate-300">·</span>
            <span>{listing.fuelType}</span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <LocationIcon className="h-3.5 w-3.5" />
              {listing.il}
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <LocationIcon className="h-3.5 w-3.5" />
              {listing.il}, {listing.ilce}
            </span>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-1 pt-1">
          <p className="text-lg font-bold text-foreground sm:text-xl">{formatPrice(listing.price)}</p>
          {fiyatDurumu && fiyatDurumu !== "yetersiz_veri" && (
            <span
              className={`inline-flex w-fit items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${RULE_FIYAT_DURUMU_STYLES[fiyatDurumu]}`}
            >
              {RULE_FIYAT_DURUMU_LABELS[fiyatDurumu]}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
