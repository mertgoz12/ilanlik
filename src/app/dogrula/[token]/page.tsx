import type { Metadata } from "next";
import { AlertIcon, CheckCircleIcon } from "@/components/icons";
import { StatusCard } from "@/components/status-card";
import { verifyEmailToken } from "@/lib/email-verification";
import { ResendVerificationForm } from "./resend-form";

export const metadata: Metadata = { title: "E-posta Doğrulama | İlanlio" };

export default async function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await verifyEmailToken(token);

  if (result.ok) {
    return (
      <StatusCard
        icon={CheckCircleIcon}
        tone="success"
        title="E-postanız Doğrulandı! 🎉"
        message="Artık hesabınız tam olarak aktif. Hemen ilan vermeye başlayabilirsiniz."
        cta={{ label: "İlan Ver", href: "/ilan-ver" }}
      />
    );
  }

  if (result.reason === "already-verified") {
    return (
      <StatusCard
        icon={CheckCircleIcon}
        tone="success"
        title="E-postanız Zaten Doğrulanmış"
        message="Hesabınız aktif - giriş yaparak kullanmaya devam edebilirsiniz."
        cta={{ label: "Giriş Yap", href: "/giris" }}
      />
    );
  }

  if (result.reason === "expired") {
    return (
      <StatusCard
        icon={AlertIcon}
        tone="error"
        title="Bağlantının Süresi Dolmuş"
        message="Bu doğrulama bağlantısı 24 saat içinde kullanılmadığı için geçersiz oldu. E-posta adresinizi girerek yeni bir bağlantı isteyebilirsiniz."
      >
        <ResendVerificationForm />
      </StatusCard>
    );
  }

  return (
    <StatusCard
      icon={AlertIcon}
      tone="error"
      title="Geçersiz Bağlantı"
      message="Bu doğrulama bağlantısı geçersiz veya daha önce kullanılmış olabilir."
      cta={{ label: "Giriş Yap", href: "/giris" }}
    />
  );
}
