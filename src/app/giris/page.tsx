import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AuthLayout } from "@/components/auth-layout";
import { LoginForm } from "./login-form";

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/");

  const { callbackUrl, error } = await searchParams;

  return (
    <AuthLayout title="Giriş Yap" subtitle="Hesabına giriş yap, ilan ver ve ilanlarını yönet.">
      <LoginForm callbackUrl={callbackUrl} socialError={error} />
    </AuthLayout>
  );
}
