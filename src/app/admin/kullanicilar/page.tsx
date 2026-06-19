import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { formatDate } from "@/lib/format";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminAvatar } from "@/components/admin/admin-avatar";
import { ActionButton, ConfirmActionButton, ToastForm } from "@/components/admin/action-button";
import { PageHeader } from "@/components/admin/page-header";
import { inputClass, labelClass, selectClass } from "@/components/form-ui";
import {
  AlertIcon,
  CheckCircleIcon,
  CheckIcon,
  InboxIcon,
  ShieldCheckIcon,
  TagIcon,
  UsersIcon,
  XCircleIcon,
} from "@/components/icons";
import { setUserAdminAction, setUserBadgeAction, setUserBanAction, setUserVerifiedAction } from "./actions";

const PAGE_SIZE = 20;

const BADGE_LABELS: Record<string, string> = {
  galeri: "Galeri",
  kurumsal: "Kurumsal",
};

type SearchParams = { q?: string; role?: string; durum?: string; page?: string };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const admin = await getAdminSession();
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.UserWhereInput = {};
  if (sp.q) {
    where.OR = [{ name: { contains: sp.q } }, { email: { contains: sp.q } }];
  }
  if (sp.role === "admin" || sp.role === "user") where.role = sp.role;
  if (sp.durum === "banned") where.isBanned = true;
  if (sp.durum === "verified") where.isVerified = true;
  if (sp.durum === "demo") where.isDemo = true;
  if (sp.durum === "gercek") where.isDemo = false;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { listings: true } } },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(sp.q || sp.role || sp.durum);

  return (
    <div className="space-y-6">
      <PageHeader icon={UsersIcon} title="Kullanıcı Yönetimi" description={`Toplam ${total} kullanıcı.`} accent="indigo" />

      <form method="get" className="grid grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow-soft sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor="q" className={labelClass}>
            Ara
          </label>
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={sp.q ?? ""}
            placeholder="İsim veya e-posta..."
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="role" className={labelClass}>
            Rol
          </label>
          <select id="role" name="role" defaultValue={sp.role ?? ""} className={selectClass}>
            <option value="">Tümü</option>
            <option value="user">Kullanıcı</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label htmlFor="durum" className={labelClass}>
            Durum
          </label>
          <select id="durum" name="durum" defaultValue={sp.durum ?? ""} className={selectClass}>
            <option value="">Tümü</option>
            <option value="banned">Banlı</option>
            <option value="verified">Doğrulanmış</option>
            <option value="demo">Sadece Demo</option>
            <option value="gercek">Sadece Gerçek</option>
          </select>
        </div>
        <div className="flex items-end gap-2 sm:col-span-4">
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
          >
            Filtrele
          </button>
          {hasFilters && (
            <Link
              href="/admin/kullanicilar"
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Temizle
            </Link>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-soft transition-shadow hover:shadow-soft-lg"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <AdminAvatar name={user.name} className="h-10 w-10 text-sm" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="font-medium text-foreground">{user.name}</p>
                    {user.isDemo && (
                      <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                        Demo
                      </span>
                    )}
                    {user.role === "admin" && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                        <ShieldCheckIcon className="h-3 w-3" />
                        Admin
                      </span>
                    )}
                    {user.isBanned && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                        <AlertIcon className="h-3 w-3" />
                        Banlı
                      </span>
                    )}
                    {user.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        <CheckCircleIcon className="h-3 w-3" />
                        Doğrulanmış
                      </span>
                    )}
                    {user.badge && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        <TagIcon className="h-3 w-3" />
                        {BADGE_LABELS[user.badge] ?? user.badge}
                      </span>
                    )}
                    {user.warningCount > 0 && (
                      <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        {user.warningCount} uyarı
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{user.email}</p>
                  <p className="mt-1 text-xs text-slate-400">Kayıt: {formatDate(user.createdAt)}</p>
                  <Link
                    href={`/admin/ilanlar?user=${user.id}`}
                    className="mt-1 inline-block text-xs font-medium text-emerald-700 hover:underline"
                  >
                    İlanlarını gör ({user._count.listings})
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {user.isBanned ? (
                  <ActionButton
                    action={setUserBanAction.bind(null, user.id, false)}
                    icon={<CheckIcon className="h-3.5 w-3.5" />}
                    successMessage={`"${user.name}" kullanıcısının banı kaldırıldı.`}
                    errorMessage="Ban kaldırılamadı. Lütfen tekrar deneyin."
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Banı Kaldır
                  </ActionButton>
                ) : (
                  <ConfirmActionButton
                    action={setUserBanAction.bind(null, user.id, true)}
                    icon={<XCircleIcon className="h-3.5 w-3.5" />}
                    confirmTitle="Kullanıcıyı banla"
                    confirmMessage={`"${user.name}" kullanıcısını banlamak istediğinize emin misiniz?`}
                    confirmLabel="Evet, banla"
                    successMessage={`"${user.name}" kullanıcısı banlandı.`}
                    errorMessage="Kullanıcı banlanamadı. Lütfen tekrar deneyin."
                    tone="danger"
                    className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    Banla
                  </ConfirmActionButton>
                )}

                {user.isVerified ? (
                  <ActionButton
                    action={setUserVerifiedAction.bind(null, user.id, false)}
                    successMessage={`"${user.name}" kullanıcısının doğrulaması kaldırıldı.`}
                    errorMessage="Doğrulama kaldırılamadı. Lütfen tekrar deneyin."
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Doğrulamayı Kaldır
                  </ActionButton>
                ) : (
                  <ActionButton
                    action={setUserVerifiedAction.bind(null, user.id, true)}
                    icon={<CheckCircleIcon className="h-3.5 w-3.5" />}
                    successMessage={`"${user.name}" kullanıcısı doğrulandı.`}
                    errorMessage="Kullanıcı doğrulanamadı. Lütfen tekrar deneyin."
                    className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
                  >
                    Doğrula
                  </ActionButton>
                )}

                <ToastForm
                  action={setUserBadgeAction.bind(null, user.id)}
                  successMessage="Rozet güncellendi."
                  errorMessage="Rozet güncellenemedi. Lütfen tekrar deneyin."
                  className="flex items-center gap-1.5"
                >
                  <select
                    name="badge"
                    defaultValue={user.badge ?? ""}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">Rozet yok</option>
                    <option value="galeri">Galeri</option>
                    <option value="kurumsal">Kurumsal</option>
                  </select>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <TagIcon className="h-3.5 w-3.5" />
                    Kaydet
                  </button>
                </ToastForm>

                {user.id !== admin?.id &&
                  (user.role === "admin" ? (
                    <ConfirmActionButton
                      action={setUserAdminAction.bind(null, user.id, false)}
                      icon={<ShieldCheckIcon className="h-3.5 w-3.5" />}
                      confirmTitle="Admin yetkisini kaldır"
                      confirmMessage={`"${user.name}" kullanıcısının admin yetkisini kaldırmak istediğinize emin misiniz?`}
                      confirmLabel="Evet, kaldır"
                      successMessage={`"${user.name}" kullanıcısının admin yetkisi kaldırıldı.`}
                      errorMessage="Admin yetkisi kaldırılamadı. Lütfen tekrar deneyin."
                      tone="danger"
                      className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                    >
                      Admin Yetkisini Kaldır
                    </ConfirmActionButton>
                  ) : (
                    <ConfirmActionButton
                      action={setUserAdminAction.bind(null, user.id, true)}
                      icon={<ShieldCheckIcon className="h-3.5 w-3.5" />}
                      confirmTitle="Admin yap"
                      confirmMessage={`"${user.name}" kullanıcısını admin yapmak istediğinize emin misiniz?`}
                      confirmLabel="Evet, admin yap"
                      successMessage={`"${user.name}" kullanıcısı admin yapıldı.`}
                      errorMessage="Kullanıcı admin yapılamadı. Lütfen tekrar deneyin."
                      tone="default"
                      className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                    >
                      Admin Yap
                    </ConfirmActionButton>
                  ))}
              </div>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-10 text-center shadow-soft">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
              <InboxIcon className="h-6 w-6" />
            </span>
            <p className="text-sm text-slate-400">Bu filtrelerle eşleşen kullanıcı bulunamadı.</p>
          </div>
        )}
      </div>

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/kullanicilar" searchParams={sp} />
    </div>
  );
}
