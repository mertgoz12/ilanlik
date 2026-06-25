import { notFound } from "next/navigation";
import { requireUserPage } from "@/lib/account-auth";
import { prisma } from "@/lib/prisma";
import { FormSection } from "@/components/form-ui";
import { PageHeader } from "@/components/admin/page-header";
import { ImageIcon, PencilIcon } from "@/components/icons";
import { EditListingForm } from "./edit-listing-form";
import { EditListingPhotos } from "./edit-listing-photos";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireUserPage("/hesabim/ilanlarim");
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      title: true,
      description: true,
      price: true,
      condition: true,
      brand: true,
      il: true,
      ilce: true,
      images: { orderBy: { order: "asc" }, select: { id: true, url: true } },
    },
  });

  if (!listing || listing.userId !== session.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={PencilIcon} title="İlanı Düzenle" description={listing.title} accent="blue" />

      <FormSection title="Fotoğraflar" description="İlk fotoğraf kapak olarak gösterilir." icon={ImageIcon} accent="blue">
        <EditListingPhotos listingId={listing.id} images={listing.images} />
      </FormSection>

      <EditListingForm listing={listing} />
    </div>
  );
}
