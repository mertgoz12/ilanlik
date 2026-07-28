import Link from "next/link";
import { Bell, CheckCircle2, XCircle, MessageCircle, Tag, MapPin, type LucideIcon } from "lucide-react";
import { requireUserPage } from "@/lib/account-auth";
import { getNotifications } from "@/lib/notifications";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { MarkNotificationsRead } from "./mark-read";

// Bildirim tipine göre ikon + renk (her tip kendi görünümüyle).
const TYPE_META: Record<string, { Icon: LucideIcon; wrap: string }> = {
  listing_approved: { Icon: CheckCircle2, wrap: "bg-emerald-50 text-emerald-600" },
  listing_rejected: { Icon: XCircle, wrap: "bg-red-50 text-red-500" },
  new_message: { Icon: MessageCircle, wrap: "bg-blue-50 text-blue-600" },
  new_offer: { Icon: Tag, wrap: "bg-amber-50 text-amber-600" },
  new_listing_nearby: { Icon: MapPin, wrap: "bg-sky-50 text-sky-600" },
};
const DEFAULT_META = { Icon: Bell, wrap: "bg-slate-100 text-slate-400" };

export default async function NotificationsPage() {
  const session = await requireUserPage("/hesabim/bildirimler");
  const notifications = await getNotifications(session.id);
  const hasUnread = notifications.some((n) => n.readAt === null);

  return (
    <div className="space-y-6">
      <MarkNotificationsRead hasUnread={hasUnread} />

      <PageHeader
        icon={Bell}
        title="Bildirimler"
        description={
          notifications.length === 0
            ? "Henüz bildiriminiz yok."
            : `${notifications.length} bildiriminiz var.`
        }
        accent="blue"
      />

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-12 text-center text-sm text-slate-400 shadow-soft">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
            <Bell className="h-6 w-6" />
          </span>
          İlanlarınızla ilgili gelişmeler burada görünecek.
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const meta = TYPE_META[n.type] ?? DEFAULT_META;
            const unread = n.readAt === null;
            const Inner = (
              <div
                className={`flex items-start gap-3 rounded-xl p-4 shadow-soft transition-colors ${
                  unread ? "bg-brand/5 ring-1 ring-brand/15" : "bg-white"
                } ${n.link ? "hover:bg-slate-50" : ""}`}
              >
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.wrap}`}
                >
                  <meta.Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{n.title}</p>
                    {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600">{n.body}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(n.createdAt)}</p>
                </div>
              </div>
            );

            return n.link ? (
              <Link key={n.id} href={n.link}>
                {Inner}
              </Link>
            ) : (
              <div key={n.id}>{Inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
