"use client";

import { useState } from "react";
import { Award, ScanSearch, ShieldCheck, X } from "lucide-react";

const STORAGE_KEY = "ilanlio_trust_banner_dismissed";

const FEATURES = [
  { icon: ScanSearch, title: "YZ Onayı", text: "Tüm ilanlar kontrol edilir" },
  { icon: Award, title: "Güven Puanı", text: "0-100 arası güven skoru" },
  { icon: ShieldCheck, title: "Satıcı Doğrulama", text: "Doğrulanmış satıcılar" },
];

function readDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function TrustBanner() {
  const [dismissed, setDismissed] = useState(readDismissed);

  if (dismissed) return null;

  function handleDismiss() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  }

  return (
    <section className="relative overflow-hidden rounded-xl border border-accent/30 bg-accent-light p-4 sm:p-5">
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Kapat"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-brand/50 transition-colors hover:bg-white/60 hover:text-brand"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-5">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-brand sm:text-lg">
            Yapay zeka ile daha güvenli alışveriş
          </h2>
          <p className="mt-1 text-sm text-brand/70">
            Tüm ilanlar yapay zeka ile analiz edilir, riskli ilanlar engellenir.
          </p>

          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-soft">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-brand">{title}</p>
                  <p className="truncate text-[11px] text-brand/60">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden h-24 w-24 shrink-0 items-center justify-center sm:flex">
          <span className="absolute h-24 w-24 rounded-full bg-accent/25 blur-xl" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-white shadow-soft-lg">
            <ShieldCheck className="h-8 w-8" />
          </span>
        </div>
      </div>
    </section>
  );
}
