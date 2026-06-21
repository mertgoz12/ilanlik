import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AuthLayout } from "@/components/auth-layout";
import { RegisterForm } from "./register-form";

export default async function KayitPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <AuthLayout title="Üye Ol" subtitle="Ücretsiz hesap oluştur, hemen ilan vermeye başla.">
      <RegisterForm />
    </AuthLayout>
  );
}
