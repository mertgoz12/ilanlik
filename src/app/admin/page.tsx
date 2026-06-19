import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AI_REPORT_ESTIMATED_COST_TRY } from "@/lib/analysis-config";
import { StatCard } from "@/components/admin/stat-card";
import { PageHeader } from "@/components/admin/page-header";
import {
  CarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  CoinIcon,
  FlagIcon,
  SparkleIcon,
  UsersIcon,
} from "@/components/icons";

const CHART_DAYS = 7;

function startOfDayUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function formatCost(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function AdminDashboardPage() {
  const today = startOfDayUtc(new Date());
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const chartStart = new Date(today);
  chartStart.setUTCDate(chartStart.getUTCDate() - (CHART_DAYS - 1));

  const [
    totalListings,
    activeListings,
    pendingListings,
    totalUsers,
    bannedUsers,
    aiReportsToday,
    aiReportsYesterday,
    pendingReports,
    moderationQueueCount,
    recentListings,
  ] = await Promise.all([
    prisma.listing.count({ where: { status: { not: "silindi" } } }),
    prisma.listing.count({ where: { status: "active" } }),
    prisma.listing.count({ where: { status: "pending_review" } }),
    prisma.user.count(),
    prisma.user.count({ where: { isBanned: true } }),
    prisma.aiReportLog.count({ where: { createdAt: { gte: today } } }),
    prisma.aiReportLog.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
    prisma.listingReport.count({ where: { status: "pending" } }),
    prisma.listing.count({ where: { aiAnalysis: { not: null }, flagResolvedAt: null, status: { not: "silindi" } } }),
    prisma.listing.findMany({
      where: { createdAt: { gte: chartStart }, status: { not: "silindi" } },
      select: { createdAt: true },
    }),
  ]);

  const dayBuckets = new Map<string, number>();
  for (let i = 0; i < CHART_DAYS; i++) {
    const d = new Date(chartStart);
    d.setUTCDate(d.getUTCDate() + i);
    dayBuckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const listing of recentListings) {
    const key = startOfDayUtc(listing.createdAt).toISOString().slice(0, 10);
    if (dayBuckets.has(key)) dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
  }

  const chartData = Array.from(dayBuckets.entries()).map(([date, count]) => ({ date, count }));
  const maxCount = Math.max(1, ...chartData.map((d) => d.count));
  const weekTotal = chartData.reduce((sum, d) => sum + d.count, 0);
  const estimatedCostToday = aiReportsToday * AI_REPORT_ESTIMATED_COST_TRY;

  const aiReportDiff = aiReportsToday - aiReportsYesterday;
  const aiTrend =
    aiReportDiff === 0
      ? undefined
      : {
          direction: (aiReportDiff > 0 ? "up" : "down") as "up" | "down",
          label: `Dün ${aiReportsYesterday} idi`,
        };

  const quickLinks = [
    {
      href: "/admin/ilanlar?status=pending_review",
      label: "İncelemedeki İlanlar",
      count: pendingListings,
      icon: ClockIcon,
      accent: "amber" as const,
    },
    {
      href: "/admin/moderasyon",
      label: "Moderasyon Kuyruğu",
      count: moderationQueueCount + pendingReports,
      icon: FlagIcon,
      accent: "red" as const,
    },
    {
      href: "/admin/kullanicilar?durum=banned",
      label: "Banlı Kullanıcılar",
      count: bannedUsers,
      icon: UsersIcon,
      accent: "slate" as const,
    },
    {
      href: "/admin/yapay-zeka",
      label: "Yapay Zeka Paneli",
      count: null,
      icon: SparkleIcon,
      accent: "violet" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ChartBarIcon}
        title="Özet"
        description="Platformun genel durumuna hızlı bir bakış."
        accent="slate"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Toplam İlan" value={totalListings} icon={CarIcon} accent="blue" />
        <StatCard label="Aktif İlan" value={activeListings} icon={CheckCircleIcon} accent="emerald" />
        <StatCard
          label="İncelemede"
          value={pendingListings}
          hint="Onay bekleyen ilanlar"
          highlight={pendingListings > 0}
          icon={ClockIcon}
          accent="amber"
        />
        <StatCard label="Toplam Kullanıcı" value={totalUsers} icon={UsersIcon} accent="indigo" />
        <StatCard
          label="Bugünkü Yapay Zeka Raporu"
          value={aiReportsToday}
          icon={SparkleIcon}
          accent="violet"
          trend={aiTrend}
        />
        <StatCard
          label="Tahmini Maliyet (Bugün)"
          value={formatCost(estimatedCostToday)}
          hint={`Rapor başına ~${formatCost(AI_REPORT_ESTIMATED_COST_TRY)}`}
          icon={CoinIcon}
          accent="slate"
        />
      </div>

      <section className="rounded-xl bg-white p-6 shadow-soft">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Son 7 Günün İlan Sayısı</h2>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Toplam {weekTotal}
          </span>
        </div>
        <div className="flex items-end gap-2 sm:gap-4" style={{ height: "180px" }}>
          {chartData.map((d, i) => (
            <div
              key={d.date}
              className="animate-fade-in-up flex flex-1 flex-col items-center gap-2"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex h-full w-full items-end">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm transition-all"
                  style={{ height: `${Math.max(4, (d.count / maxCount) * 100)}%` }}
                  title={`${d.count} ilan`}
                />
              </div>
              <span className="text-xs font-semibold text-foreground">{d.count}</span>
              <span className="text-xs text-slate-400">
                {new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(
                  new Date(d.date),
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Hızlı Erişim</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    {
                      amber: "bg-amber-100 text-amber-600",
                      red: "bg-red-100 text-red-600",
                      slate: "bg-slate-100 text-slate-600",
                      violet: "bg-violet-100 text-violet-600",
                    }[link.accent]
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{link.label}</p>
                  {link.count !== null && <p className="text-xs text-slate-400">{link.count} öğe</p>}
                </div>
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
