import Link from "next/link";
import { Award, Plus, ScanSearch, ShieldCheck, Sparkles } from "lucide-react";
import { SearchBar } from "./search-bar";
import { TrustBadge } from "./trust-badge";

// Görsel olarak gerçek fotoğraf/illüstrasyon kullanmak yerine (telif/lisans
// riski ve ek ağ bağımlılığı yaratmamak için) bu kompozisyon tamamen CSS
// gradyanları, SVG ikonları ve gerçek TrustBadge bileşeniyle inşa edilir -
// hem marka renkleriyle garanti uyumlu hem de sitenin gerçek "güven puanı"
// görselini tanıtır.
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand to-brand-700">
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1.5px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="absolute -top-24 -right-16 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-brand-400/25 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-accent ring-1 ring-white/15">
              <Sparkles className="h-3.5 w-3.5" />
              Yapay Zeka Destekli Güven
            </span>

            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
              Güvenle Al, Güvenle Sat
              <span className="block text-accent">Her İlan Yapay Zeka ile Denetlenir</span>
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-relaxed text-brand-100 sm:text-base">
              İlanlio&apos;da her ilan; fahiş fiyat, tutarsız açıklama ve hasar bilgisi açısından otomatik
              olarak incelenir. Siz sadece güvenle alışveriş yapın.
            </p>

            <div className="mt-6 rounded-xl bg-white p-2 shadow-soft-lg">
              <SearchBar />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/ilan-ver"
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-brand shadow-sm transition-colors hover:bg-accent-dark"
              >
                <Plus className="h-4 w-4" />
                Ücretsiz İlan Ver
              </Link>
              <Link
                href="/nasil-calisir"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Nasıl Çalışır?
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-brand-100 sm:text-sm">
              <span className="flex items-center gap-1.5">
                <ScanSearch className="h-4 w-4 text-accent" />
                Yapay Zeka Ekspertiz
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Güvenli Alışveriş
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-accent" />
                Güven Puanı
              </span>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />

            <div className="relative mx-auto w-72 -rotate-3 rounded-2xl bg-white p-4 shadow-soft-lg transition-transform duration-500 hover:rotate-0">
              <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200">
                <ScanSearch className="h-10 w-10 text-slate-300" />
              </div>
              <div className="mt-3 h-3 w-4/5 rounded-full bg-slate-200" />
              <div className="mt-2 h-3 w-1/2 rounded-full bg-slate-100" />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">₺18.500</span>
                <TrustBadge score={96} size="sm" />
              </div>
            </div>

            <div className="absolute -left-8 top-6 flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-semibold text-brand shadow-soft-lg animate-fade-in-up">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Güvenli Alışveriş
            </div>

            <div className="absolute -right-6 top-1/2 flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-semibold text-brand shadow-soft-lg animate-fade-in-up">
              <Sparkles className="h-4 w-4 text-accent" />
              Yapay Zeka Onaylı
            </div>

            <div className="absolute -left-4 bottom-2 flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-semibold text-brand shadow-soft-lg animate-fade-in-up">
              <Award className="h-4 w-4 text-sky-500" />
              96 Güven Puanı
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
