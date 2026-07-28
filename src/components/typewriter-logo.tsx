"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const FULL = "ilanlio.com";
const NAVY_LEN = 7; // "ilanlio"
const TYPE_MS = 85;

// Marka logosu, daktilo efektiyle harf harf yazılır (navy "ilanlio" + turuncu
// ".com"). Bir kez oynar; boyut kaymasını önlemek için tam metin görünmez bir
// hayalet olarak yer ayırır.
export function TypewriterLogo({
  className = "",
  size = "md",
  replayKey,
}: {
  className?: string;
  size?: "md" | "lg";
  replayKey?: unknown;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= FULL.length) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, TYPE_MS);
    return () => clearInterval(id);
  }, [replayKey]);

  const shown = FULL.slice(0, count);
  const navy = shown.slice(0, Math.min(count, NAVY_LEN));
  const com = count > NAVY_LEN ? shown.slice(NAVY_LEN) : "";
  const typing = count < FULL.length;
  const sizeClass = size === "lg" ? "text-3xl" : "text-xl sm:text-2xl";

  return (
    <Link
      href="/"
      aria-label="İlanlio - Ana sayfa"
      className={`inline-flex shrink-0 items-center font-display font-extrabold tracking-tight ${sizeClass} ${className}`}
    >
      <span className="relative inline-block leading-none">
        <span aria-hidden className="invisible">
          {FULL}
        </span>
        <span className="absolute left-0 top-0 whitespace-nowrap">
          <span className="text-brand">{navy}</span>
          <span className="text-accent">{com}</span>
          {typing && <span className="ml-px animate-pulse text-brand">|</span>}
        </span>
      </span>
    </Link>
  );
}
