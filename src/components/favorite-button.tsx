"use client";

import { useState, useTransition, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleFavoriteAction } from "@/lib/social-actions";

type FavoriteButtonProps = {
  listingId: string;
  initialFavorited?: boolean;
  isLoggedIn?: boolean;
  className?: string;
};

export function FavoriteButton({
  listingId,
  initialFavorited = false,
  isLoggedIn = false,
  className = "",
}: FavoriteButtonProps) {
  const [active, setActive] = useState(initialFavorited);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push(`/giris?callbackUrl=${encodeURIComponent("/")}`);
      return;
    }

    setActive((prev) => !prev);
    startTransition(async () => {
      try {
        await toggleFavoriteAction(listingId);
      } catch {
        setActive((prev) => !prev);
      }
    });
  }

  return (
    <button
      type="button"
      aria-label={active ? "Favorilerden çıkar" : "Favorilere ekle"}
      aria-pressed={active}
      onClick={handleClick}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 shadow-soft backdrop-blur-md transition-colors ${
        active ? "text-red-500" : "text-slate-500 hover:text-red-500"
      } ${className}`}
    >
      <Heart className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
    </button>
  );
}
