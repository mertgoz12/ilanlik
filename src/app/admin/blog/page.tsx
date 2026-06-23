import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { ConfirmActionButton } from "@/components/admin/action-button";
import { PageHeader } from "@/components/admin/page-header";
import { EyeIcon, ImageIcon, InboxIcon, PencilIcon, PlusIcon, TagIcon, TrashIcon } from "@/components/icons";
import { deletePostAction } from "./actions";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={TagIcon}
        title="Blog Yönetimi"
        description={`Toplam ${posts.length} yazı.`}
        accent="violet"
        action={
          <Link
            href="/admin/blog/yeni"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
          >
            <PlusIcon className="h-4 w-4" />
            Yeni Yazı
          </Link>
        }
      />

      <div className="overflow-hidden rounded-xl bg-white shadow-soft">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
              <InboxIcon className="h-6 w-6" />
            </span>
            <p className="text-sm text-slate-400">Henüz blog yazısı yok.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="flex flex-col gap-3 border-t border-slate-100 p-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {post.coverImageUrl ? (
                    <Image src={post.coverImageUrl} alt="" fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{post.title}</p>
                  <p className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                    <span
                      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                        post.status === "yayinda" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {post.status === "yayinda" ? "Yayında" : "Taslak"}
                    </span>
                    {post.category} · {formatDate(post.publishedAt)}
                    {post.author?.name ? ` · ${post.author.name}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {post.status === "yayinda" && (
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <EyeIcon className="h-3.5 w-3.5" />
                    Görüntüle
                  </Link>
                )}
                <Link
                  href={`/admin/blog/${post.id}/duzenle`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                  Düzenle
                </Link>
                <ConfirmActionButton
                  action={deletePostAction.bind(null, post.id)}
                  icon={<TrashIcon className="h-3.5 w-3.5" />}
                  confirmTitle="Yazıyı sil"
                  confirmMessage={`"${post.title}" yazısını silmek istediğinize emin misiniz?`}
                  confirmLabel="Evet, sil"
                  successMessage="Yazı silindi."
                  errorMessage="Yazı silinemedi. Lütfen tekrar deneyin."
                  tone="danger"
                  className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  Sil
                </ConfirmActionButton>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
