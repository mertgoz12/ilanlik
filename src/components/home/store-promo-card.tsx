import Link from "next/link";
import { Store } from "lucide-react";

export function StorePromoCard() {
  return (
    <section className="relative overflow-hidden rounded-xl bg-brand p-4 text-white shadow-soft">
      <span className="absolute -right-4 -top-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-accent">
        <Store className="h-7 w-7" />
      </span>
      <h2 className="max-w-[80%] text-sm font-bold leading-snug">
        Mağazanızı açın, ilanlarınızı öne çıkarın.
      </h2>
      <Link
        href="/kurumsal-uyelik"
        className="mt-3 inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-brand shadow-sm transition-colors hover:bg-accent-dark"
      >
        Mağaza Aç
      </Link>
    </section>
  );
}
