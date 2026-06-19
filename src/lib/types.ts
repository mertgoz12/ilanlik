import type { Prisma } from "@/generated/prisma/client";

export type ListingWithImages = Prisma.ListingGetPayload<{
  include: { images: true; category: true };
}>;

export type ListingWithDetails = Prisma.ListingGetPayload<{
  include: {
    images: true;
    category: { include: { parent: true } };
    user: { select: { name: true; phone: true; createdAt: true } };
  };
}>;
