"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Share, Smartphone } from "lucide-react";
import { CloseIcon } from "./icons";

const DISMISS_STORAGE_KEY = "ilanlio:pwa-install-dismissed-at";
const DISMISS_DAYS = 7;
const SHOW_DELAY_MS = 1500;

// beforeinstallprompt standart DOM tipi içinde yok (Chromium'a özgü) - kendi
// minimal arayüzümüzü tanımlıyoruz.
interface BeforeInstallPromptEvent extends Event {
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
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

function wasRecentlyDismissed(): boolean {
  const raw = window.localStorage.getItem(DISMISS_STORAGE_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (Number.isNaN(dismissedAt)) return false;
  const elapsedDays = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
  return elapsedDays < DISMISS_DAYS;
}

// Tarayıcının kendi "Ana ekrana ekle" önerisi güvenilir çıkmıyor: Chrome
// beforeinstallprompt olayını kendi "kullanıcı katılımı" sezgiselleriyle
// geciktirebilir, hatta hiç tetiklemeyebilir - mükemmel bir PWA kurulumunda
// bile bu olaya bel bağlayan bir banner aylarca görünmeyebilir. Bu yüzden
// banner native olayı SONSUZA DEK beklemez: kısa bir gecikmeden sonra HER
// DURUMDA gösterilir. Native istem o ana kadar yakalandıysa "Yükle" onu
// tetikler; yakalanmadıysa (henüz gelmedi veya platform desteklemiyor) elle
// adım adım talimat gösterilir. Zaten ana ekrana eklenmişse veya kullanıcı
// son 7 gün içinde kapattıysa hiç görünmez. Sadece mobilde (md:hidden + UA).
export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos] = useState(() => typeof navigator !== "undefined" && isIosDevice());

  useEffect(() => {
    if (!isMobileDevice() || isRunningStandalone() || wasRecentlyDismissed()) return;

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    }

    function handleAppInstalled() {
      setVisible(false);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    const timeoutId = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.clearTimeout(timeoutId);
    };
  }, []);

  function handleDismiss() {
    window.localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    setVisible(false);
  }

  async function handleInstallClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setVisible(false);
      return;
    }
    // Native istem henüz yakalanmadı (ya hiç tetiklenmeyecek ya da bu
    // platformda zaten yok) - elle talimat panelini aç/kapat.
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
