import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { formatDate } from "@/lib/format";
import { Avatar } from "@/components/avatar";
import { ListingCard } from "@/components/listing-card";
import { UserBadge } from "@/components/user-badge";
import { LocationIcon, CalendarIcon } from "@/components/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  if (!user) return { title: "Profil Bulunamadı - İlanlio" };
  return { title: `${user.name} - Satıcı Profili | İlanlio` };
}

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const [user, session] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        badge: true,
        createdAt: true,
        il: true,
        ilce: true,
        _count: {
          select: { listings: { where: { status: "active" } } },
        },
      },
    }),
    getSession(),
  ]);

  if (!user) notFound();

  const listings = await prisma.listing.findMany({
    where: {
      userId: user.id,
      status: "active",
      optionStatus: { not: "opsiyonlandi" },
    },
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
      _count: { select: { images: true } },
    },
  });

  const favoritedIds = session
    ? new Set(
        (
          await prisma.favorite.findMany({
            where: {
              userId: session.id,
              listingId: { in: listings.map((l) => l.id) },
            },
            select: { listingId: true },
          })
        ).map((f) => f.listingId),
      )
    : new Set<string>();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profil kartı */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="flex flex-wrap items-start gap-5 p-6 sm:p-8">
          <Avatar name={user.name} src={user.avatarUrl} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">{user.name}</h1>
              {user.badge && <UserBadge badge={user.badge} memberSince={user.createdAt} size="sm" />}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500">
              {user.il && (
                <span className="flex items-center gap-1.5">
                  <LocationIcon className="h-3.5 w-3.5 shrink-0" />
                  {user.il}
                  {user.ilce ? `, ${user.ilce}` : ""}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                Üye: {formatDate(user.createdAt)}
              </span>
            </div>
            <div className="mt-3">
              <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-foreground">
                {user._count.listings} aktif ilan
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Aktif ilanlar */}
      <section className="mt-6">
        <h2 className="mb-4 text-base font-bold text-foreground sm:text-lg">
          Aktif İlanlar
        </h2>
        {listings.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-soft">
            <p className="text-sm text-slate-400">Bu satıcının şu an aktif ilanı bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                currentUserId={session?.id ?? null}
                isFavorited={favoritedIds.has(listing.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
