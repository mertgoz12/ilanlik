"use client";

import { useState } from "react";
import { Apple } from "lucide-react";
import { GoogleIcon } from "./google-icon";

// Google OAuth altyapısı henüz kurulmadı (bkz. proje notları - Google
// Cloud Console kimlik bilgileri eklenip NextAuth/Auth.js provider'ı
// bağlanınca bu buton gerçek /api/auth/signin/google akışını tetikleyecek).
// Apple girişi ayrıca Apple Developer hesabı gerektirdiğinden şimdilik
// sadece yer tutucu olarak (devre dışı) gösteriliyor.
export function SocialAuthButtons({ actionLabel }: { actionLabel: string }) {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div>
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">veya</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => setNotice("Google ile giriş çok yakında aktif olacak.")}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <GoogleIcon className="h-5 w-5" />
          Google {actionLabel}
        </button>

        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-400"
        >
          <Apple className="h-5 w-5" />
          Apple {actionLabel}
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Yakında
          </span>
        </button>
      </div>

      {notice && <p className="mt-2.5 text-center text-xs text-slate-500">{notice}</p>}
    </div>
  );
}
