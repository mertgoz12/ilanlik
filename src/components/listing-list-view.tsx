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
// responsive grid). Öne çıkan ilanlar altın vurgu şeridi + rozetle öne çıkar.
export function ListingListView({ listings, currentUserId = null, favoritedIds }: ListingListViewProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft">
      {/* Masaüstü sütun başlıkları */}
      <div className="hidden grid-cols-[minmax(0,1fr)_140px_120px_140px] gap-3 border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 md:grid">
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
              className={`group relative flex flex-col gap-2 py-3 pl-4 pr-4 transition-colors md:grid md:grid-cols-[minmax(0,1fr)_140px_120px_140px] md:items-center md:gap-3 ${
                listing.isFeatured
                  ? "bg-gradient-to-r from-accent-light/60 to-transparent hover:from-accent-light"
                  : "hover:bg-slate-50"
              }`}
            >
              {/* Öne çıkan ilanlarda sol altın vurgu şeridi */}
              {listing.isFeatured && (
                <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-accent to-accent-dark" />
              )}

              {/* İlan başlığı: görsel + başlık + mobil meta */}
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-[68px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/70">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={listing.title}
                      fill
                      sizes="88px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${categoryTheme.wash}`}>
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-soft ${categoryTheme.badge}`}>
                        <CategoryIcon className="h-4 w-4" />
                      </span>
                    </div>
                  )}
                  <FavoriteButton
                    size="xs"
                    className="absolute right-1 top-1 bg-white/70 shadow-sm backdrop-blur-sm"
                    listingId={listing.id}
                    initialFavorited={favoritedIds?.has(listing.id) ?? false}
                    isLoggedIn={!!currentUserId}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  {/* Rozet satırı: öne çıkan + kategori */}
                  <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                    {listing.isFeatured && (
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-gradient-to-r from-accent to-accent-dark px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
                        <Crown className="h-2.5 w-2.5" />
                        Öne Çıkan
                      </span>
                    )}
                    <span className="truncate rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                      {listing.category.name}
                    </span>
                  </div>
                  <h3 className="line-clamp-2 break-words text-[13px] font-semibold leading-snug text-foreground transition-colors group-hover:text-brand sm:text-sm">
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
                    <span className="text-sm font-extrabold text-brand">{formatPrice(listing.price)}</span>
                    <span className="flex items-center gap-0.5">
                      <LocationIcon className="h-3 w-3" />
                      {listing.il}, {listing.ilce}
                    </span>
                    <span>{formatDate(listing.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Fiyat (masaüstü) */}
              <div className="hidden md:block">
                <span className="text-[16px] font-extrabold tracking-tight text-brand">
                  {formatPrice(listing.price)}
                </span>
              </div>

              {/* İlan tarihi (masaüstü) */}
              <div className="hidden text-[13px] text-slate-500 md:block">
                {formatDate(listing.createdAt)}
              </div>

              {/* İl / İlçe (masaüstü) */}
              <div className="hidden md:flex md:items-center md:gap-1.5 md:text-[13px] md:text-slate-600">
                <LocationIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="min-w-0">
                  <span className="block font-medium leading-tight">{listing.il}</span>
                  <span className="block text-[12px] leading-tight text-slate-400">{listing.ilce}</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
