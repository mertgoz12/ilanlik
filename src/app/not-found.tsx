import Link from "next/link";
import { CarIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <CarIcon className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Sayfa Bulunamadı</h1>
      <p className="mt-2 text-sm text-slate-500">
        Aradığınız ilan veya sayfa kaldırılmış ya da hiç var olmamış olabilir.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
      >
        Anasayfaya Dön
      </Link>
    </div>
  );
}
