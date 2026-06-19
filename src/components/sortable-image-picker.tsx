"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CloseIcon, ImageIcon } from "./icons";

export const MAX_IMAGES = 10;

type SortableImagePickerProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
};

export function SortableImagePicker({ files, onFilesChange }: SortableImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  function addFiles(newFiles: File[]) {
    if (newFiles.length === 0) return;
    onFilesChange([...files, ...newFiles].slice(0, MAX_IMAGES));
  }

  function removeAt(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  function reorder(from: number, to: number) {
    if (from === to) return;
    const next = [...files];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onFilesChange(next);
  }

  return (
    <div>
      <label
        htmlFor="wizard-images"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(Array.from(e.dataTransfer.files ?? []));
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition-colors hover:border-emerald-400 hover:bg-emerald-50/50"
      >
        <ImageIcon className="h-8 w-8 text-slate-400" />
        <span className="text-sm font-medium text-slate-700">
          Fotoğraf eklemek için tıklayın veya sürükleyip bırakın
        </span>
        <span className="text-xs text-slate-400">
          PNG, JPG veya WEBP &middot; en fazla {MAX_IMAGES} fotoğraf &middot; sıralamak için sürükleyin
        </span>
        <input
          ref={inputRef}
          id="wizard-images"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
          className="sr-only"
        />
      </label>

      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {previews.map((src, i) => (
            <div
              key={src}
              draggable
              onDragStart={() => setDraggingIndex(i)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverIndex(i);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggingIndex !== null) reorder(draggingIndex, i);
                setDraggingIndex(null);
                setDragOverIndex(null);
              }}
              onDragEnd={() => {
                setDraggingIndex(null);
                setDragOverIndex(null);
              }}
              className={`group relative aspect-square w-full cursor-grab overflow-hidden rounded-lg border transition-colors ${
                dragOverIndex === i ? "border-emerald-500 ring-2 ring-emerald-500/30" : "border-slate-200"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Fotoğraf ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Kapak
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Fotoğrafı kaldır"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Keeps the real `<input type="file" name="images" multiple>` in sync with an
 * ordered File[] array via the DataTransfer API, so formData.getAll("images")
 * returns files in the user's chosen order on submit. Render this once,
 * unconditionally, at the wizard's top level.
 */
export function HiddenFileInput({ files }: { files: File[] }) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    if (ref.current) ref.current.files = dataTransfer.files;
  }, [files]);

  return <input ref={ref} type="file" name="images" multiple className="sr-only" aria-hidden tabIndex={-1} />;
}
