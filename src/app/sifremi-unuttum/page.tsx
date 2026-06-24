import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth-layout";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Şifremi Unuttum | İlanlio",
};

export default function SifremiUnuttumPage() {
  return (
    <AuthLayout
      title="Şifremi Unuttum"
      subtitle="E-posta adresini gir, sana şifre sıfırlama bağlantısı gönderelim."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
