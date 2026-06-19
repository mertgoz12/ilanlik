import { notFound } from "next/navigation";
import { requireUserPage } from "@/lib/account-auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { PencilIcon } from "@/components/icons";
import { EditListingForm } from "./edit-listing-form";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireUserPage("/hesabim/ilanlarim");
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { id: true, userId: true, title: true, description: true, price: true, il: true, ilce: true },
  });

  if (!listing || listing.userId !== session.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={PencilIcon} title="İlanı Düzenle" description={listing.title} accent="blue" />
      <EditListingForm listing={listing} />
    </div>
  );
}
