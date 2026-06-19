import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./login-form";

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/");

  const { callbackUrl } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Giriş Yap</h1>
          <p className="mt-1 text-sm text-slate-500">
            Hesabına giriş yap, ilan ver ve ilanlarını yönet.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <LoginForm callbackUrl={callbackUrl} />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Hesabın yok mu?{" "}
          <Link href="/kayit" className="font-semibold text-emerald-700 hover:text-emerald-600">
            Üye Ol
          </Link>
        </p>
      </div>
    </div>
  );
}
