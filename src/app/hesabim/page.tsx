import type { ComponentType } from "react";
import Link from "next/link";
import { CheckCircle2, Heart, LayoutDashboard, MessageCircle, Plus } from "lucide-react";
import { requireUserPage } from "@/lib/account-auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { RelativeTime } from "@/components/relative-time";
import { VerificationBanner } from "@/components/verification-banner";

type ActivityItem = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  text: string;
  href: string;
  createdAt: Date;
};

export default async function AccountDashboardPage() {
  const session = await requireUserPage();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [activeListingsCount, totalFavoritedCount, messageCount30d, recentMessages, recentFavorites] = await Promise.all([
    prisma.listing.count({ where: { userId: session.id, status: "active" } }),
    prisma.favorite.count({ where: { listing: { userId: session.id } } }),
    prisma.message.count({
      where: {
        conversation: { OR: [{ buyerId: session.id }, { sellerId: session.id }] },
        senderId: { not: session.id },
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.message.findMany({
      where: {
        conversation: { OR: [{ buyerId: session.id }, { sellerId: session.id }] },
        senderId: { not: session.id },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        sender: { select: { name: true } },
        conversation: { select: { id: true, listing: { select: { title: true } } } },
      },
    }),
    prisma.favorite.findMany({
      where: { listing: { userId: session.id } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { listing: { select: { title: true, listingNo: true } }, user: { select: { name: true } } },
    }),
  ]);

  const activity: ActivityItem[] = [
    ...recentMessages.map((m) => ({
      id: `msg-${m.id}`,
      icon: MessageCircle,
      text: `${m.sender.name}, "${m.conversation.listing.title}" ilanınız için mesaj gönderdi.`,
      href: `/hesabim/mesajlar?c=${m.conversation.id}`,
      createdAt: m.createdAt,
    })),
    ...recentFavorites.map((f) => ({
      id: `fav-${f.id}`,
      icon: Heart,
      text: `${f.user.name}, "${f.listing.title}" ilanınızı favorilere ekledi.`,
      href: `/ilan/${f.listing.listingNo}`,
      createdAt: f.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader icon={LayoutDashboard} title="Özet" description={`Hoş geldin, ${session.name}.`} accent="indigo" />

      {!session.emailVerified && <VerificationBanner />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Yayında Olan İlan" value={activeListingsCount} icon={CheckCircle2} accent="emerald" />
        <StatCard label="Favoriye Eklenme" value={totalFavoritedCount} icon={Heart} accent="red" />
        <StatCard label="Gelen Mesaj (Son 30 Gün)" value={messageCount30d} icon={MessageCircle} accent="violet" />
      </div>

      <section className="flex flex-col items-start justify-between gap-4 rounded-xl bg-brand p-6 text-white shadow-soft sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold">Satacak bir şeyin mi var?</h2>
          <p className="mt-1 text-sm text-white/70">Hemen ücretsiz ilan ver, binlerce alıcıya ulaş.</p>
        </div>
        <Link
          href="/ilan-ver"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-brand shadow-sm transition-colors hover:bg-accent-dark"
        >
          <Plus className="h-4 w-4" />
          Hemen İlan Ver
        </Link>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-soft sm:p-6">
        <h2 className="mb-1 text-sm font-bold text-foreground">Son Aktiviteler</h2>
        {activity.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">Henüz bir aktivite yok.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {activity.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-start gap-3 rounded-lg px-1 py-3 transition-colors hover:bg-slate-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-light text-brand">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug text-foreground">{item.text}</p>
                      <RelativeTime date={item.createdAt} className="mt-0.5 block text-xs text-slate-400" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
