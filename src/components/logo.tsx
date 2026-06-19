import Image from "next/image";
import Link from "next/link";

type LogoSize = "sm" | "md" | "lg";
type LogoVariant = "light" | "dark";

type LogoProps = {
  /** "sm" for the footer, "md" (default) for the navbar, "lg" for larger placements. */
  size?: LogoSize;
  /** "dark" for use on dark/brand-colored backgrounds (e.g. footer). */
  variant?: LogoVariant;
  className?: string;
};

// public/logo.png intrinsic boyutu (en/boy oranı) - genişlik bu orana göre otomatik hesaplanır.
const LOGO_ASPECT_RATIO = 2508 / 627;

// "light": açık zeminler için orijinal lacivert+sarı görsel (public/logo.png).
// "dark": koyu zeminler (örn. lacivert footer) için "ilanlık" beyaza çevrilmiş
// görsel (public/logo-white.png) - aksi halde lacivert yazı lacivert zeminde kaybolur.
const LOGO_SRC: Record<LogoVariant, string> = {
  light: "/logo.png",
  dark: "/logo-white.png",
};

const IMAGE_HEIGHT: Record<LogoSize, number> = {
  sm: 28,
  md: 36,
  lg: 44,
};

export function Logo({ size = "md", variant = "light", className = "" }: LogoProps) {
  const height = IMAGE_HEIGHT[size];
  const width = Math.round(height * LOGO_ASPECT_RATIO);

  return (
    <Link href="/" aria-label="İlanlık - Ana sayfa" className={`inline-block shrink-0 ${className}`}>
      <Image
        src={LOGO_SRC[variant]}
        alt="İlanlık"
        width={width}
        height={height}
        preload
        style={{ height, width: "auto" }}
      />
    </Link>
  );
}
