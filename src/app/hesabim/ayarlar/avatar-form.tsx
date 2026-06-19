"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useToast } from "@/components/admin/toast";
import { ImageIcon, UserIcon } from "@/components/icons";
import { updateAvatarAction, type AvatarFormState } from "./actions";

const initialState: AvatarFormState = {};

export function AvatarForm({ avatarUrl, name }: { avatarUrl: string | null; name: string }) {
  const [preview, setPreview] = useState(avatarUrl);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const formData = new FormData();
    formData.set("avatar", file);

    setPending(true);
    try {
      const result = await updateAvatarAction(initialState, formData);
      if (result.success && result.avatarUrl) {
        setPreview(result.avatarUrl);
        showToast({ variant: "success", message: "Profil fotoğrafı güncellendi." });
      } else {
        setPreview(avatarUrl);
        showToast({ variant: "error", message: result.error ?? "Yükleme başarısız oldu." });
      }
    } catch {
      setPreview(avatarUrl);
      showToast({ variant: "error", message: "Yükleme başarısız oldu." });
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400">
        {preview ? (
          <img src={preview} alt={name} className="h-full w-full object-cover" />
        ) : (
          <UserIcon className="h-8 w-8" />
        )}
      </span>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ImageIcon className="h-4 w-4" />
          {pending ? "Yükleniyor..." : "Fotoğraf Değiştir"}
        </button>
        <p className="mt-1.5 text-xs text-slate-400">JPG, PNG, WEBP veya GIF · en fazla 2MB.</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
