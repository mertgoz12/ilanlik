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

// public/logo.png opak (alfa kanalsız) beyaz zeminli bir görsel - navy footer
// üzerinde direkt kullanılırsa beyaz bir kutu gibi görünür, bu yüzden dark
// varyantta küçük bir beyaz "kart" içine alınıyor.
const DIMENSIONS: Record<LogoSize, { width: number; height: number }> = {
  sm: { width: 108, height: 27 },
  md: { width: 138, height: 34 },
  lg: { width: 168, height: 42 },
};

export function Logo({ size = "md", variant = "light", className = "" }: LogoProps) {
  const { width, height } = DIMENSIONS[size];

  const image = (
    <Image src="/logo.png" alt="İlanlio" width={width} height={height} priority />
  );

  return (
    <Link
      href="/"
      aria-label="İlanlio - Ana sayfa"
      className={`inline-flex shrink-0 items-center ${className}`}
    >
      {variant === "dark" ? (
        <span className="inline-flex rounded-md bg-white px-2 py-1.5">{image}</span>
      ) : (
        image
      )}
    </Link>
  );
}
