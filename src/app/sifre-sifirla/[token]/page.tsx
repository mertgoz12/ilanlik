import type { Metadata } from "next";
import { AlertIcon } from "@/components/icons";
import { AuthLayout } from "@/components/auth-layout";
import { StatusCard } from "@/components/status-card";
import { verifyResetToken } from "@/lib/password-reset";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Şifre Sıfırla | İlanlio" };

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await verifyResetToken(token);

  if (!result.ok) {
    return (
      <StatusCard
        icon={AlertIcon}
        tone="error"
        title={result.reason === "expired" ? "Bağlantının Süresi Dolmuş" : "Geçersiz Bağlantı"}
        message="Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Yeni bir bağlantı isteyebilirsiniz."
        cta={{ label: "Yeni Bağlantı İste", href: "/sifremi-unuttum" }}
      />
    );
  }

  return (
    <AuthLayout title="Yeni Şifre Belirle" subtitle="Hesabın için yeni bir şifre oluştur.">
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
