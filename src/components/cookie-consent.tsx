"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Cookie, Settings } from "lucide-react";

const STORAGE_KEY = "ilanlik_cookie_consent";

type ConsentCategories = {
  necessary: true;
  performance: boolean;
  functional: boolean;
  marketing: boolean;
};

const DEFAULT_CATEGORIES: ConsentCategories = {
  necessary: true,
  performance: false,
  functional: false,
  marketing: false,
};

// localStorage'daki onay durumu bu uygulama içinde sadece bu bileşen
// tarafından yazılır; bu yüzden harici bir "store" gibi davranıp
// useSyncExternalStore ile okunur (effect içinde setState çağırmadan,
// SSR/hydration uyumsuzluğu yaratmadan client-only veriye erişim sağlar).
let listeners: Array<() => void> = [];

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

// getSnapshot, değişmediği sürece her çağrıda AYNI referansı döndürmelidir;
// aksi halde useSyncExternalStore her render'da "değişti" sanıp sonsuz
// döngüye girer (JSON.parse her seferinde yeni bir nesne üretir).
let cachedRaw: string | null = null;
let cachedValue: ConsentCategories | null = null;

function getSnapshot(): ConsentCategories | null {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = raw ? (JSON.parse(raw) as ConsentCategories) : null;
  }
  return cachedValue;
}

// Sunucuda localStorage yok; "henüz onay verilmemiş" kabul edilir. Hydration
// sonrası gerçek değer okunup gerekirse banner anında kapatılır.
function getServerSnapshot(): ConsentCategories | null {
  return null;
}

function saveConsent(categories: ConsentCategories) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  notify();
}

export function CookieConsent() {
  const [showSettings, setShowSettings] = useState(false);
  const [categories, setCategories] = useState<ConsentCategories>(DEFAULT_CATEGORIES);
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (consent !== null) return null;

  function acceptAll() {
    saveConsent({ necessary: true, performance: true, functional: true, marketing: true });
  }

  function savePreferences() {
    saveConsent(categories);
    setShowSettings(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white p-4 shadow-soft-lg sm:p-6">
      <div className="mx-auto max-w-6xl">
        {!showSettings ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-light text-brand">
                <Cookie className="h-5 w-5" />
              </span>
              <p className="text-sm leading-relaxed text-slate-600">
                İlanlık, deneyiminizi iyileştirmek için çerezler kullanır. Detaylar için{" "}
                <Link href="/cerez-politikasi" className="font-medium text-brand underline hover:text-accent-dark">
                  Çerez Politikası
                </Link>
                &apos;nı inceleyebilirsiniz.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-slate-50"
              >
                <Settings className="h-4 w-4" />
                Ayarları Yönet
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Kabul Et
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm font-bold text-foreground">Çerez Tercihleri</p>
            <p className="mt-1 text-sm text-slate-500">
              Aşağıdaki kategorilerden hangi çerezlere izin vereceğinizi seçebilirsiniz. Zorunlu çerezler sitenin
              çalışması için gereklidir ve devre dışı bırakılamaz.
            </p>

            <div className="mt-4 space-y-2.5">
              <CategoryToggle
                title="Zorunlu Çerezler"
                description="Oturum açma, güvenlik ve temel site işlevleri için gereklidir."
                checked
                disabled
              />
              <CategoryToggle
                title="Performans / Analitik Çerezler"
                description="Site kullanımını analiz ederek deneyimi iyileştirmemize yardımcı olur."
                checked={categories.performance}
                onChange={(v) => setCategories((c) => ({ ...c, performance: v }))}
              />
              <CategoryToggle
                title="Fonksiyonel Çerezler"
                description="Tercihlerinizi (örn. arama filtreleri) hatırlamamızı sağlar."
                checked={categories.functional}
                onChange={(v) => setCategories((c) => ({ ...c, functional: v }))}
              />
              <CategoryToggle
                title="Pazarlama Çerezleri"
                description="İlgi alanlarınıza göre içerik ve kampanya gösterimi için kullanılır."
                checked={categories.marketing}
                onChange={(v) => setCategories((c) => ({ ...c, marketing: v }))}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={savePreferences}
                className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Tercihleri Kaydet
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-slate-50"
              >
                Tümünü Kabul Et
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:text-foreground"
              >
                Geri
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryToggle({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-3 ${disabled ? "bg-slate-50" : ""}`}
    >
      <span>
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="block text-xs text-slate-500">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 text-brand focus:ring-brand disabled:opacity-50"
      />
    </label>
  );
}
