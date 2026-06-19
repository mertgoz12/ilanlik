import { prisma } from "@/lib/prisma";
import { ConfirmActionButton, ToastForm } from "@/components/admin/action-button";
import { PageHeader } from "@/components/admin/page-header";
import { inputClass, labelClass, selectClass } from "@/components/form-ui";
import { CheckIcon, FolderIcon, InboxIcon, PlusIcon, TagIcon, TrashIcon } from "@/components/icons";
import { createCategoryAction, deleteCategoryAction, updateCategoryAction } from "./actions";

type CategoryRowData = {
  id: string;
  name: string;
  slug: string;
  _count: { listings: number; children: number };
};

function CategoryRow({ category, indented }: { category: CategoryRowData; indented?: boolean }) {
  const canDelete = category._count.listings === 0 && category._count.children === 0;

  return (
    <div
      className={`flex flex-col gap-3 border-t border-slate-100 p-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between ${
        indented ? "bg-slate-50/60 pl-8" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            indented ? "bg-slate-100 text-slate-400" : "bg-violet-100 text-violet-600"
          }`}
        >
          {indented ? <TagIcon className="h-4 w-4" /> : <FolderIcon className="h-4 w-4" />}
        </span>
        <div className="min-w-0">
          <p className="font-medium text-foreground">{category.name}</p>
          <p className="text-xs text-slate-400">
            /{category.slug} · {category._count.listings} ilan
            {category._count.children > 0 ? ` · ${category._count.children} alt kategori` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <details className="group">
          <summary className="cursor-pointer list-none rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
            Düzenle
          </summary>
          <ToastForm
            action={updateCategoryAction.bind(null, category.id)}
            successMessage="Kategori güncellendi."
            errorMessage="Kategori güncellenemedi. Lütfen tekrar deneyin."
            className="animate-fade-in-up mt-2 flex flex-wrap items-end gap-2 rounded-lg bg-slate-50 p-3"
          >
            <div>
              <label htmlFor={`name-${category.id}`} className={labelClass}>
                Ad
              </label>
              <input
                id={`name-${category.id}`}
                name="name"
                defaultValue={category.name}
                required
                className={`${inputClass} w-44`}
              />
            </div>
            <div>
              <label htmlFor={`slug-${category.id}`} className={labelClass}>
                Slug
              </label>
              <input
                id={`slug-${category.id}`}
                name="slug"
                defaultValue={category.slug}
                className={`${inputClass} w-44`}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckIcon className="h-3.5 w-3.5" />
              Kaydet
            </button>
          </ToastForm>
        </details>

        {canDelete ? (
          <ConfirmActionButton
            action={deleteCategoryAction.bind(null, category.id)}
            icon={<TrashIcon className="h-3.5 w-3.5" />}
            confirmTitle="Kategoriyi sil"
            confirmMessage={`"${category.name}" kategorisini silmek istediğinize emin misiniz?`}
            confirmLabel="Evet, sil"
            successMessage={`"${category.name}" kategorisi silindi.`}
            errorMessage="Kategori silinemedi. Lütfen tekrar deneyin."
            tone="danger"
            className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Sil
          </ConfirmActionButton>
        ) : (
          <span
            title="Alt kategorisi veya ilanı olan kategoriler silinemez"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-300"
          >
            <TrashIcon className="h-3.5 w-3.5" />
            Sil
          </span>
        )}
      </div>
    </div>
  );
}

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    include: {
      children: {
        orderBy: { order: "asc" },
        include: { _count: { select: { listings: true, children: true } } },
      },
      _count: { select: { listings: true, children: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={TagIcon}
        title="Kategori Yönetimi"
        description={`Toplam ${categories.length} ana kategori.`}
        accent="violet"
      />

      <div className="rounded-xl bg-white p-4 shadow-soft sm:p-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
            <PlusIcon className="h-4 w-4" />
          </span>
          Yeni Kategori Ekle
        </h2>
        <ToastForm
          action={createCategoryAction}
          successMessage="Kategori eklendi."
          errorMessage="Kategori eklenemedi. Lütfen tekrar deneyin."
          resetOnSuccess
          className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_2fr_auto] sm:items-end"
        >
          <div>
            <label htmlFor="new-name" className={labelClass}>
              Ad
            </label>
            <input id="new-name" name="name" required placeholder="Örn: Bilgisayar" className={inputClass} />
          </div>
          <div>
            <label htmlFor="new-parent" className={labelClass}>
              Üst Kategori
            </label>
            <select id="new-parent" name="parentId" defaultValue="" className={selectClass}>
              <option value="">— (Ana Kategori)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PlusIcon className="h-4 w-4" />
            Ekle
          </button>
        </ToastForm>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="overflow-hidden rounded-xl bg-white shadow-soft transition-shadow hover:shadow-soft-lg">
            <CategoryRow category={cat} />
            {cat.children.map((child) => (
              <CategoryRow key={child.id} category={child} indented />
            ))}
          </div>
        ))}

        {categories.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-10 text-center shadow-soft">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
              <InboxIcon className="h-6 w-6" />
            </span>
            <p className="text-sm text-slate-400">Henüz kategori yok.</p>
          </div>
        )}
      </div>
    </div>
  );
}
