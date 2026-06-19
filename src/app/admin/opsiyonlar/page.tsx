import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { expireStaleOptions, getOptionSettings } from "@/lib/listing-options";
import { formatRemainingTime } from "@/lib/option-format";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { ConfirmActionButton, ToastForm } from "@/components/admin/action-button";
import { FormSection, inputClass, labelClass } from "@/components/form-ui";
import { CheckIcon, ClockIcon, GaugeIcon, InboxIcon, ShieldCheckIcon, TrashIcon, UsersIcon } from "@/components/icons";
import { adminEndOptionAction, updateOptionSettingsAction } from "./actions";

const HISTORY_LIMIT = 30;

const END_REASON_LABELS: Record<string, string> = {
  alici_vazgecti: "Alıcı vazgeçti",
  satici_sonlandirdi: "Satıcı sonlandırdı",
  suresi_doldu: "Süresi doldu",
  admin_sonlandirdi: "Yönetici sonlandırdı",
};

export default async function AdminOptionsPage() {
  await expireStaleOptions();

  const [settings, activeOptions, recentHistory, totalActiveCount] = await Promise.all([
    getOptionSettings(),
    prisma.listing.findMany({
      where: { optionStatus: "opsiyonlandi" },
      orderBy: { optionStartAt: "desc" },
      include: {
        optionHolder: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.listingOption.findMany({
      where: { status: "bitti" },
      orderBy: { endedAt: "desc" },
      take: HISTORY_LIMIT,
      include: {
        listing: { select: { listingNo: true, title: true } },
        buyer: { select: { name: true } },
      },
    }),
    prisma.listingOption.count({ where: { status: "aktif" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClockIcon}
        title="Opsiyonlama Yönetimi"
        description="Opsiyon sürelerini, kullanıcı limitlerini ve aktif/geçmiş opsiyonları buradan yönetebilirsiniz."
        accent="amber"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Aktif Opsiyon" value={totalActiveCount} icon={ClockIcon} accent="amber" />
        <StatCard
          label="Kullanıcı Başına Limit"
          value={settings.maxActivePerUser}
          icon={UsersIcon}
          accent="indigo"
        />
        <StatCard
          label="Haftalık İptal Limiti"
          value={settings.maxWeeklyCancellations}
          icon={ShieldCheckIcon}
          accent="red"
        />
        <StatCard
          label="Süre Seçenekleri"
          value={settings.durationsHours.length}
          hint={settings.durationsHours.map((h) => `${h} sa.`).join(", ")}
          icon={GaugeIcon}
          accent="blue"
        />
      </div>

      <ToastForm
        action={updateOptionSettingsAction}
        successMessage="Ayarlar kaydedildi."
        errorMessage="Ayarlar kaydedilemedi. Lütfen tekrar deneyin."
        className="space-y-6"
      >
        <FormSection
          title="Opsiyon Ayarları"
          description="Alıcıların seçebileceği opsiyon süreleri ve kötüye kullanım limitleri."
          icon={GaugeIcon}
          accent="amber"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="optionDurationsHours" className={labelClass}>
                Süre Seçenekleri (saat, virgülle ayırın)
              </label>
              <input
                id="optionDurationsHours"
                name="optionDurationsHours"
                type="text"
                defaultValue={settings.durationsHours.join(", ")}
                placeholder="24, 48, 72"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="optionMaxActivePerUser" className={labelClass}>
                Kullanıcı Başına Azami Aktif Opsiyon
              </label>
              <input
                id="optionMaxActivePerUser"
                name="optionMaxActivePerUser"
                type="number"
                min="1"
                step="1"
                defaultValue={settings.maxActivePerUser}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="optionMaxWeeklyCancellations" className={labelClass}>
                Haftalık Azami İptal Sayısı
              </label>
              <input
                id="optionMaxWeeklyCancellations"
                name="optionMaxWeeklyCancellations"
                type="number"
                min="1"
                step="1"
                defaultValue={settings.maxWeeklyCancellations}
                className={inputClass}
              />
            </div>
          </div>
        </FormSection>

        <div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckIcon className="h-4 w-4" />
            Ayarları Kaydet
          </button>
        </div>
      </ToastForm>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          <ClockIcon className="h-4 w-4" />
          Aktif Opsiyonlar ({activeOptions.length})
        </h2>
        <div className="overflow-hidden rounded-xl bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">İlan</th>
                  <th className="px-4 py-3">Alıcı</th>
                  <th className="px-4 py-3">Satıcı</th>
                  <th className="px-4 py-3">Kalan Süre</th>
                  <th className="px-4 py-3">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeOptions.map((listing) => (
                  <tr key={listing.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <Link
                        href={`/ilan/${listing.listingNo}`}
                        target="_blank"
                        className="font-medium text-foreground hover:underline"
                      >
                        {listing.title}
                      </Link>
                      <span className="ml-1 text-xs text-slate-400">#{listing.listingNo}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{listing.optionHolder?.name ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{listing.user.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-amber-700">
                      {listing.optionEndAt ? formatRemainingTime(listing.optionEndAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <ConfirmActionButton
                        action={adminEndOptionAction.bind(null, listing.id)}
                        icon={<TrashIcon className="h-3.5 w-3.5" />}
                        confirmTitle="Opsiyonu sonlandır"
                        confirmMessage={`"${listing.title}" ilanındaki opsiyonu manuel olarak sonlandırmak istediğinize emin misiniz?`}
                        confirmLabel="Evet, sonlandır"
                        successMessage="Opsiyon sonlandırıldı."
                        errorMessage="İşlem gerçekleştirilemedi. Lütfen tekrar deneyin."
                        tone="danger"
                        className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        Sonlandır
                      </ConfirmActionButton>
                    </td>
                  </tr>
                ))}

                {activeOptions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                          <InboxIcon className="h-6 w-6" />
                        </span>
                        Şu anda aktif bir opsiyon yok.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          <ClockIcon className="h-4 w-4" />
          Opsiyon Geçmişi (Son {HISTORY_LIMIT})
        </h2>
        <div className="overflow-hidden rounded-xl bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">İlan</th>
                  <th className="px-4 py-3">Alıcı</th>
                  <th className="px-4 py-3">Sonuç</th>
                  <th className="px-4 py-3">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentHistory.map((option) => (
                  <tr key={option.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <Link
                        href={`/ilan/${option.listing.listingNo}`}
                        target="_blank"
                        className="font-medium text-foreground hover:underline"
                      >
                        {option.listing.title}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{option.buyer.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {END_REASON_LABELS[option.endReason ?? ""] ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {option.endedAt ? formatDate(option.endedAt) : "—"}
                    </td>
                  </tr>
                ))}

                {recentHistory.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                          <InboxIcon className="h-6 w-6" />
                        </span>
                        Henüz sonlanmış bir opsiyon yok.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
