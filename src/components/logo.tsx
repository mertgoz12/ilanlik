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

// Eskiden statik bir görsel (public/logo.png) kullanılıyordu; marka adı
// değiştiğinde (İlanlık -> İlanlio) görseldeki pikselleri güncellemek mümkün
// olmadığından metin tabanlı bir logoya geçildi - bundan sonra marka adı
// kodda tek satırda güncellenebilir. Sora fontu (--font-sora, extrabold)
// zaten projeye dahildi, görsel stile en yakın hazır font olarak kullanıldı.
const TEXT_SIZE: Record<LogoSize, string> = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
};

export function Logo({ size = "md", variant = "light", className = "" }: LogoProps) {
  const brandClass = variant === "dark" ? "text-white" : "text-brand";

  return (
    <Link
      href="/"
      aria-label="İlanlio - Ana sayfa"
      className={`inline-flex shrink-0 items-baseline font-display font-extrabold tracking-tight ${TEXT_SIZE[size]} ${className}`}
    >
      <span className={brandClass}>ilanlio</span>
      <span className="text-accent">.com</span>
    </Link>
  );
}
