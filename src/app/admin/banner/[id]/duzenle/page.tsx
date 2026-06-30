import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HeroSlideForm } from "@/components/admin/hero-slide-form";
import { PageHeader } from "@/components/admin/page-header";
import { PencilIcon } from "@/components/icons";
import { updateSlideAction } from "../../actions";

export default async function EditHeroSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const slide = await prisma.heroSlide.findUnique({ where: { id } });
  if (!slide) notFound();

  return (
    <div className="space-y-6">
      <PageHeader icon={PencilIcon} title="Slaytı Düzenle" description={slide.title} accent="blue" />
      <HeroSlideForm
        action={updateSlideAction.bind(null, slide.id)}
        submitLabel="Değişiklikleri Kaydet"
        initialSlide={{
          imageUrl: slide.imageUrl,
          title: slide.title,
          subtitle: slide.subtitle,
          buttonText: slide.buttonText,
          buttonLink: slide.buttonLink,
          isActive: slide.isActive,
        }}
      />
    </div>
  );
}
