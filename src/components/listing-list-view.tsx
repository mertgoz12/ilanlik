import Image from "next/image";
import Link from "next/link";
import { Crown } from "lucide-react";
import { CATEGORY_THEME_CLASSES, getCategoryVisual } from "@/lib/category-visuals";
import { formatKm, formatPrice, formatDate } from "@/lib/format";
import type { ListingWithImages } from "@/lib/types";
import { FavoriteButton } from "./favorite-button";
import { LocationIcon } from "./icons";

type ListingListViewProps = {
  listings: ListingWithImages[];
  currentUserId?: string | null;
  favoritedIds?: Set<string>;
};

// Sahibinden tarzı satır (tablo) görünümü - kategori/arama sonuçlarında ızgaraya
// alternatif. Masaüstünde sütunlu tablo, mobilde yığılmış satırlar (tek markup,
// responsive grid). Öne çıkan ilanlar yeşil zeminle vurgulanır.
export function ListingListView({ listings, currentUserId = null, favoritedIds }: ListingListViewProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
      {/* Masaüstü sütun başlıkları */}
      <div className="hidden grid-cols-[minmax(0,1fr)_130px_120px_130px] gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 md:grid">
        <span>İlan Başlığı</span>
        <span>Fiyat</span>
        <span>İlan Tarihi</span>
        <span>İl / İlçe</span>
      </div>

      <div className="divide-y divide-slate-100">
        {listings.map((listing) => {
          const image = listing.images[0];
          const isVehicle = listing.brand !== null;
          const { icon: CategoryIcon, theme } = getCategoryVisual(listing.category.slug);
          const categoryTheme = CATEGORY_THEME_CLASSES[theme];

          return (
            <Link
              key={listing.id}
              href={`/ilan/${listing.listingNo}`}
              className={`group flex flex-col gap-2 px-3 py-2.5 transition-colors md:grid md:grid-cols-[minmax(0,1fr)_130px_120px_130px] md:items-center md:gap-3 ${
                listing.isFeatured ? "bg-emerald-50/70 hover:bg-emerald-50" : "hover:bg-slate-50"
              }`}
            >
              {/* İlan başlığı: görsel + başlık + mobil meta */}
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={listing.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${categoryTheme.wash}`}>
                      <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-white ${categoryTheme.badge}`}>
                        <CategoryIcon className="h-4 w-4" />
                      </span>
                    </div>
                  )}
                  <FavoriteButton
                    size="xs"
                    className="absolute right-0.5 top-0.5 bg-white/60"
                    listingId={listing.id}
                    initialFavorited={favoritedIds?.has(listing.id) ?? false}
                    isLoggedIn={!!currentUserId}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 break-words text-[13px] font-semibold leading-tight text-foreground transition-colors group-hover:text-brand sm:text-sm">
                    {listing.isFeatured && (
                      <Crown className="mr-1 inline h-3.5 w-3.5 -translate-y-0.5 text-accent-dark" />
                    )}
                    {listing.title}
                  </h3>
                  {isVehicle && (
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      {listing.year} · {listing.km !== null ? formatKm(listing.km) : ""}
                      {listing.fuelType ? ` · ${listing.fuelType}` : ""}
                    </p>
                  )}
                  {/* Mobilde fiyat + konum + tarih satır içinde gösterilir */}
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 md:hidden">
                    <span className="text-sm font-bold text-brand">{formatPrice(listing.price)}</span>
                    <span className="flex items-center gap-0.5">
                      <LocationIcon className="h-3 w-3" />
                      {listing.il}, {listing.ilce}
                    </span>
                    <span>{formatDate(listing.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Fiyat (masaüstü) */}
              <div className="hidden text-[15px] font-bold text-brand md:block">
                {formatPrice(listing.price)}
              </div>

              {/* İlan tarihi (masaüstü) */}
              <div className="hidden text-[13px] text-slate-500 md:block">
                {formatDate(listing.createdAt)}
              </div>

              {/* İl / İlçe (masaüstü) */}
              <div className="hidden text-[13px] text-slate-600 md:block">
                <span className="font-medium">{listing.il}</span>
                <span className="block text-[12px] text-slate-400">{listing.ilce}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
