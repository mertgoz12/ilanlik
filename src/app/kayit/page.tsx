import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { RegisterForm } from "./register-form";

export default async function KayitPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Üye Ol</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ücretsiz hesap oluştur, hemen ilan vermeye başla.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <RegisterForm />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="font-semibold text-emerald-700 hover:text-emerald-600">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
