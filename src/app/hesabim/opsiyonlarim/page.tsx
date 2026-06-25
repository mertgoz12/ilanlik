import Image from "next/image";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { requireUserPage } from "@/lib/account-auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { expireStaleOptions } from "@/lib/listing-options";
import { formatOptionDuration, formatRemainingTime } from "@/lib/option-format";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmActionButton } from "@/components/admin/action-button";
import { ClockIcon, ImageIcon, InboxIcon } from "@/components/icons";
import { endOptionAction } from "@/app/ilan/[listingNo]/actions";

const HISTORY_LIMIT = 10;

const END_REASON_LABELS: Record<string, string> = {
  alici_vazgecti: "Vazgeçtiniz",
  satici_sonlandirdi: "Satıcı sonlandırdı",
  suresi_doldu: "Süresi doldu",
  admin_sonlandirdi: "Yönetici sonlandırdı",
};

export default async function MyOptionsPage() {
  const session = await requireUserPage("/hesabim/opsiyonlarim");
  await expireStaleOptions();

  const [activeListings, history] = await Promise.all([
    prisma.listing.findMany({
      where: { optionHolderId: session.id, optionStatus: "opsiyonlandi" },
      orderBy: { optionStartAt: "desc" },
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
    }),
    prisma.listingOption.findMany({
      where: { buyerId: session.id, status: "bitti" },
      orderBy: { endedAt: "desc" },
      take: HISTORY_LIMIT,
      include: { listing: { select: { title: true, listingNo: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Bookmark}
        title="Opsiyonladıklarım"
        description="Rezerve ettiğiniz ilanlar ve opsiyon geçmişiniz."
        accent="amber"
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Aktif Opsiyonlarım ({activeListings.length})</h2>
        {activeListings.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-10 text-center text-sm text-slate-400 shadow-soft">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
              <ClockIcon className="h-6 w-6" />
            </span>
            Henüz opsiyonladığınız bir ilan yok. İlan detay sayfasındaki &quot;Bu Ürünü Opsiyonla&quot; butonuyla
            rezerve edebilirsiniz.
          </div>
        ) : (
          <div className="space-y-2">
            {activeListings.map((listing) => {
              const image = listing.images[0];
              return (
                <div
                  key={listing.id}
                  className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/ilan/${listing.listingNo}`}
                      className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100"
                    >
                      {image ? (
                        <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </Link>
                    <div>
                      <Link
                        href={`/ilan/${listing.listingNo}`}
                        className="line-clamp-1 font-semibold text-foreground hover:text-brand"
                      >
                        {listing.title}
                      </Link>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">{formatPrice(listing.price)}</p>
                      {listing.optionEndAt && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-amber-700">
                          <ClockIcon className="h-3.5 w-3.5" />
                          {formatRemainingTime(listing.optionEndAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  <ConfirmActionButton
                    action={endOptionAction.bind(null, listing.id)}
                    icon={<ClockIcon className="h-3.5 w-3.5" />}
                    confirmTitle="Opsiyonu sonlandır"
                    confirmMessage={`"${listing.title}" ilanındaki opsiyondan vazgeçmek istediğinize emin misiniz? İlan tekrar herkese görünür olacak.`}
                    confirmLabel="Evet, vazgeç"
                    successMessage="Opsiyon sonlandırıldı, ilan tekrar yayında."
                    errorMessage="İşlem gerçekleştirilemedi. Lütfen tekrar deneyin."
                    tone="danger"
                    className="shrink-0 self-end rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 sm:self-center"
                  >
                    Opsiyonu Sonlandır (Vazgeç)
                  </ConfirmActionButton>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Opsiyon Geçmişim</h2>
        {history.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-10 text-center text-sm text-slate-400 shadow-soft">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
              <InboxIcon className="h-6 w-6" />
            </span>
            Henüz sonlanmış bir opsiyonunuz yok.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-3">İlan</th>
                    <th className="px-4 py-3">Süre</th>
                    <th className="px-4 py-3">Sonuç</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((option) => (
                    <tr key={option.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <Link
                          href={`/ilan/${option.listing.listingNo}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {option.listing.title}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {formatOptionDuration(option.durationHours)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {END_REASON_LABELS[option.endReason ?? ""] ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
