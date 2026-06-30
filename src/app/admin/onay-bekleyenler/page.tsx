import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/format";
import { getAiModerationFlags } from "@/lib/moderation";
import { computeFallbackTrustScore, computeGenericFallbackTrustScore } from "@/lib/rule-analysis";
import { PageHeader } from "@/components/admin/page-header";
import { TrustBadge } from "@/components/trust-badge";
import { AlertIcon, CheckCircleIcon, ClockIcon, ImageIcon, LocationIcon } from "@/components/icons";
import { ApprovalActions } from "./approval-actions";
import { approveListingAction, rejectListingAction } from "./actions";

export default async function PendingApprovalPage() {
  const listings = await prisma.listing.findMany({
    where: { status: "pending_review" },
    orderBy: { createdAt: "asc" },
    include: {
      images: { orderBy: { order: "asc" } },
      user: { select: { name: true, email: true } },
      category: { select: { name: true } },
      _count: { select: { images: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClockIcon}
        title="Onay Bekleyen İlanlar"
        description={
          listings.length === 0
            ? "Onay bekleyen ilan yok."
            : `${listings.length} ilan onayınızı bekliyor.`
        }
        accent="amber"
      />

      {listings.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-10 text-center shadow-soft">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <CheckCircleIcon className="h-6 w-6" />
          </span>
          <p className="text-sm text-slate-400">Tüm ilanlar incelendi. Onay bekleyen yeni ilan yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const isVehicle = listing.brand !== null && listing.damageStatus !== null;
            const withPhotoCount = { ...listing, photoCount: listing._count.images };
            const trustScore = isVehicle
              ? computeFallbackTrustScore(withPhotoCount)
              : computeGenericFallbackTrustScore(withPhotoCount);
            const aiFlags = getAiModerationFlags(listing.aiAnalysis);

            const specs: { label: string; value: string }[] = isVehicle
              ? [
                  { label: "Marka / Model", value: [listing.brand, listing.model].filter(Boolean).join(" ") || "-" },
                  { label: "Yıl", value: listing.year ? String(listing.year) : "-" },
                  { label: "KM", value: listing.km ? listing.km.toLocaleString("tr-TR") : "-" },
                  { label: "Yakıt", value: listing.fuelType || "-" },
                  { label: "Vites", value: listing.transmission || "-" },
                  { label: "Hasar", value: listing.damageStatus || "-" },
                ]
              : [{ label: "Kategori", value: listing.category.name }, { label: "Durum", value: listing.condition || "-" }];

            return (
              <div key={listing.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-soft">
                <div className="flex flex-col gap-4 lg:flex-row">
                  {/* Görseller */}
                  <div className="shrink-0 lg:w-64">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-100">
                      {listing.images[0] ? (
                        <Image src={listing.images[0].url} alt="" fill sizes="256px" className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    {listing.images.length > 1 && (
                      <div className="mt-2 grid grid-cols-5 gap-1.5">
                        {listing.images.slice(1, 6).map((img) => (
                          <div key={img.id} className="relative aspect-square overflow-hidden rounded bg-slate-100">
                            <Image src={img.url} alt="" fill sizes="48px" className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="mt-1.5 text-center text-xs text-slate-400">
                      {listing._count.images} fotoğraf
                    </p>
                  </div>

                  {/* Detaylar */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-foreground">{listing.title}</h3>
                      <span className="text-xs text-slate-400">#{listing.listingNo}</span>
                    </div>
                    <p className="mt-1 text-lg font-bold text-brand">{formatPrice(listing.price)}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <LocationIcon className="h-3.5 w-3.5" />
                      {listing.il}
                      {listing.ilce ? `, ${listing.ilce}` : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {listing.user.name} · {listing.user.email} · {formatDate(listing.createdAt)}
                    </p>

                    <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {specs.map((spec) => (
                        <div key={spec.label} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5">
                          <dt className="text-[11px] text-slate-400">{spec.label}</dt>
                          <dd className="truncate text-xs font-semibold text-slate-700">{spec.value}</dd>
                        </div>
                      ))}
                    </dl>

                    {listing.description && (
                      <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-slate-600">
                        {listing.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {trustScore !== null && (
                        <div className="flex items-center gap-1.5">
                          <TrustBadge score={trustScore} size="sm" />
                          <span className="text-[11px] text-slate-400">Güven Puanı</span>
                        </div>
                      )}
                      <Link
                        href={`/ilan/${listing.listingNo}`}
                        target="_blank"
                        className="text-xs font-medium text-brand hover:underline"
                      >
                        Detay sayfası →
                      </Link>
                    </div>

                    {aiFlags.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {aiFlags.map((flag, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700"
                          >
                            <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>{flag.aciklama}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Aksiyonlar */}
                  <div className="shrink-0 border-t border-slate-100 pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                    <ApprovalActions
                      listingTitle={listing.title}
                      approve={approveListingAction.bind(null, listing.id)}
                      reject={rejectListingAction.bind(null, listing.id)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
