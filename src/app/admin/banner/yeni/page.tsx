import { HeroSlideForm } from "@/components/admin/hero-slide-form";
import { PageHeader } from "@/components/admin/page-header";
import { PlusIcon } from "@/components/icons";
import { createSlideAction } from "../actions";

export default function NewHeroSlidePage() {
  return (
    <div className="space-y-6">
      <PageHeader icon={PlusIcon} title="Yeni Slayt" description="Ana sayfa slider'ına yeni banner ekleyin." accent="blue" />
      <HeroSlideForm action={createSlideAction} submitLabel="Slaytı Oluştur" />
    </div>
  );
}
