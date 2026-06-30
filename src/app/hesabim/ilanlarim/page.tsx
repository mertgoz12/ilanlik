import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import { requireUserPage } from "@/lib/account-auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/format";
import { LISTING_STATUS_LABELS, LISTING_STATUS_STYLES, type ListingStatus } from "@/lib/listing-status";
import { getAiModerationFlags } from "@/lib/moderation";
import { computeFallbackTrustScore, computeGenericFallbackTrustScore } from "@/lib/rule-analysis";
import { expireStaleOptions } from "@/lib/listing-options";
import { formatRemainingTime } from "@/lib/option-format";
import { PageHeader } from "@/components/admin/page-header";
import { ActionButton, ConfirmActionButton } from "@/components/admin/action-button";
import { TrustBadge } from "@/components/trust-badge";
import {
  AlertIcon,
  CheckIcon,
  ClockIcon,
  ImageIcon,
  InboxIcon,
  MessageIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
} from "@/components/icons";
import { endOptionAction } from "@/app/ilan/[listingNo]/actions";
import { deleteListingAction, publishListingAction, resubmitListingAction, unpublishListingAction } from "./actions";

type TabKey = "tumu" | "yayinda" | "yayinda-degil";

export default async function MyListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string }>;
}) {
  const session = await requireUserPage("/hesabim/ilanlarim");
  await expireStaleOptions();
  const sp = await searchParams;
  const tab: TabKey = sp.durum === "yayinda" ? "yayinda" : sp.durum === "yayinda-degil" ? "yayinda-degil" : "tumu";

  const where: Prisma.ListingWhereInput = { userId: session.id };
  if (tab === "yayinda") where.status = "active";
  if (tab === "yayinda-degil") where.status = { in: ["pasif", "pending_review", "rejected", "silindi"] };

  const [listings, statusCounts, conversations] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        optionHolder: { select: { name: true } },
        _count: { select: { images: true } },
      },
    }),
    prisma.listing.groupBy({ by: ["status"], where: { userId: session.id }, _count: { _all: true } }),
    prisma.conversation.findMany({
      where: { sellerId: session.id },
      select: {
        listingId: true,
        _count: { select: { messages: { where: { senderId: { not: session.id } } } } },
      },
    }),
  ]);

  const messageCountByListing = new Map<string, number>();
  for (const c of conversations) {
    messageCountByListing.set(c.listingId, (messageCountByListing.get(c.listingId) ?? 0) + c._count.messages);
  }

  const countsByStatus = new Map(statusCounts.map((c) => [c.status, c._count._all]));
  const totalCount = statusCounts.reduce((sum, c) => sum + c._count._all, 0);
  const activeCount = countsByStatus.get("active") ?? 0;
  const inactiveCount =
    (countsByStatus.get("pasif") ?? 0) +
    (countsByStatus.get("pending_review") ?? 0) +
    (countsByStatus.get("rejected") ?? 0) +
    (countsByStatus.get("silindi") ?? 0);

  const tabs: { key: TabKey; label: string; count: number; href: string }[] = [
    { key: "tumu", label: "İlanlarım", count: totalCount, href: "/hesabim/ilanlarim" },
    { key: "yayinda", label: "Yayında Olanlar", count: activeCount, href: "/hesabim/ilanlarim?durum=yayinda" },
    {
      key: "yayinda-degil",
      label: "Yayında Olmayanlar",
      count: inactiveCount,
      href: "/hesabim/ilanlarim?durum=yayinda-degil",
    },
  ];

  const enriched = listings.map((listing) => {
    // Not: artık tüm yeni ilanlar admin onayı için "pending_review" olur; bu
    // durum tek başına bir sorun (fahiş fiyat vb.) anlamına gelmez. Uyarı
    // satırları yalnızca yapay zeka bayraklarından gelir.
    const aiFlags = getAiModerationFlags(listing.aiAnalysis);
    const flagReasons = aiFlags.map((f) => f.aciklama);
    const isVehicle = listing.brand !== null && listing.damageStatus !== null;
    const listingWithPhotoCount = { ...listing, photoCount: listing._count.images };
    const trustScore = isVehicle
      ? computeFallbackTrustScore(listingWithPhotoCount)
      : computeGenericFallbackTrustScore(listingWithPhotoCount);
    return {
      listing,
      flagged: flagReasons.length > 0,
      flagReasons,
      trustScore,
      messageCount: messageCountByListing.get(listing.id) ?? 0,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Package}
        title="İlan Yönetimi"
        description={`Toplam ${totalCount} ilanınız var.`}
        accent="blue"
        action={
          <Link
            href="/ilan-ver"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-brand shadow-sm transition-colors hover:bg-accent-dark"
          >
            <PlusIcon className="h-4 w-4" />
            Yeni İlan Ver
          </Link>
        }
      />

      <div className="flex gap-1 overflow-x-auto rounded-xl bg-white p-1.5 shadow-soft">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? "bg-accent-light text-brand" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label} <span className="ml-1 text-xs text-slate-400">({t.count})</span>
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {enriched.map(({ listing, flagged, flagReasons, trustScore, messageCount }) => {
          const status = listing.status as ListingStatus;
          const image = listing.images[0];

          return (
            <div
              key={listing.id}
              className={`flex flex-col gap-4 rounded-xl p-4 shadow-soft sm:flex-row sm:items-center ${
                flagged ? "bg-amber-50/60 ring-1 ring-amber-200" : "bg-white"
              }`}
            >
              <Link
                href={`/ilan/${listing.listingNo}`}
                target="_blank"
                className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-20 sm:w-28"
              >
                {image ? (
                  <Image src={image.url} alt="" fill sizes="112px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/ilan/${listing.listingNo}`}
                    target="_blank"
                    className="line-clamp-1 font-semibold text-foreground hover:text-brand"
                  >
                    {listing.title}
                  </Link>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${LISTING_STATUS_STYLES[status] ?? LISTING_STATUS_STYLES.pasif}`}
                  >
                    {LISTING_STATUS_LABELS[status] ?? listing.status}
                  </span>
                  {listing.optionStatus === "opsiyonlandi" && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      <ClockIcon className="h-3 w-3" />
                      Opsiyonda
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{formatPrice(listing.price)}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MessageIcon className="h-3.5 w-3.5" />
                    {messageCount} mesaj
                  </span>
                  <span>#{listing.listingNo}</span>
                  <span>{formatDate(listing.createdAt)}</span>
                </div>
                {listing.optionStatus === "opsiyonlandi" && listing.optionHolder && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-700">
                    <UserIcon className="h-3.5 w-3.5" />
                    Opsiyonlayan: <span className="font-semibold">{listing.optionHolder.name}</span>
                    {listing.optionEndAt && <span>· {formatRemainingTime(listing.optionEndAt)}</span>}
                  </p>
                )}
                {flagged && status !== "rejected" && (
                  <p className="mt-1.5 flex items-start gap-1 text-xs font-medium text-amber-700">
                    <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-2">{flagReasons.join(" · ")}</span>
                  </p>
                )}
                {status === "rejected" && listing.rejectionReason && (
                  <p className="mt-1.5 flex items-start gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
                    <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      <span className="font-semibold">Red sebebi:</span> {listing.rejectionReason}
                      <span className="mt-0.5 block font-normal text-red-500">
                        Düzenleyip kaydedince ilan otomatik olarak tekrar onaya gönderilir.
                      </span>
                    </span>
                  </p>
                )}
              </div>

              {trustScore !== null && (
                <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:gap-1">
                  <TrustBadge score={trustScore} size="sm" />
                  <span className="text-[11px] text-slate-400">Güven Puanı</span>
                </div>
              )}

              <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:flex-col sm:items-stretch">
                {status === "silindi" ? (
                  <span className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600">
                    <AlertIcon className="h-3.5 w-3.5" />
                    Yönetici tarafından kaldırıldı
                  </span>
                ) : (
                  <>
                    <Link
                      href={`/hesabim/ilanlarim/${listing.id}/duzenle`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                      Düzenle
                    </Link>

                    {status === "active" ? (
                      <ActionButton
                        action={unpublishListingAction.bind(null, listing.id)}
                        successMessage={`"${listing.title}" ilanı yayından kaldırıldı.`}
                        errorMessage="İlan yayından kaldırılamadı. Lütfen tekrar deneyin."
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                      >
                        Yayından Kaldır
                      </ActionButton>
                    ) : status === "pasif" ? (
                      <ActionButton
                        action={publishListingAction.bind(null, listing.id)}
                        icon={<CheckIcon className="h-3.5 w-3.5" />}
                        successMessage={`"${listing.title}" ilanı yayına alındı.`}
                        errorMessage="İlan yayına alınamadı. Lütfen tekrar deneyin."
                        className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
                      >
                        Yayınla
                      </ActionButton>
                    ) : status === "rejected" ? (
                      <ActionButton
                        action={resubmitListingAction.bind(null, listing.id)}
                        icon={<CheckIcon className="h-3.5 w-3.5" />}
                        successMessage={`"${listing.title}" tekrar onaya gönderildi.`}
                        errorMessage="İlan tekrar gönderilemedi. Lütfen tekrar deneyin."
                        className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
                      >
                        Tekrar Onaya Gönder
                      </ActionButton>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700">
                        <ClockIcon className="h-3.5 w-3.5" />
                        İnceleniyor
                      </span>
                    )}

                    {listing.optionStatus === "opsiyonlandi" && (
                      <ConfirmActionButton
                        action={endOptionAction.bind(null, listing.id)}
                        icon={<ClockIcon className="h-3.5 w-3.5" />}
                        confirmTitle="Opsiyonu sonlandır"
                        confirmMessage={`"${listing.title}" ilanındaki opsiyonu sonlandırmak istediğinize emin misiniz? İlan tekrar herkese görünür olacak.`}
                        confirmLabel="Evet, sonlandır"
                        successMessage="Opsiyon sonlandırıldı, ilan tekrar yayında."
                        errorMessage="İşlem gerçekleştirilemedi. Lütfen tekrar deneyin."
                        tone="danger"
                        className="rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50"
                      >
                        Opsiyonu Sonlandır
                      </ConfirmActionButton>
                    )}

                    <ConfirmActionButton
                      action={deleteListingAction.bind(null, listing.id)}
                      icon={<TrashIcon className="h-3.5 w-3.5" />}
                      confirmTitle="İlanı sil"
                      confirmMessage={`"${listing.title}" ilanını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
                      confirmLabel="Evet, sil"
                      successMessage={`"${listing.title}" ilanı kalıcı olarak silindi.`}
                      errorMessage="İlan silinemedi. Lütfen tekrar deneyin."
                      tone="danger"
                      className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      Sil
                    </ConfirmActionButton>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {enriched.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-12 text-center text-sm text-slate-400 shadow-soft">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
              <InboxIcon className="h-6 w-6" />
            </span>
            Bu filtrede ilan bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}
