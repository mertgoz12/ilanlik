"use client";

import { useEffect, useState } from "react";
import { Share, Smartphone } from "lucide-react";
import { CloseIcon } from "./icons";

const DISMISS_STORAGE_KEY = "ilanlio:pwa-install-dismissed-at";
const DISMISS_DAYS = 7;
const IOS_SHOW_DELAY_MS = 2000;

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

// Tarayıcının kendi "Ana ekrana ekle" önerisi (mini-infobar) güvenilir
// çıkmadığından (heuristik/throttling tarayıcıya göre değişir) site kendi
// bildirimini gösterir: Android/Chrome'da gerçek native istemi (prompt())
// tetikler, iOS Safari'de (native istem hiç yok) Paylaş menüsü adımlarını
// gösterir. Zaten ana ekrana eklenmişse veya kullanıcı son 7 gün içinde
// kapattıysa hiç görünmez. Sadece mobilde (md:hidden + UA kontrolü).
export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (!isMobileDevice() || isRunningStandalone() || wasRecentlyDismissed()) return;

    if (isIosDevice()) {
      const timeoutId = window.setTimeout(() => {
        setIsIos(true);
        setVisible(true);
      }, IOS_SHOW_DELAY_MS);
      return () => window.clearTimeout(timeoutId);
    }

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
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  function handleDismiss() {
    window.localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    setVisible(false);
  }

  async function handleInstallClick() {
    if (isIos) {
      setShowIosSteps((value) => !value);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
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

      {showIosSteps && (
        <div className="border-t border-amber-200/60 px-4 py-3 text-xs text-slate-700">
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
        </div>
      )}
    </div>
  );
}
