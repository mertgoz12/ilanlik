import { randomUUID } from "crypto";
import { del, put } from "@vercel/blob";
import { prisma } from "../src/lib/prisma";
import { applyWatermark } from "../src/lib/watermark";

// TEK SEFERLİK geçiş scripti: filigran sistemi devreye girmeden önce
// yüklenmiş, filigransız ilan fotoğraflarına filigran ekler. ZATEN
// FİLİGRANLI bir görsele tekrar uygulanırsa filigran üst üste biner - bu
// scripti yalnızca BİR KEZ, eski (filigransız) fotoğraflar için çalıştırın.
//
// Kullanım:
//   npx tsx --env-file=.env scripts/backfill-watermark-photos.ts --dry-run
//   npx tsx --env-file=.env scripts/backfill-watermark-photos.ts --limit=5
//   npx tsx --env-file=.env scripts/backfill-watermark-photos.ts
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;

  const images = await prisma.listingImage.findMany({
    orderBy: { id: "asc" },
    ...(limit ? { take: limit } : {}),
  });

  console.log(`${images.length} fotoğraf bulundu.${dryRun ? " (DRY RUN - hiçbir değişiklik yapılmayacak)" : ""}`);

  let success = 0;
  let failed = 0;

  for (const image of images) {
    try {
      const response = await fetch(image.url);
      if (!response.ok) throw new Error(`indirme başarısız: ${response.status}`);
      const original = Buffer.from(await response.arrayBuffer());
      const { buffer, contentType, extension } = await applyWatermark(original);

      if (dryRun) {
        console.log(`[dry-run] ${image.id} -> işlenecek (${buffer.length} byte)`);
        success++;
        continue;
      }

      const pathname = `listings/${image.listingId}/${randomUUID()}${extension}`;
      const blob = await put(pathname, buffer, { access: "public", contentType });
      await prisma.listingImage.update({ where: { id: image.id }, data: { url: blob.url } });
      await del(image.url);

      console.log(`OK: ${image.id} -> ${blob.url}`);
      success++;
    } catch (err) {
      console.error(`HATA: ${image.id} (${image.url}):`, err);
      failed++;
    }
  }

  console.log(`\nTamamlandı. Başarılı: ${success}, Başarısız: ${failed}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
