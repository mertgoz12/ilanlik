"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  createOptionAction,
  endOptionAction,
  type OptionFormState,
} from "@/app/ilan/[listingNo]/actions";
import { formatOptionDuration, formatRemainingTime } from "@/lib/option-format";
import { errorClass } from "./form-ui";
import { ClockIcon, UserIcon } from "./icons";
import { ConfirmDialog } from "./admin/confirm-dialog";

type OptionPanelProps = {
  listingId: string;
  listingNo: string;
  currentUserId: string | null;
  sellerId: string;
  optionStatus: string;
  optionHolderId: string | null;
  optionHolderName: string | null;
  optionEndAt: Date | null;
  durationOptions: number[];
};

const initialState: OptionFormState = {};

export function OptionPanel({
  listingId,
  listingNo,
  currentUserId,
  sellerId,
  optionStatus,
  optionHolderId,
  optionHolderName,
  optionEndAt,
  durationOptions,
}: OptionPanelProps) {
  const isOwnListing = currentUserId === sellerId;
  const isOptioned = optionStatus === "opsiyonlandi";
  const isOptionHolder = isOptioned && optionHolderId === currentUserId;

  // Giriş yapmamış ziyaretçiye buton tamamen gizlenmez ("Mesaj Gönder" ile
  // aynı desen) - tıklayınca girişe yönlenir, böylece özellik keşfedilebilir
  // kalır. Not: opsiyonlu bir ilan zaten sadece taraflara görünür (bkz.
  // ilan/[listingNo]/page.tsx), bu yüzden buraya SADECE "bosta" durumda
  // giriş yapmamış bir ziyaretçi ulaşabilir.
  if (!currentUserId) {
    return (
      <Link
        href={`/giris?callbackUrl=${encodeURIComponent(`/ilan/${listingNo}`)}`}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-accent bg-accent-light px-4 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-accent/20"
      >
        <ClockIcon className="h-4 w-4" />
        Bu Ürünü Opsiyonla
      </Link>
    );
  }
  if (isOwnListing && !isOptioned) return null;
  if (!isOwnListing && isOptioned && !isOptionHolder) return null;

  if (isOptioned) {
    return (
      <EndOptionCard
        listingId={listingId}
        isBuyerView={isOptionHolder}
        otherPartyName={isOptionHolder ? null : optionHolderName}
        endsAt={optionEndAt}
      />
    );
  }

  return <CreateOptionCard listingId={listingId} listingNo={listingNo} durationOptions={durationOptions} />;
}

function CreateOptionCard({
  listingId,
  listingNo,
  durationOptions,
}: {
  listingId: string;
  listingNo: string;
  durationOptions: number[];
}) {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState(durationOptions[0]);
  const [state, formAction, pending] = useActionState(
    createOptionAction.bind(null, listingId),
    initialState,
  );

  if (state.success) {
    return (
      <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-semibold text-emerald-800">Ürünü opsiyonladınız!</p>
        <p className="mt-1 text-sm text-emerald-700">
          Satıcıyla iletişime geçebilirsiniz. Detaylar için sayfayı yenileyin.
        </p>
        <Link
          href={`/ilan/${listingNo}`}
          className="mt-3 inline-block text-sm font-semibold text-emerald-800 underline"
        >
          Sayfayı Yenile
        </Link>
      </section>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-accent bg-accent-light px-4 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-accent/20"
      >
        <ClockIcon className="h-4 w-4" />
        Bu Ürünü Opsiyonla
      </button>
    );
  }

  return (
    <section className="rounded-lg bg-white p-5 shadow-soft">
      <h2 className="mb-1 text-sm font-semibold text-foreground">Opsiyon Süresi Seçin</h2>
      <p className="mb-3 text-xs text-slate-500">
        Seçtiğiniz süre boyunca bu ilan başka kimseye görünmez; satıcıyla anlaşmaya çalışabilirsiniz.
      </p>
      <form action={formAction} className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {durationOptions.map((hours) => (
            <label
              key={hours}
              className={`flex cursor-pointer items-center justify-center rounded-lg border px-2 py-2 text-sm font-medium transition-colors ${
                duration === hours
                  ? "border-brand bg-accent-light text-brand"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="durationHours"
                value={hours}
                checked={duration === hours}
                onChange={() => setDuration(hours)}
                className="sr-only"
              />
              {formatOptionDuration(hours)}
            </label>
          ))}
        </div>
        {state.error && <p className={errorClass}>{state.error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-lg bg-brand px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Onaylanıyor..." : "Onayla"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            İptal
          </button>
        </div>
      </form>
    </section>
  );
}

function EndOptionCard({
  listingId,
  isBuyerView,
  otherPartyName,
  endsAt,
}: {
  listingId: string;
  isBuyerView: boolean;
  otherPartyName: string | null;
  endsAt: Date | null;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setPending(true);
    setError(null);
    try {
      await endOptionAction(listingId);
      setConfirmOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem gerçekleştirilemedi. Lütfen tekrar deneyin.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-800">
        <ClockIcon className="h-4 w-4" />
        {isBuyerView ? "Bu ürünü opsiyonladınız" : "Bu ürün opsiyonlandı"}
      </h2>

      {!isBuyerView && otherPartyName && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-amber-700">
          <UserIcon className="h-3.5 w-3.5" />
          Opsiyonlayan: <span className="font-semibold">{otherPartyName}</span>
        </p>
      )}

      {endsAt && <RemainingTimeText endsAt={endsAt} />}

      {error && <p className={errorClass}>{error}</p>}

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100"
      >
        {isBuyerView ? "Opsiyonu Sonlandır (Vazgeç)" : "Opsiyonu Sonlandır"}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="Opsiyonu sonlandır"
        message={
          isBuyerView
            ? "Bu opsiyondan vazgeçmek istediğinize emin misiniz? İlan tekrar herkese görünür olacak."
            : "Bu opsiyonu sonlandırmak istediğinize emin misiniz? İlan tekrar herkese görünür olacak."
        }
        confirmLabel="Evet, sonlandır"
        cancelLabel="Vazgeç"
        tone="danger"
        pending={pending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}

// Geri sayım metni sunucu render anı ile istemcinin hydrate olduğu an
// arasında saniyeler/dakikalar farklılaşabildiği için SADECE mount sonrası
// (useEffect içinde) hesaplanır - bu sayede sunucu/istemci metin uyuşmazlığı
// (hydration mismatch) hiç oluşmaz.
function RemainingTimeText({ endsAt }: { endsAt: Date }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    // Bilinçli istisna: bu değer SADECE tarayıcıda (mount sonrası) bilinebilir
    // - sunucu render anındaki "şimdi" ile istemcinin hydrate olduğu an
    // farklı olduğundan, ilk değeri burada ayarlamak hydration mismatch'i
    // önlemenin tek yoludur (yukarıdaki null başlangıç durumuyla eşleşir).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText(formatRemainingTime(endsAt));
    const id = window.setInterval(() => setText(formatRemainingTime(endsAt)), 30_000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  if (!text) return null;
  return <p className="mt-1 text-sm text-amber-700">{text}</p>;
}
