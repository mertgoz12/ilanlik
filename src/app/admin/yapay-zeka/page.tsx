import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEffectiveSettings } from "@/lib/analysis-config";
import { ANTHROPIC_MODEL } from "@/lib/ai-analysis";
import { DAMAGE_PART_STATUSES, damagePartStatusLabel } from "@/lib/car-data";
import { formatDate, formatPrice } from "@/lib/format";
import { ToastForm } from "@/components/admin/action-button";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { FormSection, inputClass, labelClass, selectClass } from "@/components/form-ui";
import {
  ActivityIcon,
  CheckIcon,
  ClockIcon,
  CoinIcon,
  InboxIcon,
  ShieldCheckIcon,
  SparkleIcon,
  TrendDownIcon,
  UsersIcon,
} from "@/components/icons";
import { AiTriggerForm } from "./ai-trigger-form";
import { updateAiSettingsAction } from "./actions";

const REPORT_LOG_LIMIT = 50;

const REPORT_STATUS_LABELS: Record<string, string> = {
  tamamlandi: "Tamamlandı",
  odeme_bekliyor: "Ödeme Bekliyor",
  odendi: "Ödendi",
  beklemede: "Beklemede",
};

const REPORT_STATUS_STYLES: Record<string, string> = {
  tamamlandi: "border-emerald-200 bg-emerald-50 text-emerald-700",
  odeme_bekliyor: "border-amber-200 bg-amber-50 text-amber-700",
  odendi: "border-emerald-200 bg-emerald-50 text-emerald-700",
  beklemede: "border-slate-200 bg-slate-100 text-slate-600",
};

function toPercentInput(ratio: number): string {
  return (ratio * 100).toFixed(1);
}

export default async function AdminAiPage() {
  const [settings, logs] = await Promise.all([
    getEffectiveSettings(),
    prisma.aiReportLog.findMany({
      orderBy: { createdAt: "desc" },
      take: REPORT_LOG_LIMIT,
      include: { listing: { select: { listingNo: true, title: true, aiAnalysis: true, aiReportStatus: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={SparkleIcon}
        title="Yapay Zeka Kontrol Paneli"
        description="Rapor fiyatlandırması, günlük limitler ve değer kaybı katsayılarını buradan yönetebilirsiniz."
        accent="emerald"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Fiyatlandırma Modu"
          value={settings.aiReportPricingMode === "ucretli" ? "Ücretli" : "Ücretsiz"}
          hint={settings.aiReportPricingMode === "ucretli" ? `${formatPrice(settings.aiReportPrice)} / rapor` : "Tüm kullanıcılara ücretsiz"}
          icon={CoinIcon}
          accent="emerald"
        />
        <StatCard
          label="Kullanıcı Başına Günlük Limit"
          value={settings.aiReportDailyLimitPerUser}
          icon={UsersIcon}
          accent="indigo"
        />
        <StatCard
          label="Toplam Günlük Tavan"
          value={settings.aiReportDailyGlobalCap}
          icon={ActivityIcon}
          accent="blue"
        />
        <StatCard label="Son Kayıtlar" value={logs.length} hint={`Son ${REPORT_LOG_LIMIT} işlem listeleniyor`} icon={ClockIcon} accent="slate" />
      </div>

      <ToastForm
        action={updateAiSettingsAction}
        successMessage="Ayarlar kaydedildi."
        errorMessage="Ayarlar kaydedilemedi. Lütfen tekrar deneyin."
        className="space-y-6"
      >
        <FormSection title="Fiyatlandırma ve Limitler" icon={CoinIcon} accent="emerald">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="aiReportPricingMode" className={labelClass}>
                Fiyatlandırma Modu
              </label>
              <select
                id="aiReportPricingMode"
                name="aiReportPricingMode"
                defaultValue={settings.aiReportPricingMode}
                className={selectClass}
              >
                <option value="ucretsiz">Ücretsiz</option>
                <option value="ucretli">Ücretli</option>
              </select>
            </div>
            <div>
              <label htmlFor="aiReportPrice" className={labelClass}>
                Rapor Fiyatı (TL)
              </label>
              <input
                id="aiReportPrice"
                name="aiReportPrice"
                type="number"
                min="0"
                step="0.01"
                defaultValue={settings.aiReportPrice}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="aiReportDailyLimitPerUser" className={labelClass}>
                Kullanıcı Başına Günlük Limit
              </label>
              <input
                id="aiReportDailyLimitPerUser"
                name="aiReportDailyLimitPerUser"
                type="number"
                min="1"
                step="1"
                defaultValue={settings.aiReportDailyLimitPerUser}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="aiReportDailyGlobalCap" className={labelClass}>
                Toplam Günlük Tavan
              </label>
              <input
                id="aiReportDailyGlobalCap"
                name="aiReportDailyGlobalCap"
                type="number"
                min="1"
                step="1"
                defaultValue={settings.aiReportDailyGlobalCap}
                className={inputClass}
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Parça Durumu Değer Kaybı Katsayıları"
          description="Her parça durumunun ilan fiyatına oranla yol açtığı tahmini değer kaybı (%)."
          icon={TrendDownIcon}
          accent="amber"
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {DAMAGE_PART_STATUSES.map(({ value }) => (
              <div key={value}>
                <label htmlFor={`part_${value}`} className={labelClass}>
                  {damagePartStatusLabel(value)} (%)
                </label>
                <input
                  id={`part_${value}`}
                  name={`part_${value}`}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  defaultValue={toPercentInput(settings.deprecation.partDeprecationRates[value])}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </FormSection>

        <FormSection
          title="TRAMER Oranı Kademeleri"
          description="TRAMER tutarının ilan fiyatına oranına göre uygulanan ek değer kaybı (%)."
          icon={ActivityIcon}
          accent="blue"
        >
          <div className="space-y-3">
            {settings.deprecation.tramerDeprecationTiers.map((tier, i) => {
              const isLast = i === settings.deprecation.tramerDeprecationTiers.length - 1;
              return (
                <div key={i} className="grid grid-cols-2 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <div>
                    <label htmlFor={`tramer_max_${i}`} className={labelClass}>
                      Oran Üst Sınırı (%)
                    </label>
                    {isLast ? (
                      <input disabled value="Üzeri" className={`${inputClass} text-slate-400`} />
                    ) : (
                      <input
                        id={`tramer_max_${i}`}
                        name={`tramer_max_${i}`}
                        type="number"
                        min="0"
                        max="1000"
                        step="0.1"
                        defaultValue={toPercentInput(tier.maxRatio)}
                        className={inputClass}
                      />
                    )}
                  </div>
                  <div>
                    <label htmlFor={`tramer_rate_${i}`} className={labelClass}>
                      Ek Değer Kaybı (%)
                    </label>
                    <input
                      id={`tramer_rate_${i}`}
                      name={`tramer_rate_${i}`}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      defaultValue={toPercentInput(tier.rate)}
                      className={inputClass}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </FormSection>

        <FormSection title="Genel Sınır" icon={ShieldCheckIcon} accent="red">
          <div className="sm:w-64">
            <label htmlFor="maxDeprecationRatio" className={labelClass}>
              Azami Toplam Değer Kaybı (%)
            </label>
            <input
              id="maxDeprecationRatio"
              name="maxDeprecationRatio"
              type="number"
              min="0"
              max="100"
              step="0.1"
              defaultValue={toPercentInput(settings.deprecation.maxDeprecationRatio)}
              className={inputClass}
            />
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

      <FormSection
        title="Manuel Rapor Tetikle"
        description="Bir ilan numarası girerek, fiyatlandırma modundan ve günlük limitlerden bağımsız, ücretsiz bir yapay zeka raporu oluşturun."
        icon={SparkleIcon}
        accent="violet"
      >
        <AiTriggerForm />
      </FormSection>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          <ClockIcon className="h-4 w-4" />
          Son Yapay Zeka Analizleri ({logs.length})
        </h2>
        <div className="overflow-hidden rounded-xl bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">İlan</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const status = log.listing.aiReportStatus ?? (log.listing.aiAnalysis ? "tamamlandi" : "beklemede");
                  return (
                    <tr key={log.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <Link
                          href={`/ilan/${log.listing.listingNo}`}
                          target="_blank"
                          className="font-medium text-foreground hover:underline"
                        >
                          {log.listing.title}
                        </Link>
                        <span className="ml-1 text-xs text-slate-400">#{log.listing.listingNo}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(log.createdAt)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{ANTHROPIC_MODEL}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${REPORT_STATUS_STYLES[status] ?? REPORT_STATUS_STYLES.beklemede}`}
                        >
                          {REPORT_STATUS_LABELS[status] ?? status}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                          <InboxIcon className="h-6 w-6" />
                        </span>
                        Henüz yapay zeka raporu üretilmedi.
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
