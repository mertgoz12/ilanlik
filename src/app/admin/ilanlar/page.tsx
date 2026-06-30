import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/format";
import { LISTING_STATUS_LABELS, LISTING_STATUS_STYLES, type ListingStatus } from "@/lib/listing-status";
import { getAiModerationFlags } from "@/lib/moderation";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { ActionButton, ConfirmActionButton } from "@/components/admin/action-button";
import { PageHeader } from "@/components/admin/page-header";
import { labelClass, selectClass } from "@/components/form-ui";
import { AlertIcon, CarIcon, CheckIcon, EyeIcon, ImageIcon, InboxIcon, RestoreIcon, TrashIcon } from "@/components/icons";
import { deleteListingAction, restoreListingAction, setListingStatusAction } from "./actions";
import { approveListingAction } from "../onay-bekleyenler/actions";

const PAGE_SIZE = 20;
const STATUS_VALUES: ListingStatus[] = ["active", "pending_review", "pasif", "silindi"];

type SearchParams = {
  status?: string;
  category?: string;
  il?: string;
  user?: string;
  isDemo?: string;
  page?: string;
};

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.ListingWhereInput = {};
  // Varsayılan görünümde silinmiş ilanlar listeden düşer; "Silindi" filtresi
  // seçilirse (geri yükleme için) ayrıca gösterilir.
  where.status = sp.status ? sp.status : { not: "silindi" };
  if (sp.category) where.categoryId = sp.category;
  if (sp.il) where.il = sp.il;
  if (sp.user) where.userId = sp.user;
  if (sp.isDemo === "true") where.isDemo = true;
  if (sp.isDemo === "false") where.isDemo = false;

  const [listings, categories, ilRows] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { order: "asc" }, take: 1 }, category: { include: { parent: true } } },
    }),
    prisma.category.findMany({ include: { parent: true } }),
    prisma.listing.findMany({ distinct: ["il"], select: { il: true }, orderBy: { il: "asc" } }),
  ]);

  const categoryOptions = categories
    .map((c) => ({ id: c.id, label: c.parent ? `${c.parent.name} / ${c.name}` : c.name }))
    .sort((a, b) => a.label.localeCompare(b.label, "tr"));

  const enriched = listings.map((listing) => {
    const aiFlags = getAiModerationFlags(listing.aiAnalysis);
    const flagReasons = aiFlags.map((f) => f.aciklama);
    return { listing, flagged: flagReasons.length > 0, flagReasons };
  });

  enriched.sort((a, b) => {
    if (a.flagged !== b.flagged) return a.flagged ? -1 : 1;
    return b.listing.createdAt.getTime() - a.listing.createdAt.getTime();
  });

  const total = enriched.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageItems = enriched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = Boolean(sp.status || sp.category || sp.il || sp.user || sp.isDemo);

  return (
    <div className="space-y-6">
      <PageHeader icon={CarIcon} title="İlan Yönetimi" description={`Toplam ${total} ilan.`} accent="blue" />

      <form method="get" className="grid grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow-soft sm:grid-cols-5">
        <div>
          <label htmlFor="status" className={labelClass}>
            Durum
          </label>
          <select id="status" name="status" defaultValue={sp.status ?? ""} className={selectClass}>
            <option value="">Tümü</option>
            {STATUS_VALUES.map((s) => (
              <option key={s} value={s}>
                {LISTING_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="isDemo" className={labelClass}>
            Veri Türü
          </label>
          <select id="isDemo" name="isDemo" defaultValue={sp.isDemo ?? ""} className={selectClass}>
            <option value="">Tümü</option>
            <option value="true">Sadece Demo</option>
            <option value="false">Sadece Gerçek</option>
          </select>
        </div>
        <div>
          <label htmlFor="category" className={labelClass}>
            Kategori
          </label>
          <select id="category" name="category" defaultValue={sp.category ?? ""} className={selectClass}>
            <option value="">Tümü</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="il" className={labelClass}>
            İl
          </label>
          <select id="il" name="il" defaultValue={sp.il ?? ""} className={selectClass}>
            <option value="">Tümü</option>
            {ilRows.map((r) => (
              <option key={r.il} value={r.il}>
                {r.il}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
          >
            Filtrele
          </button>
          {hasFilters && (
            <Link
              href="/admin/ilanlar"
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Temizle
            </Link>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-xl bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">İlan</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Fiyat</th>
                <th className="px-4 py-3">İl</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3 text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.map(({ listing, flagged, flagReasons }) => (
                <tr key={listing.id} className={`transition-colors hover:bg-slate-50/80 ${flagged ? "bg-amber-50/60" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 shadow-sm">
                        {listing.images[0] ? (
                          <Image src={listing.images[0].url} alt="" fill sizes="64px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="line-clamp-1 font-medium text-foreground">{listing.title}</p>
                          {listing.isDemo && (
                            <span className="shrink-0 rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                              Demo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">#{listing.listingNo}</p>
                        {flagged && (
                          <p className="mt-1 flex items-start gap-1 text-xs font-medium text-amber-700">
                            <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span className="line-clamp-2">{flagReasons.join(" · ")}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {listing.category.parent
                      ? `${listing.category.parent.name} / ${listing.category.name}`
                      : listing.category.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-foreground">
                    {formatPrice(listing.price)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">{listing.il}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${LISTING_STATUS_STYLES[listing.status as ListingStatus] ?? LISTING_STATUS_STYLES.pasif}`}
                    >
                      {LISTING_STATUS_LABELS[listing.status as ListingStatus] ?? listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatDate(listing.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <Link
                        href={`/ilan/${listing.listingNo}`}
                        target="_blank"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                        Görüntüle
                      </Link>

                      {listing.status === "silindi" ? (
                        <ConfirmActionButton
                          action={restoreListingAction.bind(null, listing.id)}
                          icon={<RestoreIcon className="h-3.5 w-3.5" />}
                          confirmTitle="İlanı geri yükle"
                          confirmMessage={`"${listing.title}" ilanını geri yüklemek istediğinize emin misiniz? İlan "Pasif" durumuna alınacak ve site genelinde yeniden görünür/yönetilebilir olacaktır.`}
                          confirmLabel="Evet, geri yükle"
                          successMessage={`"${listing.title}" ilanı geri yüklendi.`}
                          errorMessage="İlan geri yüklenemedi. Lütfen tekrar deneyin."
                          tone="default"
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                        >
                          Geri Yükle
                        </ConfirmActionButton>
                      ) : (
                        <>
                          {listing.status === "pending_review" ? (
                            <>
                              <ActionButton
                                action={approveListingAction.bind(null, listing.id)}
                                icon={<CheckIcon className="h-3.5 w-3.5" />}
                                successMessage={`"${listing.title}" ilanı onaylandı ve yayına alındı.`}
                                errorMessage="İlan onaylanamadı. Lütfen tekrar deneyin."
                                className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
                              >
                                Onayla
                              </ActionButton>
                              <Link
                                href="/admin/onay-bekleyenler"
                                className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                              >
                                İncele / Reddet
                              </Link>
                            </>
                          ) : listing.status === "active" ? (
                            <ActionButton
                              action={setListingStatusAction.bind(null, listing.id, "pasif")}
                              successMessage={`"${listing.title}" ilanı yayından kaldırıldı.`}
                              errorMessage="İlan yayından kaldırılamadı. Lütfen tekrar deneyin."
                              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                            >
                              Yayından Kaldır
                            </ActionButton>
                          ) : (
                            <ActionButton
                              action={setListingStatusAction.bind(null, listing.id, "active")}
                              icon={<CheckIcon className="h-3.5 w-3.5" />}
                              successMessage={`"${listing.title}" ilanı yayına alındı.`}
                              errorMessage="İlan yayına alınamadı. Lütfen tekrar deneyin."
                              className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
                            >
                              Yayınla
                            </ActionButton>
                          )}

                          <ConfirmActionButton
                            action={deleteListingAction.bind(null, listing.id)}
                            icon={<TrashIcon className="h-3.5 w-3.5" />}
                            confirmTitle="İlanı sil"
                            confirmMessage={`"${listing.title}" ilanını silmek istediğinize emin misiniz? İlan sitede hiçbir yerde görünmeyecek ve "Silindi" durumuna alınacak. Gerekirse "Durum: Silindi" filtresinden geri yükleyebilirsiniz.`}
                            confirmLabel="Evet, sil"
                            successMessage={`"${listing.title}" ilanı silindi.`}
                            errorMessage="İlan silinemedi. Lütfen tekrar deneyin."
                            tone="danger"
                            className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            Sil
                          </ConfirmActionButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                        <InboxIcon className="h-6 w-6" />
                      </span>
                      Bu filtrelerle eşleşen ilan bulunamadı.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/ilanlar" searchParams={sp} />
    </div>
  );
}
