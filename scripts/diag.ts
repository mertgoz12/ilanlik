process.loadEnvFile(".env");
import { prisma } from "../src/lib/prisma";

async function main() {
  const userCount = await prisma.user.count();
  const catCount = await prisma.category.count();
  const listingCount = await prisma.listing.count();
  console.log("users:", userCount, "categories:", catCount, "listings:", listingCount);

  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
  console.log("Users:", JSON.stringify(users, null, 2));

  const cats = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, parentId: true },
    take: 5,
  });
  console.log("Sample categories:", JSON.stringify(cats, null, 2));

  await prisma.$disconnect();
}

main();
