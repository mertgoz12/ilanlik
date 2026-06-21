"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Share, Smartphone } from "lucide-react";
import { CloseIcon } from "./icons";

const DISMISS_STORAGE_KEY = "ilanlio:pwa-install-dismissed-at";
const DISMISS_DAYS = 7;
const SHOW_DELAY_MS = 1500;
const LOG_PREFIX = "[PWA banner]";

// beforeinstallprompt standart DOM tipi içinde yok (Chromium'a özgü) - kendi
// minimal arayüzümüzü tanımlıyoruz.
interface BeforeInstallPromptEvent extends Event {
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    // layout.tsx'teki beforeInteractive script tarafından doldurulur - bkz.
    // o dosyadaki açıklama (hydration öncesi kaçırılan olay sorunu).
    __pwaDeferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function isIosDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

function isRunningStandalone(): boolean {
  const standaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standaloneMedia || iosStandalone;
}

// Kalan gizleme süresini de döndürür - konsol logunda "neden görünmüyor"
// sorusunu tek bakışta cevaplamak için (bkz. aşağıdaki useEffect logu).
function dismissedRecentlyInfo(): { dismissed: boolean; remainingDays: number | null } {
  const raw = window.localStorage.getItem(DISMISS_STORAGE_KEY);
  if (!raw) return { dismissed: false, remainingDays: null };
  const dismissedAt = Number(raw);
  if (Number.isNaN(dismissedAt)) return { dismissed: false, remainingDays: null };
  const elapsedDays = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
  const remainingDays = Math.max(0, DISMISS_DAYS - elapsedDays);
  return { dismissed: elapsedDays < DISMISS_DAYS, remainingDays };
}

// Tarayıcının kendi "Ana ekrana ekle" önerisi güvenilir çıkmıyor: Chrome
// beforeinstallprompt olayını kendi "kullanıcı katılımı" sezgiselleriyle
// geciktirebilir, hatta hiç tetiklemeyebilir - mükemmel bir PWA kurulumunda
// bile bu olaya bel bağlayan bir banner aylarca görünmeyebilir. Bu yüzden
// banner native olayı SONSUZA DEK beklemez: kısa bir gecikmeden sonra HER
// DURUMDA gösterilir. Native istem o ana kadar yakalandıysa "Yükle" onu
// tetikler (gerçek tek-tıkla kurulum); yakalanmadıysa (henüz gelmedi veya
// platform desteklemiyor) elle adım adım talimat gösterilir. Zaten ana
// ekrana eklenmişse veya kullanıcı son 7 gün içinde kapattıysa hiç
// görünmez. Sadece mobilde (md:hidden + UA).
//
// beforeinstallprompt'un GERÇEK yakalanması layout.tsx'teki beforeInteractive
// script'te olur (React hydrate olmadan önce çalışır) - bu component sadece
// o script'in doldurduğu window.__pwaDeferredPrompt global'ini okur. Aksi
// halde Chrome olayı hydration'dan önce ateşlerse (sık görülen bir durum)
// React'in useEffect'i henüz bağlanmamış olacağından olay kaçırılır ve bir
// daha asla tetiklenmez.
//
// Banner "neden çıkmıyor" diye debug etmek için her karar noktası [PWA
// banner] önekiyle konsola loglanır - bir cihazda görünmüyorsa tarayıcı
// konsolunu (uzaktan hata ayıklama / remote debugging ile) açıp bu logları
// okumak kesin sebebi gösterir.
export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos] = useState(() => typeof navigator !== "undefined" && isIosDevice());

  useEffect(() => {
    const mobile = isMobileDevice();
    const standalone = isRunningStandalone();
    const { dismissed, remainingDays } = dismissedRecentlyInfo();

    console.log(LOG_PREFIX, "kontrol:", {
      userAgent: navigator.userAgent,
      isMobile: mobile,
      isIos,
      isStandalone: standalone,
      recentlyDismissed: dismissed,
      dismissRemainingDays: remainingDays !== null ? remainingDays.toFixed(1) : null,
      earlyCapturedAlready: Boolean(window.__pwaDeferredPrompt),
    });

    if (!mobile) {
      console.log(LOG_PREFIX, "GÖSTERİLMİYOR: mobil cihaz olarak algılanmadı (User-Agent mobil değil).");
      return;
    }
    if (standalone) {
      console.log(LOG_PREFIX, "GÖSTERİLMİYOR: uygulama zaten ana ekrana eklenmiş/standalone modda çalışıyor.");
      return;
    }
    if (dismissed) {
      console.log(
        LOG_PREFIX,
        `GÖSTERİLMİYOR: kullanıcı banner'ı daha önce kapattı, ${remainingDays?.toFixed(1)} gün sonra tekrar gösterilecek. ` +
          `Hemen test etmek için: localStorage.removeItem("${DISMISS_STORAGE_KEY}") çalıştırıp sayfayı yenileyin.`,
      );
      return;
    }

    let adopted = false;

    function adoptDeferredPrompt(source: string) {
      const event = window.__pwaDeferredPrompt;
      if (!event) return false;
      console.log(LOG_PREFIX, `Native kurulum istemi hazır (kaynak: ${source}) - tek tıkla kurulum mümkün.`);
      adopted = true;
      setDeferredPrompt(event);
      setVisible(true);
      return true;
    }

    // Olay bu component mount olmadan ÖNCE (layout.tsx'teki ham <head>
    // script'i tarafından) zaten yakalanmış olabilir.
    adoptDeferredPrompt("hydration öncesi yakalandı");

    function handlePwaInstallReady() {
      adoptDeferredPrompt("hydration sonrası geldi");
    }

    function handleAppInstalled() {
      console.log(LOG_PREFIX, "appinstalled - uygulama yüklendi, banner kapatılıyor.");
      window.__pwaDeferredPrompt = null;
      setVisible(false);
      setDeferredPrompt(null);
    }

    window.addEventListener("pwa-install-ready", handlePwaInstallReady);
    window.addEventListener("appinstalled", handleAppInstalled);

    const timeoutId = window.setTimeout(() => {
      if (adopted) return; // native istem zaten yakalandı, yedek mesaja gerek yok.
      console.log(
        LOG_PREFIX,
        `${SHOW_DELAY_MS}ms doldu, beforeinstallprompt henüz gelmedi - banner yine de (elle talimat moduyla) gösteriliyor.`,
      );
      setVisible(true);
    }, SHOW_DELAY_MS);

    return () => {
      window.removeEventListener("pwa-install-ready", handlePwaInstallReady);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.clearTimeout(timeoutId);
    };
    // isIos bağımlılığı bilinçli olarak dışlandı: değeri mount sonrası asla
    // değişmiyor (useState lazy initializer), efekti tekrar çalıştırmaya
    // gerek yok.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDismiss() {
    console.log(LOG_PREFIX, `Kullanıcı kapattı, ${DISMISS_DAYS} gün boyunca tekrar gösterilmeyecek.`);
    window.localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    setVisible(false);
  }

  async function handleInstallClick() {
    if (deferredPrompt) {
      console.log(LOG_PREFIX, "Native kurulum istemi tetikleniyor (prompt()).");
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      console.log(LOG_PREFIX, "Kullanıcı native istemde:", choice.outcome);
      window.__pwaDeferredPrompt = null;
      setDeferredPrompt(null);
      setVisible(false);
      return;
    }
    // Native istem henüz yakalanmadı (ya hiç tetiklenmeyecek ya da bu
    // platformda zaten yok) - elle talimat panelini aç/kapat.
    console.log(LOG_PREFIX, "Native istem yok, elle talimat paneli açılıyor. Platform:", isIos ? "iOS" : "Android/diğer");
    setShowSteps((value) => !value);
  }

  if (!visible) return null;

  return (
    <div className="animate-fade-in-down border-b border-amber-200 bg-accent-light md:hidden">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-accent">
          <Smartphone className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-brand">İlanlio&apos;yu ana ekranına ekle</p>
          <p className="truncate text-xs text-slate-600">Uygulama gibi hızlı ve kolay kullan</p>
        </div>
        <button
          type="button"
          onClick={handleInstallClick}
          className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-900"
        >
          Yükle
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Kapat"
          className="shrink-0 rounded-full p-1 text-slate-400 transition-colors hover:bg-white/50 hover:text-slate-600"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      {showSteps && (
        <div className="border-t border-amber-200/60 px-4 py-3 text-xs text-slate-700">
          {isIos ? (
            <ol className="list-inside list-decimal space-y-1.5">
              <li className="flex flex-wrap items-center gap-1">
                Tarayıcıdaki
                <Share className="h-3.5 w-3.5 shrink-0 text-brand" />
                <strong>Paylaş</strong> ikonuna dokunun
              </li>
              <li>
                Açılan listede <strong>&quot;Ana Ekrana Ekle&quot;</strong>yi seçin
              </li>
            </ol>
          ) : (
            <ol className="list-inside list-decimal space-y-1.5">
              <li className="flex flex-wrap items-center gap-1">
                Tarayıcının sağ üstündeki
                <MoreVertical className="h-3.5 w-3.5 shrink-0 text-brand" />
                menüye dokunun
              </li>
              <li>
                <strong>&quot;Ana ekrana ekle&quot;</strong> veya <strong>&quot;Uygulamayı yükle&quot;</strong>yi seçin
              </li>
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
