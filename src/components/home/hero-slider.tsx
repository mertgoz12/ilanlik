"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Crown, Sparkles, ArrowRight } from "lucide-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { isHeroGif, isHeroVideo } from "@/lib/hero-media";

export type HeroSlideView = {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  // "promo" ise görsel/video yerine kod tabanlı degrade tasarımlı öne çıkarma
  // slaydı gösterilir (bkz. page.tsx - vitrin slider'ına eklenen promo slayt).
  variant?: "media" | "promo";
};

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 50; // px

// Site içi yollar Next <Link> ile, harici (http...) bağlantılar düz <a> ile
// açılır - böylece dış linkler yeni sekmede güvenle açılabilir.
function SlideButton({ text, link, icon = false }: { text: string; link: string; icon?: boolean }) {
  const className =
    "inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-xs font-bold text-brand shadow-soft transition-colors hover:bg-accent-dark hover:text-white sm:px-5 sm:py-2 sm:text-sm";
  const content = (
    <>
      {text}
      {icon && <ArrowRight className="h-4 w-4" />}
    </>
  );
  const isExternal = /^https?:\/\//i.test(link);
  if (isExternal) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }
  return (
    <Link href={link} className={className}>
      {content}
    </Link>
  );
}

// Slayt arka planı: video sessiz+döngülü otomatik oynar, GIF animasyonu
// korunsun diye `unoptimized` ile gösterilir, diğer görseller optimize edilir.
function SlideMedia({ slide, priority }: { slide: HeroSlideView; priority: boolean }) {
  if (isHeroVideo(slide.imageUrl)) {
    return (
      <video
        src={slide.imageUrl}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-label={slide.title || "Banner"}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  return (
    <Image
      src={slide.imageUrl}
      alt={slide.title}
      fill
      priority={priority}
      unoptimized={isHeroGif(slide.imageUrl)}
      sizes="(max-width: 1024px) 100vw, 900px"
      className="object-cover"
    />
  );
}

// Kod tabanlı "öne çıkarma" promo slaydı - görsel yerine degrade + altın
// parıltı, dekoratif taç filigranı, ışıltılar ve altın vurgulu başlık ile
// çekiliş banner'ıyla aynı zenginlikte durur (bkz. page.tsx promoSlide).
function PromoSlideContent({ slide }: { slide: HeroSlideView }) {
  const link = slide.buttonLink || "/ilan-ver";
  const buttonText = slide.buttonText || "Ücretsiz İlan Ver";
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-700 to-brand-900" />
      {/* Sağdan gelen sıcak altın ışıma */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_45%,rgba(245,183,0,0.32),transparent_55%)]" />
      {/* Dekoratif dev taç filigranı */}
      <Crown className="pointer-events-none absolute right-3 top-1/2 h-28 w-28 -translate-y-1/2 rotate-12 text-accent/15 sm:right-8 sm:h-36 sm:w-36 md:right-12 md:h-44 md:w-44" />
      {/* Işıltılar */}
      <Sparkles className="pointer-events-none absolute right-24 top-5 h-4 w-4 text-accent/70 sm:right-32" />
      <Sparkles className="pointer-events-none absolute bottom-6 right-16 h-3 w-3 text-accent/50 sm:right-24" />
      <Sparkles className="pointer-events-none absolute bottom-10 right-40 hidden h-3.5 w-3.5 text-white/40 sm:block" />

      <div className="absolute inset-0 flex flex-col justify-center gap-1 px-5 sm:px-8 md:px-10">
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-900 shadow-soft sm:text-[10px]">
          <Crown className="h-3 w-3" />
          Ücretsiz Vitrin Fırsatı
        </span>
        <h2 className="max-w-md text-[15px] font-extrabold leading-tight tracking-tight text-white drop-shadow-sm sm:text-lg md:text-2xl">
          3 İlan Ver,{" "}
          <span className="bg-gradient-to-r from-accent to-amber-300 bg-clip-text text-transparent">
            1 İlanını Ücretsiz Öne Çıkar!
          </span>
        </h2>
        <p className="hidden max-w-xs text-xs text-brand-100 md:block">
          Aramaların en üstünde yer al, daha çok alıcıya ulaş.
        </p>
        <div className="mt-1.5">
          <SlideButton text={buttonText} link={link} icon />
        </div>
      </div>
    </>
  );
}

export function HeroSlider({ slides }: { slides: HeroSlideView[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = slides.length;

  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Otomatik geçiş - tek slayt varsa veya duraklatıldıysa çalışmaz.
  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count, paused]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    setPaused(false);
    if (start === null) return;
    const delta = e.changedTouches[0].clientX - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) next();
    else prev();
  }

  return (
    <section
      className="relative overflow-hidden rounded-xl bg-brand shadow-soft ring-1 ring-slate-200/60"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
    >
      {/* Kayan ray: tüm slaytlar yan yana, index kadar kaydırılır. İnce, yatay
          şerit yüksekliği - sayfayı boğmasın, asıl içerik (kategori/ilanlar)
          baskın kalsın. */}
      <div
        className="flex h-32 transition-transform duration-500 ease-out sm:h-36 md:h-40"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide) =>
          slide.variant === "promo" ? (
            <div key={slide.id} className="relative h-full w-full shrink-0" aria-roledescription="slide">
              <PromoSlideContent slide={slide} />
            </div>
          ) : (
            <div key={slide.id} className="relative h-full w-full shrink-0" aria-roledescription="slide">
              <SlideMedia slide={slide} priority={slide.id === slides[0].id} />
              {/* Üzerinde yazı/buton varsa metin katmanı; yoksa degrade de
                  binmesin, görsel/video tertemiz tek başına gözüksün. */}
              {(slide.title || slide.subtitle || (slide.buttonText && slide.buttonLink)) && (
                <>
                  {/* Marka lacivertinden soldan sağa açılan yumuşak degrade -
                      metin okunaklı kalsın, görünüm sakin/zarif olsun. */}
                  <div className="absolute inset-0 bg-gradient-to-r from-brand/90 via-brand/55 to-brand/10" />
                  <div className="absolute inset-0 flex flex-col justify-center gap-1.5 px-5 sm:px-8 md:px-10">
                    {slide.title && (
                      <h2 className="max-w-md text-base font-bold leading-snug tracking-tight text-white drop-shadow-sm sm:text-lg md:text-2xl">
                        {slide.title}
                      </h2>
                    )}
                    {slide.subtitle && (
                      <p className="max-w-sm text-xs text-white/85 sm:text-sm">
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.buttonText && slide.buttonLink && (
                      <div className="mt-1">
                        <SlideButton text={slide.buttonText} link={slide.buttonLink} />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ),
        )}
      </div>

      {/* İleri/geri okları - birden çok slayt varsa */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Önceki slayt"
            className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-brand shadow-soft transition-colors hover:bg-white sm:h-8 sm:w-8"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Sonraki slayt"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-brand shadow-soft transition-colors hover:bg-white sm:h-8 sm:w-8"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>

          {/* Nokta göstergeleri */}
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${i + 1}. slayda git`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
