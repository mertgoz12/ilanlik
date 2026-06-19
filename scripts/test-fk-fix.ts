process.loadEnvFile(".env");
import { prisma } from "../src/lib/prisma";

async function main() {
  const user = await prisma.user.findFirst({ select: { id: true, email: true } });
  const category = await prisma.category.findFirst({ where: { slug: "otomobil" }, select: { id: true, name: true } });
  console.log("Valid user:", user);
  console.log("Valid category:", category);

  // 1. Reproduce the original bug with bogus ids (should throw FK error)
  try {
    await prisma.listing.create({
      data: {
        listingNo: "9999999999",
        title: "FK test - invalid ids",
        categoryId: "bogus-category-id",
        description: null,
        price: 1000,
        il: "Test",
        ilce: "Test",
        userId: "bogus-user-id",
      },
    });
    console.log("UNEXPECTED: create succeeded with bogus ids");
  } catch (err: any) {
    console.log("Reproduced original bug ->", err.code, "|", String(err.message).split("\n").pop());
  }

  // 2. Existence checks (mirrors categoryExists()/requireValidUser() guard logic)
  const bogusCategory = await prisma.category.findUnique({ where: { id: "bogus-category-id" }, select: { id: true } });
  const realCategory = await prisma.category.findUnique({ where: { id: category!.id }, select: { id: true } });
  const bogusUser = await prisma.user.findUnique({ where: { id: "bogus-user-id" }, select: { id: true } });
  const realUser = await prisma.user.findUnique({ where: { id: user!.id }, select: { id: true } });
  console.log("categoryExists(bogus) =", !!bogusCategory, "| categoryExists(real) =", !!realCategory);
  console.log("userExists(bogus) =", !!bogusUser, "| userExists(real) =", !!realUser);

  // 3. Happy path with current valid ids (mirrors createListingAction's create call)
  let listingNo = String(Math.floor(1_000_000_000 + Math.random() * 8_999_999_999));
  while (await prisma.listing.findUnique({ where: { listingNo } })) {
    listingNo = String(Math.floor(1_000_000_000 + Math.random() * 8_999_999_999));
  }
  const listing = await prisma.listing.create({
    data: {
      listingNo,
      title: "FK Test - 2020 Renault Clio",
      categoryId: category!.id,
      brand: "Renault",
      model: "Clio",
      year: 2020,
      km: 50000,
      price: 450000,
      fuelType: "Benzin",
      transmission: "Manuel",
      damageStatus: "hasarsiz",
      damageInfo: JSON.stringify({}),
      il: "Ankara",
      ilce: "Çankaya",
      userId: user!.id,
    },
  });
  console.log("Created valid listing:", listing.listingNo, listing.id);

  await prisma.listing.delete({ where: { id: listing.id } });
  console.log("Cleaned up test listing.");

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
