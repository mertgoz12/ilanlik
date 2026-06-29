"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent } from "react";
import Image from "next/image";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  ExpandIcon,
  ImageIcon,
} from "./icons";

const SWIPE_THRESHOLD_PX = 40;
const MAX_ZOOM = 3;
const DOUBLE_TAP_MS = 300;

// Ana görselde parmakla sola/sağa kaydırarak fotoğraf değiştirme. Dokunma
// sırasında belirgin bir yatay hareket olduysa bunu "swipe" sayıp ardından
// gelen sentetik click'i (tam ekran açılışı) bastırır.
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

function touchDistance(touches: React.TouchList) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
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

  // Lightbox yakınlaştırma durumu (mobilde pinch / çift dokunma, masaüstünde
  // tıklama-ile-zoom). scale 1 iken kaydırma (swipe) aktif; zoom'da pan aktif.
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

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

  const resetZoom = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  // Fotoğraf değişince veya lightbox kapanınca yakınlaştırmayı sıfırla.
  useEffect(() => {
    resetZoom();
  }, [active, lightboxOpen, resetZoom]);

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

  // --- Lightbox dokunma: pinch-zoom, zoom'dayken pan, normalde swipe + çift
  //     dokunma ile zoom aç/kapat ---
  const pinchStart = useRef<{ dist: number; zoom: number } | null>(null);
  const panStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const swipeStartX = useRef<number | null>(null);
  const swipeDelta = useRef(0);
  const lastTap = useRef(0);
  const gestureActive = useRef(false);

  function lbTouchStart(e: TouchEvent) {
    gestureActive.current = true;
    if (e.touches.length === 2) {
      pinchStart.current = { dist: touchDistance(e.touches), zoom };
      swipeStartX.current = null;
      panStart.current = null;
      return;
    }
    if (zoom > 1) {
      panStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        ox: offset.x,
        oy: offset.y,
      };
    } else {
      swipeStartX.current = e.touches[0].clientX;
      swipeDelta.current = 0;
    }
  }

  function lbTouchMove(e: TouchEvent) {
    if (pinchStart.current && e.touches.length === 2) {
      const ratio = touchDistance(e.touches) / pinchStart.current.dist;
      const next = Math.min(MAX_ZOOM, Math.max(1, pinchStart.current.zoom * ratio));
      setZoom(next);
      if (next === 1) setOffset({ x: 0, y: 0 });
      return;
    }
    if (panStart.current && zoom > 1) {
      setOffset({
        x: panStart.current.ox + (e.touches[0].clientX - panStart.current.x),
        y: panStart.current.oy + (e.touches[0].clientY - panStart.current.y),
      });
      return;
    }
    if (swipeStartX.current !== null) {
      swipeDelta.current = e.touches[0].clientX - swipeStartX.current;
    }
  }

  function lbTouchEnd() {
    if (pinchStart.current) {
      pinchStart.current = null;
      if (zoom <= 1.05) resetZoom();
      gestureActive.current = false;
      return;
    }
    if (panStart.current) {
      panStart.current = null;
      gestureActive.current = false;
      return;
    }
    if (swipeStartX.current !== null) {
      // Çift dokunma: kısa süre içinde iki dokunuş -> zoom aç/kapat.
      const now = Date.now();
      if (Math.abs(swipeDelta.current) < 10 && now - lastTap.current < DOUBLE_TAP_MS) {
        setZoom((z) => (z > 1 ? 1 : 2));
        setOffset({ x: 0, y: 0 });
        lastTap.current = 0;
      } else {
        if (Math.abs(swipeDelta.current) > SWIPE_THRESHOLD_PX) {
          if (swipeDelta.current < 0) goTo(active + 1);
          else goTo(active - 1);
        }
        lastTap.current = now;
      }
      swipeStartX.current = null;
    }
    gestureActive.current = false;
  }

  if (count === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-300">
        <ImageIcon className="h-16 w-16" />
      </div>
    );
  }

  return (
    <div>
      {/* Ana görsel - hover'da büyümez; tıklayınca tam ekran lightbox açılır. */}
      <div className="group relative aspect-[16/10] w-full touch-pan-y overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-soft">
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
          aria-label="Fotoğrafı tam ekran aç"
        >
          <Image
            key={images[active].url}
            src={images[active].url}
            alt={title}
            fill
            preload
            className="object-cover"
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
        </button>

        {/* Sayaç */}
        <span className="pointer-events-none absolute left-3 top-3 rounded-lg bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {active + 1}/{count}
        </span>

        {/* Tam ekran ikonu */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Tam ekran görüntüle"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75"
        >
          <ExpandIcon className="h-4 w-4" />
        </button>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(active - 1);
              }}
              aria-label="Önceki fotoğraf"
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-foreground shadow-soft backdrop-blur-sm transition-all hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
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
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-foreground shadow-soft backdrop-blur-sm transition-all hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Küçük thumbnail şeridi - seçili olan marka rengiyle vurgulu. */}
      {count > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Fotoğraf ${i + 1}`}
              aria-current={i === active}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-20 sm:w-28 ${
                i === active
                  ? "border-brand ring-2 ring-brand/20"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      )}

      {/* --- Tam ekran lightbox --- */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Üst bar: sayaç + kapat */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold">
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

          {/* Büyük görsel alanı - filigran object-contain ile tam korunur. */}
          <div
            className="relative min-h-0 flex-1 select-none touch-none overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={lbTouchStart}
            onTouchMove={lbTouchMove}
            onTouchEnd={lbTouchEnd}
          >
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transition: gestureActive.current ? "none" : "transform 0.2s ease-out",
                cursor: zoom > 1 ? "zoom-out" : "zoom-in",
              }}
              onClick={() => {
                // Masaüstünde tıklayarak yakınlaştır / uzaklaştır.
                setZoom((z) => (z > 1 ? 1 : 2));
                setOffset({ x: 0, y: 0 });
              }}
            >
              <Image
                src={images[active].url}
                alt={title}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            {count > 1 && zoom === 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(active - 1);
                  }}
                  aria-label="Önceki fotoğraf"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
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
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Alt thumbnail şeridi */}
          {count > 1 && (
            <div
              className="flex justify-start gap-2 overflow-x-auto px-4 py-3 sm:justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Fotoğraf ${i + 1}`}
                  aria-current={i === active}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    i === active
                      ? "border-accent"
                      : "border-transparent opacity-50 hover:opacity-90"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
