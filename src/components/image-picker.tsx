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
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition-colors hover:border-emerald-400 hover:bg-emerald-50/50"
      >
        <ImageIcon className="h-8 w-8 text-slate-400" />
        <span className="text-sm font-medium text-slate-700">
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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={`Önizleme ${i + 1}`}
              className="aspect-square w-full rounded-lg border border-slate-200 object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}
