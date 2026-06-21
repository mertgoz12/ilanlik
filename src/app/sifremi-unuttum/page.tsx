import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = {
  title: "Şifremi Unuttum | İlanlio",
};

export default function SifremiUnuttumPage() {
  return (
    <PlaceholderPage
      title="Şifremi Unuttum"
      description="Şifre sıfırlama özelliği çok yakında aktif olacak. Bu sırada hesabınıza erişim için lütfen destek@ilanlio.com adresinden bizimle iletişime geçin."
    />
  );
}
