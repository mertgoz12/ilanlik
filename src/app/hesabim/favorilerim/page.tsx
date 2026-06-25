import Link from "next/link";
import { requireUserPage } from "@/lib/account-auth";
import { prisma } from "@/lib/prisma";
import { buildListingWhere, parseListingQuery } from "@/lib/listing-query";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { ActionButton, ConfirmActionButton } from "@/components/admin/action-button";
import { ListingCard } from "@/components/listing-card";
import {
  BellIcon,
  CheckIcon,
  HeartIcon,
  SearchIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import { deleteSavedSearchAction, markSavedSearchSeenAction, toggleSellerFollowAction } from "@/lib/social-actions";

export default async function FavoritesPage() {
  const session = await requireUserPage("/hesabim/favorilerim");

  const [favorites, savedSearches, follows] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: session.id, listing: { status: "active" } },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          include: {
            images: { orderBy: { order: "asc" }, take: 1 },
            category: true,
            _count: { select: { images: true } },
          },
        },
      },
    }),
    prisma.savedSearch.findMany({ where: { userId: session.id }, orderBy: { createdAt: "desc" } }),
    prisma.sellerFollow.findMany({
      where: { followerId: session.id },
      orderBy: { createdAt: "desc" },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            _count: { select: { listings: { where: { status: "active" } } } },
          },
        },
      },
    }),
  ]);

  const savedSearchesWithCounts = await Promise.all(
    savedSearches.map(async (search) => {
      const where = await buildListingWhere(parseListingQuery(search.query));
      const currentCount = await prisma.listing.count({ where });
      return { ...search, currentCount, hasNew: currentCount > search.lastSeenCount };
    }),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={HeartIcon}
        title="Favorilerim"
        description="Favori ilanlarınız, kaydettiğiniz aramalar ve takip ettiğiniz satıcılar."
        accent="red"
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Favori İlanlarım ({favorites.length})</h2>
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-10 text-center text-sm text-slate-400 shadow-soft">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
              <HeartIcon className="h-6 w-6" />
            </span>
            Henüz favori ilanınız yok. İlan kartlarındaki kalp simgesine tıklayarak ekleyebilirsiniz.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((favorite) => (
              <ListingCard
                key={favorite.id}
                listing={favorite.listing}
                currentUserId={session.id}
                isFavorited
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Favori Aramalarım ({savedSearchesWithCounts.length})</h2>
        {savedSearchesWithCounts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-10 text-center text-sm text-slate-400 shadow-soft">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
              <SearchIcon className="h-6 w-6" />
            </span>
            Henüz kaydedilmiş bir aramanız yok. Anasayfada filtre uyguladıktan sonra &quot;Aramayı Kaydet&quot;e
            tıklayarak ekleyebilirsiniz.
          </div>
        ) : (
          <div className="space-y-2">
            {savedSearchesWithCounts.map((search) => (
              <div
                key={search.id}
                className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-light text-brand">
                    <BellIcon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <Link href={`/?${search.query}`} className="font-semibold text-foreground hover:text-brand">
                      {search.label}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {search.currentCount} ilan eşleşiyor · {formatDate(search.createdAt)} tarihinde kaydedildi
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                  {search.hasNew && (
                    <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                      Yeni ilan var
                    </span>
                  )}
                  {search.hasNew && (
                    <ActionButton
                      action={markSavedSearchSeenAction.bind(null, search.id)}
                      icon={<CheckIcon className="h-3.5 w-3.5" />}
                      successMessage="Arama görüldü olarak işaretlendi."
                      errorMessage="İşlem gerçekleştirilemedi. Lütfen tekrar deneyin."
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      Gördüm
                    </ActionButton>
                  )}
                  <ConfirmActionButton
                    action={deleteSavedSearchAction.bind(null, search.id)}
                    icon={<TrashIcon className="h-3.5 w-3.5" />}
                    confirmTitle="Aramayı sil"
                    confirmMessage={`"${search.label}" adlı kayıtlı aramayı silmek istediğinize emin misiniz?`}
                    confirmLabel="Evet, sil"
                    successMessage={`"${search.label}" kayıtlı araması silindi.`}
                    errorMessage="Arama silinemedi. Lütfen tekrar deneyin."
                    tone="danger"
                    className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    Sil
                  </ConfirmActionButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Favori Satıcılarım ({follows.length})</h2>
        {follows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-10 text-center text-sm text-slate-400 shadow-soft">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
              <UsersIcon className="h-6 w-6" />
            </span>
            Henüz takip ettiğiniz bir satıcı yok. İlan sayfalarında &quot;Satıcıyı Takip Et&quot;e tıklayarak
            ekleyebilirsiniz.
          </div>
        ) : (
          <div className="space-y-2">
            {follows.map((follow) => (
              <div
                key={follow.id}
                className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <UserIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{follow.seller.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {follow.seller._count.listings} yayında ilan · Üyelik: {formatDate(follow.seller.createdAt)}
                    </p>
                  </div>
                </div>

                <ConfirmActionButton
                  action={toggleSellerFollowAction.bind(null, follow.seller.id)}
                  icon={<TrashIcon className="h-3.5 w-3.5" />}
                  confirmTitle="Takibi bırak"
                  confirmMessage={`"${follow.seller.name}" adlı satıcıyı takip etmeyi bırakmak istediğinize emin misiniz?`}
                  confirmLabel="Evet, takibi bırak"
                  successMessage={`"${follow.seller.name}" takipten çıkarıldı.`}
                  errorMessage="İşlem gerçekleştirilemedi. Lütfen tekrar deneyin."
                  tone="danger"
                  className="shrink-0 self-end rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 sm:self-center"
                >
                  Takibi Bırak
                </ConfirmActionButton>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
