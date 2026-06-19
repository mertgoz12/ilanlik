import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { ConfirmActionButton } from "@/components/admin/action-button";
import { AlertIcon, CarIcon, InboxIcon, ShieldCheckIcon, TrashIcon, UsersIcon } from "@/components/icons";
import { clearDemoDataAction } from "./actions";

export default async function AdminDemoDataPage() {
  const [demoListingCount, demoUserCount, demoListings] = await Promise.all([
    prisma.listing.count({ where: { isDemo: true } }),
    prisma.user.count({ where: { isDemo: true } }),
    prisma.listing.findMany({
      where: { isDemo: true },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, listingNo: true, title: true, user: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={InboxIcon}
        title="Demo Veri Yönetimi"
        description="Seed/demo ilan ve kullanıcılarını canlıya geçmeden önce buradan yönetin."
        accent="slate"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Demo İlan Sayısı" value={demoListingCount} icon={CarIcon} accent="blue" />
        <StatCard label="Demo Kullanıcı Sayısı" value={demoUserCount} icon={UsersIcon} accent="indigo" />
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Demo ilanlar canlı sitede görünmez</p>
          <p className="mt-1 text-blue-700">
            Tüm demo ilanlar &quot;pasif&quot; (yayında değil) durumdadır - ziyaretçiler, anasayfa, kategori
            sayfaları ve aramada görünmezler. Sadece bu panelden ve{" "}
            <Link href="/admin/ilanlar?isDemo=true" className="font-semibold underline">
              İlan Yönetimi
            </Link>{" "}
            sayfasından görülüp yönetilebilirler. Kendi gerçek ilanlarınızı girip yayına aldığınızda, demo
            verileri aşağıdaki butonla kalıcı olarak silebilirsiniz.
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Son Eklenen Demo İlanlar (en fazla 10)
        </h2>
        <div className="overflow-hidden rounded-xl bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">İlan</th>
                  <th className="px-4 py-3">Satıcı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {demoListings.map((listing) => (
                  <tr key={listing.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{listing.title}</span>
                      <span className="ml-1 text-xs text-slate-400">#{listing.listingNo}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{listing.user.name}</td>
                  </tr>
                ))}

                {demoListings.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-12 text-center text-sm text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                          <InboxIcon className="h-6 w-6" />
                        </span>
                        Demo veri bulunmuyor - zaten temizlenmiş.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-red-200 bg-red-50/50 p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-red-700">
          <AlertIcon className="h-4.5 w-4.5" />
          Tehlikeli Bölge
        </h2>
        <p className="mt-2 text-sm text-red-700">
          Bu işlem {demoListingCount} demo ilanı ve {demoUserCount} demo kullanıcıyı; bunlara bağlı tüm
          görsel, mesaj, favori, opsiyon ve rapor kayıtlarıyla birlikte KALICI olarak siler. Gerçek
          (kendi girdiğiniz) ilan ve kullanıcılara dokunulmaz. Bu işlem GERİ ALINAMAZ.
        </p>
        <div className="mt-4">
          <ConfirmActionButton
            action={clearDemoDataAction}
            icon={<TrashIcon className="h-4 w-4" />}
            confirmTitle="Tüm demo verilerini sil"
            confirmMessage={`${demoListingCount} demo ilan ve ${demoUserCount} demo kullanıcı, ilişkili tüm kayıtlarıyla birlikte kalıcı olarak silinecek. Bu işlem geri alınamaz. Onaylıyor musunuz?`}
            confirmLabel="Evet, kalıcı olarak sil"
            successMessage="Tüm demo veriler kalıcı olarak silindi."
            errorMessage="Demo veriler silinemedi. Lütfen tekrar deneyin."
            tone="danger"
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Tüm Demo Verilerini Temizle
          </ConfirmActionButton>
        </div>
      </section>
    </div>
  );
}
