import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { getAiModerationFlags, type ModerationFlag } from "@/lib/moderation";
import { ActionButton, ConfirmActionButton } from "@/components/admin/action-button";
import { PageHeader } from "@/components/admin/page-header";
import { AlertIcon, BellIcon, CheckCircleIcon, CheckIcon, FlagIcon, ImageIcon, MessageIcon, XCircleIcon } from "@/components/icons";
import { resolveAiFlagAction, resolveListingReportAction } from "./actions";

const FLAG_TIP_LABELS: Record<ModerationFlag["tip"], string> = {
  celiski: "Çelişki",
  supheli_sinyal: "Şüpheli Sinyal",
  eksik_bilgi: "Eksik Bilgi",
  manipulasyon_girisimi: "Manipülasyon Girişimi",
};

const FLAG_ONEM_STYLES: Record<ModerationFlag["onem"], string> = {
  yuksek: "border-red-200 bg-red-50 text-red-700",
  orta: "border-amber-200 bg-amber-50 text-amber-700",
  dusuk: "border-slate-200 bg-slate-50 text-slate-500",
};

const FLAG_ONEM_LABELS: Record<ModerationFlag["onem"], string> = {
  yuksek: "Yüksek",
  orta: "Orta",
  dusuk: "Düşük",
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-10 text-center shadow-soft">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
        <CheckCircleIcon className="h-6 w-6" />
      </span>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

export default async function ModerationQueuePage() {
  const [flaggedListings, reports] = await Promise.all([
    prisma.listing.findMany({
      where: { aiAnalysis: { not: null }, flagResolvedAt: null, status: { not: "silindi" } },
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.listingReport.findMany({
      where: { status: "pending", listing: { status: { not: "silindi" } } },
      orderBy: { createdAt: "asc" },
      include: {
        listing: {
          include: {
            images: { orderBy: { order: "asc" }, take: 1 },
            user: { select: { name: true, email: true } },
          },
        },
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const aiFlagged = flaggedListings
    .map((listing) => ({ listing, flags: getAiModerationFlags(listing.aiAnalysis) }))
    .filter((item) => item.flags.length > 0);

  const totalQueue = aiFlagged.length + reports.length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FlagIcon}
        title="Moderasyon Kuyruğu"
        description={
          totalQueue === 0
            ? "İnceleme bekleyen öğe yok."
            : `${totalQueue} öğe incelemenizi bekliyor.`
        }
        accent="amber"
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <AlertIcon className="h-4 w-4" />
            Yapay Zeka Bayrakları
          </h2>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
            {aiFlagged.length}
          </span>
        </div>

        {aiFlagged.length === 0 ? (
          <EmptyState message="Bekleyen yapay zeka bayrağı yok." />
        ) : (
          <div className="space-y-3">
            {aiFlagged.map(({ listing, flags }) => (
              <div
                key={listing.id}
                className="rounded-xl border border-slate-100 bg-white p-4 shadow-soft transition-shadow hover:shadow-soft-lg"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 shadow-sm">
                    {listing.images[0] ? (
                      <Image src={listing.images[0].url} alt="" fill sizes="96px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/ilan/${listing.listingNo}`}
                        target="_blank"
                        className="font-medium text-foreground hover:underline"
                      >
                        {listing.title}
                      </Link>
                      <span className="text-xs text-slate-400">#{listing.listingNo}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {listing.user.name} · {listing.user.email} · {formatDate(listing.createdAt)}
                    </p>

                    <ul className="mt-3 space-y-1.5">
                      {flags.map((flag, i) => (
                        <li
                          key={i}
                          className={`flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-sm ${FLAG_ONEM_STYLES[flag.onem]}`}
                        >
                          <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>
                            <span className="font-semibold">{FLAG_TIP_LABELS[flag.tip]}</span>{" "}
                            <span className="text-xs opacity-70">({FLAG_ONEM_LABELS[flag.onem]} önem)</span>
                            <br />
                            {flag.aciklama}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-1.5 sm:w-40 sm:flex-col">
                    <ActionButton
                      action={resolveAiFlagAction.bind(null, listing.id, "approve")}
                      icon={<CheckIcon className="h-3.5 w-3.5" />}
                      successMessage={`"${listing.title}" için bayrak onaylandı, ilan yayında kalmaya devam ediyor.`}
                      errorMessage="Bayrak çözülemedi. Lütfen tekrar deneyin."
                      className="w-full rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
                    >
                      Onayla
                    </ActionButton>
                    <ConfirmActionButton
                      action={resolveAiFlagAction.bind(null, listing.id, "reject")}
                      icon={<XCircleIcon className="h-3.5 w-3.5" />}
                      confirmTitle="İlanı yayından kaldır"
                      confirmMessage={`"${listing.title}" ilanını yayından kaldırmak istediğinize emin misiniz?`}
                      confirmLabel="Evet, kaldır"
                      successMessage={`"${listing.title}" ilanı yayından kaldırıldı.`}
                      errorMessage="İlan yayından kaldırılamadı. Lütfen tekrar deneyin."
                      tone="danger"
                      className="w-full rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      Reddet
                    </ConfirmActionButton>
                    <ActionButton
                      action={resolveAiFlagAction.bind(null, listing.id, "warn")}
                      icon={<BellIcon className="h-3.5 w-3.5" />}
                      successMessage="Kullanıcıya uyarı gönderildi."
                      errorMessage="Uyarı gönderilemedi. Lütfen tekrar deneyin."
                      className="w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                    >
                      Kullanıcıyı Uyar
                    </ActionButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <FlagIcon className="h-4 w-4" />
            Kullanıcı Şikayetleri
          </h2>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
            {reports.length}
          </span>
        </div>

        {reports.length === 0 ? (
          <EmptyState message="Bekleyen kullanıcı şikayeti yok." />
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border border-slate-100 bg-white p-4 shadow-soft transition-shadow hover:shadow-soft-lg"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 shadow-sm">
                    {report.listing.images[0] ? (
                      <Image src={report.listing.images[0].url} alt="" fill sizes="96px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/ilan/${report.listing.listingNo}`}
                        target="_blank"
                        className="font-medium text-foreground hover:underline"
                      >
                        {report.listing.title}
                      </Link>
                      <span className="text-xs text-slate-400">#{report.listing.listingNo}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Satıcı: {report.listing.user.name} · {report.listing.user.email}
                    </p>
                    <p className="text-xs text-slate-500">
                      Şikayet eden: {report.user ? `${report.user.name} (${report.user.email})` : "Misafir"} ·{" "}
                      {formatDate(report.createdAt)}
                    </p>

                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 text-sm text-slate-600">
                      <MessageIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{report.reason}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-1.5 sm:w-40 sm:flex-col">
                    <ActionButton
                      action={resolveListingReportAction.bind(null, report.id, "approve")}
                      icon={<CheckIcon className="h-3.5 w-3.5" />}
                      successMessage="Şikayet incelendi ve geçersiz bulundu; ilan yayında kalacak."
                      errorMessage="Şikayet işlenemedi. Lütfen tekrar deneyin."
                      className="w-full rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
                    >
                      Onayla
                    </ActionButton>
                    <ConfirmActionButton
                      action={resolveListingReportAction.bind(null, report.id, "reject")}
                      icon={<XCircleIcon className="h-3.5 w-3.5" />}
                      confirmTitle="İlanı yayından kaldır"
                      confirmMessage={`Şikayeti onaylayıp "${report.listing.title}" ilanını yayından kaldırmak istediğinize emin misiniz?`}
                      confirmLabel="Evet, kaldır"
                      successMessage={`"${report.listing.title}" ilanı yayından kaldırıldı ve şikayet çözüldü.`}
                      errorMessage="İlan yayından kaldırılamadı. Lütfen tekrar deneyin."
                      tone="danger"
                      className="w-full rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      Reddet
                    </ConfirmActionButton>
                    <ActionButton
                      action={resolveListingReportAction.bind(null, report.id, "warn")}
                      icon={<BellIcon className="h-3.5 w-3.5" />}
                      successMessage="Satıcıya uyarı gönderildi ve şikayet çözüldü."
                      errorMessage="Uyarı gönderilemedi. Lütfen tekrar deneyin."
                      className="w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                    >
                      Kullanıcıyı Uyar
                    </ActionButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
