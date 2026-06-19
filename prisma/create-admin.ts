import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hashPassword } from "../src/lib/password";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

const DEFAULT_EMAIL = "admin@ilanlik.com";
const DEFAULT_PASSWORD = "admin12345";

async function main() {
  const email = process.env.ADMIN_EMAIL ?? process.argv[2] ?? DEFAULT_EMAIL;
  const plainPassword = process.env.ADMIN_PASSWORD ?? process.argv[3] ?? DEFAULT_PASSWORD;
  const password = await hashPassword(plainPassword);

  await prisma.user.upsert({
    where: { email },
    update: { password, role: "admin" },
    create: { name: "Admin", email, password, role: "admin", isVerified: true },
  });

  console.log("Admin hesabı hazır:");
  console.log(`  E-posta : ${email}`);
  console.log(`  Şifre   : ${plainPassword}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
