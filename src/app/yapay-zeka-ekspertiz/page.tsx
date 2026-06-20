import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = { title: "Yapay Zeka Ekspertiz - İlanlio" };

export default function YapayZekaEkspertizPage() {
  return (
    <PlaceholderPage
      title="Yapay Zeka Ekspertiz"
      description="İlanlarınız yapay zeka ile nasıl denetleniyor, detaylar yakında burada."
    />
  );
}
