"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { LoginForm } from "@/app/giris/login-form";
import { TypewriterLogo } from "./typewriter-logo";

// "Giriş Yap" tetikleyici + modal. Arka plan bulanıklaşır (backdrop-blur),
// içinde daktilo logo + e-posta/şifre + Google/Apple girişleri.
export function LoginModalButton({
  className = "",
  children,
  onOpen,
  callbackUrl,
}: {
  className?: string;
  children: ReactNode;
  onOpen?: () => void;
  // Giriş sonrası yönlendirilecek adres (verilmezse bulunulan sayfa).
  callbackUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          onOpen?.();
          setOpen(true);
        }}
      >
        {children}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-overlay-in"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-modal-in sm:p-7">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Kapat"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex flex-col items-center gap-1.5 text-center">
              <TypewriterLogo size="lg" replayKey={open} />
              <p className="text-sm text-slate-500">Hesabına giriş yap</p>
            </div>

            <LoginForm callbackUrl={callbackUrl ?? pathname} />
          </div>
        </div>
      )}
    </>
  );
}
