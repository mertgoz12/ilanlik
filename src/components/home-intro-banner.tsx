import { ShieldCheck } from "lucide-react";

// Eskiden burada büyük, görsel bir hero bölümü vardı (arama çubuğu dahil) -
// sahibinden.com tarzı "dolu pazar yeri" hissi için kaldırıldı: kullanıcı
// siteye girince hemen kategori kartlarını ve ilanları görsün, ikinci bir
// arama çubuğuyla karşılaşmasın (navbar'daki zaten yeterli). Bu sadece tek
// satırlık, az yer kaplayan bir tanıtım şeridi.
export function HomeIntroBanner() {
  return (
    <div className="border-b border-amber-200/70 bg-accent-light">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-1.5 px-4 py-1.5 text-center text-xs text-brand sm:px-6 sm:text-sm lg:px-8">
        <ShieldCheck className="h-4 w-4 shrink-0 text-accent-dark" />
        <span>
          İlanlio&apos;da her ilan yapay zeka ile denetlenir &mdash;{" "}
          <span className="font-bold">Güvenle Al, Güvenle Sat</span>
        </span>
      </div>
    </div>
  );
}
