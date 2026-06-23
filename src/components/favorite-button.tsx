"use client";

import { useState, useTransition, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleFavoriteAction } from "@/lib/social-actions";

const SIZE_CLASSES = {
  xs: { button: "h-5 w-5", icon: "h-2.5 w-2.5" },
  sm: { button: "h-8 w-8", icon: "h-4 w-4" },
};

type FavoriteButtonProps = {
  listingId: string;
  initialFavorited?: boolean;
  isLoggedIn?: boolean;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
};

export function FavoriteButton({
  listingId,
  initialFavorited = false,
  isLoggedIn = false,
  size = "sm",
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
      className={`flex ${SIZE_CLASSES[size].button} shrink-0 items-center justify-center rounded-full bg-white/80 shadow-soft backdrop-blur-md transition-colors ${
        active ? "text-red-500" : "text-slate-500 hover:text-red-500"
      } ${className}`}
    >
      <Heart className={`${SIZE_CLASSES[size].icon} ${active ? "fill-current" : ""}`} />
    </button>
  );
}
