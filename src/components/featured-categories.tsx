import Link from "next/link";
import { Bike, Car, Gamepad2, Laptop, Mountain, Shirt, Smartphone, Truck, Tv, Zap } from "lucide-react";
import { isVasitaEmlakActive } from "@/lib/categories";

// Vasıta aktif olduğunda kullanılacak eski hero kategorileri - kod silinmedi,
// bayrak açıldığında geri döner (bkz. ARAC_EMLAK_AKTIF).
const VASITA_CATEGORIES = [
  { name: "Otomobil", slug: "otomobil", icon: Car },
  { name: "SUV", slug: "arazi-suv-pickup", icon: Mountain },
  { name: "Motosiklet", slug: "motosiklet", icon: Bike },
  { name: "Ticari", slug: "ticari-araclar", icon: Truck },
  { name: "Elektrikli", slug: "elektrikli-araclar", icon: Zap },
];

// İlk yayın sürümünde vitrin ikinci el/sıfır ürünlere odaklı.
const IKINCI_EL_CATEGORIES = [
  { name: "Cep Telefonu", slug: "cep-telefonu", icon: Smartphone },
  { name: "Bilgisayar", slug: "bilgisayar", icon: Laptop },
  { name: "Ev Elektroniği", slug: "ev-elektronigi", icon: Tv },
  { name: "Giyim & Aksesuar", slug: "giyim-aksesuar", icon: Shirt },
  { name: "Oyun & Hobi", slug: "oyun-hobi", icon: Gamepad2 },
];

export function FeaturedCategories() {
  const categories = isVasitaEmlakActive() ? VASITA_CATEGORIES : IKINCI_EL_CATEGORIES;

  return (
    <section className="border-b border-slate-200/70 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {categories.map(({ name, slug, icon: Icon }) => (
            <Link
              key={slug}
              href={`/?kategori=${slug}`}
              className="group flex flex-col items-center gap-2 rounded-xl border border-brand bg-gradient-to-br from-brand to-brand-900 p-4 text-center shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-lg sm:p-5"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-brand sm:h-14 sm:w-14">
                <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
              </span>
              <span className="text-sm font-semibold text-white sm:text-base">{name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
