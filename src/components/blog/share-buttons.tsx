"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, X } from "lucide-react";

const buttonClass =
  "flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-accent hover:bg-accent-light hover:text-brand";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API desteklenmiyorsa sessizce yoksay - kritik bir özellik değil.
    }
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp'ta paylaş"
        className={buttonClass}
      >
        <MessageCircle className="h-4 w-4" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X'te paylaş"
        className={buttonClass}
      >
        <X className="h-4 w-4" />
      </a>
      <button type="button" onClick={handleCopy} aria-label="Bağlantıyı kopyala" className={buttonClass}>
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
