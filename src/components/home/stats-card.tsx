import { FileText, ShieldCheck, Sparkles, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";

// Tüm sayılar gerçek veritabanı sorgularından gelir - demo/seed verisi
// (isDemo) hariç tutulur ki rakamlar siteye yeni başlayan biri için bile
// dürüst kalsın (bkz. kullanıcı talebi: "uydurma rakam koyma").
async function getHomeStats() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [totalListings, newToday, cleanListings, activeUsers] = await Promise.all([
    prisma.listing.count({ where: { status: "active", isDemo: false } }),
    prisma.listing.count({ where: { status: "active", isDemo: false, createdAt: { gte: startOfToday } } }),
    prisma.listing.count({
      where: { status: "active", isDemo: false, listingReports: { none: { status: "pending" } } },
    }),
    prisma.user.count({ where: { isBanned: false, isDemo: false } }),
  ]);

  return { totalListings, newToday, cleanListings, activeUsers };
}

const numberFormatter = new Intl.NumberFormat("tr-TR");

export async function StatsCard() {
  const stats = await getHomeStats();

  const rows = [
    { icon: FileText, label: "Toplam İlan", value: stats.totalListings },
    { icon: Sparkles, label: "Yeni İlan", value: stats.newToday },
    { icon: ShieldCheck, label: "YZ Onaylı İlan", value: stats.cleanListings },
    { icon: Users, label: "Aktif Kullanıcı", value: stats.activeUsers },
  ];

  return (
    <section className="rounded-xl bg-white p-4 shadow-soft">
      <h2 className="text-sm font-bold text-foreground">Bugün ilanlio&apos;da</h2>
      <div className="mt-3 space-y-2.5">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm text-slate-500">
              <Icon className="h-4 w-4 shrink-0 text-slate-400" />
              {label}
            </span>
            <span className="text-sm font-bold text-foreground">{numberFormatter.format(value)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
