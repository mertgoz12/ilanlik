export type BrandInfo = { name: string; abbr: string };

// Telifli orijinal marka logoları kullanılmaz; sade, tek renkli, harf
// rozetleriyle temsili marka kartları gösterilir.
export const POPULAR_BRANDS: BrandInfo[] = [
  { name: "BMW", abbr: "BMW" },
  { name: "Mercedes-Benz", abbr: "MB" },
  { name: "Volkswagen", abbr: "VW" },
  { name: "Renault", abbr: "RN" },
  { name: "Fiat", abbr: "FI" },
  { name: "Toyota", abbr: "TY" },
  { name: "Audi", abbr: "AU" },
  { name: "Ford", abbr: "FD" },
  { name: "Hyundai", abbr: "HY" },
  { name: "Honda", abbr: "HD" },
  { name: "Opel", abbr: "OP" },
  { name: "Peugeot", abbr: "PG" },
  { name: "Nissan", abbr: "NS" },
  { name: "Kia", abbr: "KI" },
  { name: "Skoda", abbr: "SK" },
  { name: "Seat", abbr: "SE" },
  { name: "Dacia", abbr: "DA" },
  { name: "Citroën", abbr: "CI" },
  { name: "Mazda", abbr: "MZ" },
  { name: "Volvo", abbr: "VO" },
  { name: "Suzuki", abbr: "SZ" },
  { name: "Mitsubishi", abbr: "MI" },
  { name: "Subaru", abbr: "SB" },
  { name: "Jeep", abbr: "JP" },
  { name: "Land Rover", abbr: "LR" },
  { name: "Porsche", abbr: "PO" },
  { name: "Alfa Romeo", abbr: "AR" },
  { name: "Tesla", abbr: "TS" },
  { name: "Lexus", abbr: "LX" },
  { name: "Chevrolet", abbr: "CV" },
  { name: "Lamborghini", abbr: "LB" },
  { name: "Ferrari", abbr: "FR" },
];

export function BrandBadge({ abbr, className = "" }: { abbr: string; className?: string }) {
  return (
    <span
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-extrabold tracking-wide text-brand shadow-soft transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-accent group-hover:text-accent-dark group-hover:shadow-soft-lg ${className}`}
    >
      {abbr}
    </span>
  );
}
