import { notFound } from "next/navigation";
import { requireUserPage } from "@/lib/account-auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { FormSection } from "@/components/form-ui";
import { CalendarIcon, CheckCircleIcon, GearIcon, TagIcon, XCircleIcon } from "@/components/icons";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { NotificationPreferencesForm } from "./notification-preferences-form";

const BADGE_LABELS: Record<string, string> = {
  galeri: "Galeri",
  kurumsal: "Kurumsal",
};

export default async function AccountSettingsPage() {
  const session = await requireUserPage("/hesabim/ayarlar");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      name: true,
      email: true,
      phone: true,
      il: true,
      ilce: true,
      avatarUrl: true,
      isVerified: true,
      badge: true,
      createdAt: true,
      notifyNewMessage: true,
      notifySavedSearch: true,
      notifyListingUpdates: true,
    },
  });

  if (!user) notFound();

  return (
    <div className="space-y-6">
      <PageHeader icon={GearIcon} title="Hesap Ayarları" description="Profil, güvenlik ve bildirim tercihleriniz." />

      <ProfileForm
        name={user.name}
        email={user.email}
        phone={user.phone}
        il={user.il}
        ilce={user.ilce}
        avatarUrl={user.avatarUrl}
      />

      <PasswordForm />

      <NotificationPreferencesForm
        notifyNewMessage={user.notifyNewMessage}
        notifySavedSearch={user.notifySavedSearch}
        notifyListingUpdates={user.notifyListingUpdates}
      />

      <FormSection title="Üyelik Bilgisi" description="Hesabınızla ilgili genel bilgiler." icon={TagIcon} accent="slate">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <CalendarIcon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-xs text-slate-400">Üyelik Tarihi</p>
              <p className="text-sm font-semibold text-foreground">{formatDate(user.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                user.isVerified ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
              }`}
            >
              {user.isVerified ? <CheckCircleIcon className="h-4.5 w-4.5" /> : <XCircleIcon className="h-4.5 w-4.5" />}
            </span>
            <div>
              <p className="text-xs text-slate-400">Doğrulama Durumu</p>
              <p className="text-sm font-semibold text-foreground">
                {user.isVerified ? "Doğrulanmış" : "Doğrulanmamış"}
              </p>
            </div>
          </div>

          {user.badge && (
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <TagIcon className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-xs text-slate-400">Üyelik Tipi</p>
                <p className="text-sm font-semibold text-foreground">{BADGE_LABELS[user.badge] ?? user.badge}</p>
              </div>
            </div>
          )}
        </div>
      </FormSection>
    </div>
  );
}
