import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = { title: "Vitrin / Öne Çıkarma - İlanlio" };

export default function OneCikarmaPage() {
  return (
    <PlaceholderPage
      title="Vitrin / Öne Çıkarma"
      description="İlanınızı vitrine taşıyıp daha çok alıcıya ulaştıracak öne çıkarma seçenekleri yakında."
    />
  );
}
