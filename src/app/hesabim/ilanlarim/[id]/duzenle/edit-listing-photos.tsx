"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  addListingPhotosAction,
  deleteListingPhotoAction,
  makeCoverPhotoAction,
  type AddListingPhotosState,
} from "../../actions";
import { errorClass } from "@/components/form-ui";
import { ImageIcon, SpinnerIcon, TrashIcon } from "@/components/icons";

type Photo = { id: string; url: string };

const MAX_IMAGES_PER_LISTING = 10;
const initialState: AddListingPhotosState = {};

export function EditListingPhotos({ listingId, images }: { listingId: string; images: Photo[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(addListingPhotosAction.bind(null, listingId), initialState);
  const [busyImageId, setBusyImageId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fotoğraf eklendiğinde (revalidatePath sunucu tarafında zaten yapıldı) bu
  // sayfanın kendisini de tazeleyip yeni listeyi sunucudan tekrar çekiyoruz -
  // Blob URL'lerini burada manuel olarak tahmin etmemize gerek kalmıyor.
  useEffect(() => {
    if (state.addedCount !== undefined) {
      router.refresh();
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [state, router]);

  async function handleDelete(imageId: string) {
    setActionError(null);
    setBusyImageId(imageId);
    try {
      await deleteListingPhotoAction(listingId, imageId);
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Fotoğraf silinemedi. Lütfen tekrar deneyin.");
    } finally {
      setBusyImageId(null);
    }
  }

  async function handleMakeCover(imageId: string) {
    setActionError(null);
    setBusyImageId(imageId);
    try {
      await makeCoverPhotoAction(listingId, imageId);
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "İşlem başarısız. Lütfen tekrar deneyin.");
    } finally {
      setBusyImageId(null);
    }
  }

  const remainingSlots = MAX_IMAGES_PER_LISTING - images.length;

  return (
    <div className="space-y-3">
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-8 text-center">
          <ImageIcon className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">Bu ilana henüz fotoğraf eklenmemiş.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200"
            >
              <Image src={image.url} alt="" fill sizes="160px" className="object-cover" />

              {index === 0 && (
                <span className="absolute left-1 top-1 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Kapak
                </span>
              )}

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleMakeCover(image.id)}
                    disabled={busyImageId === image.id}
                    className="rounded-md bg-white/90 px-2 py-1 text-[11px] font-semibold text-foreground transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Kapak Yap
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  disabled={busyImageId === image.id}
                  aria-label="Fotoğrafı sil"
                  className="flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[11px] font-semibold text-red-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <TrashIcon className="h-3 w-3" />
                  Sil
                </button>
              </div>

              {busyImageId === image.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <SpinnerIcon className="h-5 w-5 animate-spin text-slate-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {actionError && <p className={errorClass}>{actionError}</p>}

      {remainingSlots > 0 ? (
        <form action={formAction}>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-6 text-center transition-colors hover:border-emerald-400 hover:bg-emerald-50/50">
            <ImageIcon className="h-7 w-7 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Fotoğraf eklemek için tıklayın</span>
            <span className="text-xs text-slate-400">
              PNG, JPG veya WEBP &middot; en fazla 5MB &middot; {images.length}/{MAX_IMAGES_PER_LISTING} fotoğraf
            </span>
            <input
              ref={fileInputRef}
              type="file"
              name="images"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="sr-only"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  e.target.form?.requestSubmit();
                }
              }}
            />
          </label>
          {pending && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
              <SpinnerIcon className="h-4 w-4 animate-spin" />
              Fotoğraflar yükleniyor...
            </p>
          )}
          {state.error && <p className={errorClass}>{state.error}</p>}
        </form>
      ) : (
        <p className="text-xs text-slate-400">
          Bu ilan için fotoğraf limitine ({MAX_IMAGES_PER_LISTING}) ulaşıldı.
        </p>
      )}
    </div>
  );
}
