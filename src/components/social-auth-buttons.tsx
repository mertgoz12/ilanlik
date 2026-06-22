import { Apple } from "lucide-react";
import { GoogleIcon } from "./google-icon";

// Apple girişi Apple Developer hesabı (yıllık ücretli) gerektirdiğinden
// şimdilik yer tutucu - tasarımdaki yeri hazır, ileride aktif edilebilir.
export function SocialAuthButtons({
  actionLabel,
  callbackUrl,
}: {
  actionLabel: string;
  callbackUrl?: string;
}) {
  const googleHref = `/api/auth/google?callbackUrl=${encodeURIComponent(callbackUrl ?? "/")}`;

  return (
    <div>
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">veya</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="space-y-2.5">
        <a
          href={googleHref}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <GoogleIcon className="h-5 w-5" />
          Google {actionLabel}
        </a>

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
    </div>
  );
}
