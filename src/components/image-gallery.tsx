"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, ImageIcon } from "./icons";

const SWIPE_THRESHOLD_PX = 40;

// Ana görsel ve lightbox'ta parmakla sola/sağa kaydırarak fotoğraf
// değiştirme - dokunma sırasında belirgin bir yatay hareket olduysa bunu
// "swipe" sayıp ardından gelen sentetik click'i (büyütme/zoom) bastırır.
function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);
  const wasSwipe = useRef(false);

  function onTouchStart(e: TouchEvent) {
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  }

  function onTouchMove(e: TouchEvent) {
    if (startX.current === null) return;
    deltaX.current = e.touches[0].clientX - startX.current;
  }

  function onTouchEnd() {
    if (Math.abs(deltaX.current) > SWIPE_THRESHOLD_PX) {
      wasSwipe.current = true;
      if (deltaX.current < 0) onSwipeLeft();
      else onSwipeRight();
    }
    startX.current = null;
  }

  function consumeWasSwipe() {
    if (wasSwipe.current) {
      wasSwipe.current = false;
      return true;
    }
    return false;
  }

  return { onTouchStart, onTouchMove, onTouchEnd, consumeWasSwipe };
}

export function ImageGallery({
  images,
  title,
}: {
  images: { url: string }[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const count = images.length;

  const goTo = useCallback(
    (index: number) => {
      setActive((current) => {
        if (count === 0) return current;
        return ((index % count) + count) % count;
      });
    },
    [count],
  );

  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goTo(active - 1);
      if (e.key === "ArrowRight") goTo(active + 1);
    }

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, active, goTo]);

  const mainSwipe = useSwipe(
    () => goTo(active + 1),
    () => goTo(active - 1),
  );
  const lightboxSwipe = useSwipe(
    () => goTo(active + 1),
    () => goTo(active - 1),
  );

  if (count === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-300">
        <ImageIcon className="h-16 w-16" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[16/10] w-full touch-pan-y overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        <button
          type="button"
          onClick={() => {
            if (mainSwipe.consumeWasSwipe()) return;
            setLightboxOpen(true);
          }}
          onTouchStart={mainSwipe.onTouchStart}
          onTouchMove={mainSwipe.onTouchMove}
          onTouchEnd={mainSwipe.onTouchEnd}
          className="absolute inset-0 h-full w-full cursor-zoom-in"
          aria-label="Fotoğrafı büyüt"
        >
          <Image
            key={images[active].url}
            src={images[active].url}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
        </button>

        <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold text-white">
          {active + 1}/{count}
        </span>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(active - 1);
              }}
              aria-label="Önceki fotoğraf"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-foreground shadow-soft transition-colors hover:bg-white"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(active + 1);
              }}
              aria-label="Sonraki fotoğraf"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-foreground shadow-soft transition-colors hover:bg-white"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Fotoğraf ${i + 1}`}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:h-20 sm:w-28 ${
                i === active ? "border-emerald-600" : "border-transparent hover:border-slate-300"
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="flex items-center justify-between text-white">
            <span className="rounded-md bg-white/10 px-2.5 py-1 text-sm font-semibold">
              {active + 1}/{count}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Kapat"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div
            className="relative flex-1 touch-pan-y"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={lightboxSwipe.onTouchStart}
            onTouchMove={lightboxSwipe.onTouchMove}
            onTouchEnd={lightboxSwipe.onTouchEnd}
          >
            <Image src={images[active].url} alt={title} fill className="object-contain" sizes="100vw" />

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(active - 1);
                  }}
                  aria-label="Önceki fotoğraf"
                  className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(active + 1);
                  }}
                  aria-label="Sonraki fotoğraf"
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
