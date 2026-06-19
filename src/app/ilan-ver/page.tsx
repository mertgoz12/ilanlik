import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getVehicleCatalog } from "@/lib/vehicle-catalog";
import { isVasitaEmlakActive, selectableCategories } from "@/lib/categories";
import { InfoIcon } from "@/components/icons";
import { CategoryPicker } from "./category-picker";

// Kullanıcının üyelik rozetine göre "Kimden" alanının varsayılan değeri
// (kullanıcı isterse formda değiştirebilir).
const FROM_WHO_BY_BADGE: Record<string, string> = {
  galeri: "Galeriden",
  kurumsal: "Yetkili Bayiden",
};

export default async function IlanVerPage() {
  const selectable = selectableCategories();
  const session = await getSession();
  const [dbCategories, catalog, user] = await Promise.all([
    prisma.category.findMany({
      where: { slug: { in: selectable.map((c) => c.slug) } },
      select: { id: true, slug: true },
    }),
    getVehicleCatalog(),
    session ? prisma.user.findUnique({ where: { id: session.id }, select: { badge: true } }) : null,
  ]);
  const idBySlug = new Map(dbCategories.map((c) => [c.slug, c.id]));
  const defaultFromWho = (user?.badge && FROM_WHO_BY_BADGE[user.badge]) || "Sahibinden";

  const categories = selectable
    .map((c) => ({ ...c, id: idBySlug.get(c.slug) ?? "" }))
    .filter((c) => c.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Yeni İlan Ver
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Kategori seçin ve ilan bilgilerinizi eksiksiz girerek alıcıların güvenini kazanın.
        </p>
      </div>

      {!isVasitaEmlakActive() && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-accent/30 bg-accent-light px-4 py-3 text-sm text-brand">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong className="font-semibold">Vasıta</strong> ve <strong className="font-semibold">Emlak</strong>{" "}
            kategorileri çok yakında ilan girişine açılacak. Şimdilik ikinci el / sıfır ürün
            kategorilerinden ilan verebilirsiniz.
          </p>
        </div>
      )}

      <CategoryPicker categories={categories} catalog={catalog} defaultFromWho={defaultFromWho} />
    </div>
  );
}
