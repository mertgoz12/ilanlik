"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { SpinnerIcon } from "@/components/icons";
import { ConfirmDialog } from "./confirm-dialog";
import { useToast } from "./toast";

const BASE_CLASS = "inline-flex items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60";

const DEFAULT_ERROR_MESSAGE = "İşlem gerçekleştirilemedi. Lütfen tekrar deneyin.";

type ActionButtonProps = {
  action: () => Promise<unknown> | void;
  className?: string;
  children: ReactNode;
  // Sunucu bileşenlerinden istemci bileşenlerine fonksiyon referansı (component
  // tipi) aktarılamaz; bu yüzden ikon burada zaten render edilmiş bir eleman
  // (örn. <CheckIcon className="h-3.5 w-3.5" />) olarak alınır.
  icon?: ReactNode;
  successMessage?: string;
  errorMessage?: string;
};

// Sunucu eylemini doğrudan çağırır (form/window.confirm'e gerek yoktur);
// bekleme sırasında dönen ikon gösterir ve sonucu toast ile bildirir.
export function ActionButton({ action, className, children, icon, successMessage, errorMessage }: ActionButtonProps) {
  const [pending, setPending] = useState(false);
  const { showToast } = useToast();

  async function handleClick() {
    setPending(true);
    try {
      await action();
      if (successMessage) showToast({ variant: "success", message: successMessage });
    } catch {
      showToast({ variant: "error", message: errorMessage ?? DEFAULT_ERROR_MESSAGE });
    } finally {
      setPending(false);
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={pending} className={`${BASE_CLASS} ${className ?? ""}`}>
      {pending ? <SpinnerIcon className="h-3.5 w-3.5 animate-spin-slow" /> : icon}
      {children}
    </button>
  );
}

type ConfirmActionButtonProps = ActionButtonProps & {
  confirmTitle: string;
  confirmMessage: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
};

// ActionButton ile aynı, fakat çalıştırmadan önce window.confirm yerine
// uygulama içi (her ortamda güvenilir şekilde çalışan) bir onay penceresi açar.
export function ConfirmActionButton({
  action,
  className,
  children,
  icon,
  successMessage,
  errorMessage,
  confirmTitle,
  confirmMessage,
  confirmLabel,
  cancelLabel,
  tone = "danger",
}: ConfirmActionButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const { showToast } = useToast();

  async function handleConfirm() {
    setPending(true);
    try {
      await action();
      if (successMessage) showToast({ variant: "success", message: successMessage });
      setOpen(false);
    } catch {
      showToast({ variant: "error", message: errorMessage ?? DEFAULT_ERROR_MESSAGE });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${BASE_CLASS} ${className ?? ""}`}>
        {icon}
        {children}
      </button>
      <ConfirmDialog
        open={open}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirmLabel ?? "Onayla"}
        cancelLabel={cancelLabel ?? "Vazgeç"}
        tone={tone}
        pending={pending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

type ToastFormProps = {
  action: (formData: FormData) => Promise<unknown> | void;
  className?: string;
  children: ReactNode;
  successMessage?: string;
  errorMessage?: string;
  resetOnSuccess?: boolean;
};

// Birden çok alanlı formlar için: window.confirm gerektirmeyen, sonucu
// toast ile bildiren ve gönderim sırasında alanları kilitleyen form sarmalayıcısı.
export function ToastForm({ action, className, children, successMessage, errorMessage, resetOnSuccess }: ToastFormProps) {
  const [pending, setPending] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setPending(true);
    try {
      await action(formData);
      if (successMessage) showToast({ variant: "success", message: successMessage });
      if (resetOnSuccess) form.reset();
    } catch {
      showToast({ variant: "error", message: errorMessage ?? DEFAULT_ERROR_MESSAGE });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
    </form>
  );
}
