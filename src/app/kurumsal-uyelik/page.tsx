import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = { title: "Galeri / Kurumsal Üyelik - İlanlio" };

export default function KurumsalUyelikPage() {
  return (
    <PlaceholderPage
      title="Galeri / Kurumsal Üyelik"
      description="Galeri ve kurumsal hesaplara özel üyelik avantajları yakında burada."
    />
  );
}
