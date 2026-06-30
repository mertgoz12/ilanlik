import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isHeroGif, isHeroVideo } from "@/lib/hero-media";
import { ActionButton, ConfirmActionButton } from "@/components/admin/action-button";
import { PageHeader } from "@/components/admin/page-header";
import { ImageIcon, InboxIcon, PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import {
  deleteSlideAction,
  moveSlideAction,
  toggleSlideActiveAction,
} from "./actions";

export default async function AdminBannerPage() {
  const slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
  const activeCount = slides.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ImageIcon}
        title="Banner / Slider Yönetimi"
        description={
          slides.length === 0
            ? "Ana sayfa üst slider'ı için henüz slayt eklenmedi."
            : `Toplam ${slides.length} slayt · ${activeCount} aktif (ana sayfada gösterilir).`
        }
        accent="blue"
        action={
          <Link
            href="/admin/banner/yeni"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
          >
            <PlusIcon className="h-4 w-4" />
            Yeni Slayt
          </Link>
        }
      />

      {slides.length > 0 && activeCount === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Hiçbir slayt aktif değil; ana sayfada slider alanı şu an gizli. En az bir slaytı aktif yapın.
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow-soft">
        {slides.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
              <InboxIcon className="h-6 w-6" />
            </span>
            <p className="text-sm text-slate-400">Henüz slayt yok. &quot;Yeni Slayt&quot; ile ilk banner&apos;ınızı ekleyin.</p>
          </div>
        ) : (
          slides.map((slide, index) => (
            <div
              key={slide.id}
              className="flex flex-col gap-3 border-t border-slate-100 p-4 first:border-t-0 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                {/* Sıralama okları */}
                <div className="flex flex-col gap-1">
                  <ActionButton
                    action={moveSlideAction.bind(null, slide.id, "up")}
                    icon={<ArrowUp className="h-3.5 w-3.5" />}
                    errorMessage="Sıra değiştirilemedi."
                    className={`rounded-md border border-slate-200 p-1 text-slate-500 transition-colors hover:bg-slate-50 ${
                      index === 0 ? "pointer-events-none opacity-30" : ""
                    }`}
                  >
                    <span className="sr-only">Yukarı taşı</span>
                  </ActionButton>
                  <ActionButton
                    action={moveSlideAction.bind(null, slide.id, "down")}
                    icon={<ArrowDown className="h-3.5 w-3.5" />}
                    errorMessage="Sıra değiştirilemedi."
                    className={`rounded-md border border-slate-200 p-1 text-slate-500 transition-colors hover:bg-slate-50 ${
                      index === slides.length - 1 ? "pointer-events-none opacity-30" : ""
                    }`}
                  >
                    <span className="sr-only">Aşağı taşı</span>
                  </ActionButton>
                </div>

                <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {!slide.imageUrl ? (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  ) : isHeroVideo(slide.imageUrl) ? (
                    <video src={slide.imageUrl} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                  ) : (
                    <Image
                      src={slide.imageUrl}
                      alt=""
                      fill
                      sizes="96px"
                      unoptimized={isHeroGif(slide.imageUrl)}
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`truncate font-medium ${slide.title ? "text-foreground" : "italic text-slate-400"}`}>
                      {slide.title || "Başlıksız (yalnızca görsel)"}
                    </p>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                        slide.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {slide.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                  {slide.subtitle && <p className="truncate text-xs text-slate-500">{slide.subtitle}</p>}
                  {slide.buttonText && (
                    <p className="mt-0.5 truncate text-[11px] text-slate-400">
                      Buton: <span className="font-medium text-slate-500">{slide.buttonText}</span>
                      {slide.buttonLink ? ` → ${slide.buttonLink}` : ""}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <ActionButton
                  action={toggleSlideActiveAction.bind(null, slide.id)}
                  icon={slide.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  successMessage={slide.isActive ? "Slayt pasif yapıldı." : "Slayt aktif yapıldı."}
                  errorMessage="Durum değiştirilemedi."
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  {slide.isActive ? "Pasif Yap" : "Aktif Yap"}
                </ActionButton>
                <Link
                  href={`/admin/banner/${slide.id}/duzenle`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                  Düzenle
                </Link>
                <ConfirmActionButton
                  action={deleteSlideAction.bind(null, slide.id)}
                  icon={<TrashIcon className="h-3.5 w-3.5" />}
                  confirmTitle="Slaytı sil"
                  confirmMessage={`${slide.title ? `"${slide.title}" slaytını` : "Bu slaytı"} silmek istediğinize emin misiniz?`}
                  confirmLabel="Evet, sil"
                  successMessage="Slayt silindi."
                  errorMessage="Slayt silinemedi. Lütfen tekrar deneyin."
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
