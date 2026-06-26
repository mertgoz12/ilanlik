"use client";

import { useState } from "react";
import { ImageIcon } from "./icons";

const MAX_FILES = 10;

export function ImagePicker() {
  const [previews, setPreviews] = useState<string[]>([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_FILES);
    setPreviews((old) => {
      old.forEach((url) => URL.revokeObjectURL(url));
      return files.map((file) => URL.createObjectURL(file));
    });
  }

  return (
    <div>
      <label
        htmlFor="images"
        className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition-colors hover:border-accent hover:bg-accent-light/40"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-soft transition-colors group-hover:text-accent-dark">
          <ImageIcon className="h-6 w-6" />
        </span>
        <span className="text-sm font-semibold text-slate-700">
          Fotoğraf eklemek için tıklayın
        </span>
        <span className="text-xs text-slate-400">
          PNG, JPG veya WEBP &middot; en fazla {MAX_FILES} fotoğraf
        </span>
        <input
          id="images"
          name="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="sr-only"
        />
      </label>

      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {previews.map((src, i) => (
            <span key={src} className="relative block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Önizleme ${i + 1}`}
                className="aspect-square w-full rounded-xl border border-slate-200 object-cover shadow-soft"
              />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Kapak
                </span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
