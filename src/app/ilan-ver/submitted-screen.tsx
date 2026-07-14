"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircleIcon, ClockIcon, CloseIcon, PlusIcon } from "@/components/icons";
import { toRaffleNo } from "@/lib/raffle";

export function SubmittedScreen({ listingNo }: { listingNo?: string | null }) {
  const [raffleOpen, setRaffleOpen] = useState(true);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setRaffleOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const raffleNo = listingNo ? toRaffleNo(listingNo) : null;

  return (
    <>
      {/* ── Çekiliş Modalı ── */}
      {raffleNo && raffleOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          onClick={() => setRaffleOpen(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Üst altın şerit */}
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-accent to-amber-400" />

            <button
              type="button"
              onClick={() => setRaffleOpen(false)}
              aria-label="Kapat"
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <CloseIcon className="h-4 w-4" />
            </button>

            <div className="px-8 pb-8 pt-7 text-center">
              <div className="text-5xl">🏆</div>

              <h2 className="mt-4 text-2xl font-bold text-foreground">Tebrikler!</h2>
              <p className="mt-0.5 text-base font-semibold text-accent-dark">
                Çekilişe Katıldınız
              </p>

              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                İlan oluşturduğunuz için{" "}
                <span className="font-bold text-foreground">iPhone 17 Pro Max</span> çekilişine
                otomatik olarak katıldınız. Kazanan belirleneceğinde duyurulacaktır.
              </p>

              {/* Çekiliş Numarası */}
              <div className="mt-5 overflow-hidden rounded-xl border-2 border-accent/30 bg-accent-light">
                <div className="border-b border-accent/20 px-4 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Çekiliş Numaranız
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="font-mono text-2xl font-bold tracking-widest text-brand">
                    {raffleNo}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Bu numarayı saklayın — kazanan bu numara üzerinden açıklanacaktır.
              </p>

              <button
                type="button"
                onClick={() => setRaffleOpen(false)}
                className="mt-6 w-full rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-soft transition-colors hover:bg-brand-700"
              >
                Harika, teşekkürler! 🎉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Normal Başarı Ekranı ── */}
      <div className="mx-auto max-w-xl rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-soft">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <CheckCircleIcon className="h-9 w-9" />
        </span>
        <h2 className="mt-5 text-xl font-bold text-foreground">İlanınız incelemeye gönderildi</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          İlanınız ekibimiz tarafından incelenecek. Onaylandıktan sonra otomatik olarak yayına
          alınacak ve size bildirim göndereceğiz. Bu işlem genellikle kısa sürer.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2 text-sm font-semibold text-amber-700">
          <ClockIcon className="h-4 w-4" />
          Durum: İnceleniyor
        </div>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/hesabim/ilanlarim"
            className="inline-flex w-full items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-700 sm:w-auto"
          >
            İlanlarıma Git
          </Link>
          {/* Düz <a>: state sıfırlamak için tam sayfa yenileme gerekli —
              Next.js <Link> yumuşak geçiş yapıp formu dolu bırakırdı. */}
          <a
            href="/ilan-ver"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
          >
            <PlusIcon className="h-4 w-4" />
            Yeni İlan Ver
          </a>
        </div>
      </div>
    </>
  );
}
