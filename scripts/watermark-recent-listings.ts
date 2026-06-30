import { randomUUID } from "crypto";
import { del, put } from "@vercel/blob";
import { prisma } from "../src/lib/prisma";
import { applyWatermark } from "../src/lib/watermark";

// HEDEFLİ geçiş scripti: EN YENİ N ilanın fotoğraflarına filigran ekler.
// Kullanım amacı: filigran üretimi fonta bağımlı SVG <text> iken Vercel'de
// font olmadığından filigransız yüklenen son ilanlar. Bu fotoğraflarda GÖRÜNÜR
// filigran YOK, dolayısıyla yeni (path tabanlı) filigranı bir kez uygulamak
// doğru sonucu verir (üst üste binme olmaz).
//
// DİKKAT: Daha eski ilanlar zaten filigranlı; onlara DOKUNMAYIN (tekrar
// uygulanırsa filigran üst üste biner). Bu yüzden script yalnızca en yeni N
// ilanı işler.
//
// Kullanım:
//   npx tsx --env-file=.env scripts/watermark-recent-listings.ts --count=4 --dry-run
//   npx tsx --env-file=.env scripts/watermark-recent-listings.ts --count=4
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const countArg = args.find((a) => a.startsWith("--count="));
  const count = countArg ? Number(countArg.split("=")[1]) : 4;

  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: count,
    select: {
      id: true,
      title: true,
      listingNo: true,
      createdAt: true,
      images: { orderBy: { order: "asc" }, select: { id: true, url: true, listingId: true } },
    },
  });

  console.log(
    `En yeni ${listings.length} ilan işlenecek.${dryRun ? " (DRY RUN - değişiklik yapılmayacak)" : ""}\n`,
  );

  let success = 0;
  let failed = 0;

  for (const listing of listings) {
    console.log(
      `İlan: ${listing.title} (No: ${listing.listingNo}, ${listing.images.length} foto, ${listing.createdAt.toISOString().slice(0, 10)})`,
    );
    for (const image of listing.images) {
      try {
        const response = await fetch(image.url);
        if (!response.ok) throw new Error(`indirme başarısız: ${response.status}`);
        const original = Buffer.from(await response.arrayBuffer());
        const { buffer, contentType, extension } = await applyWatermark(original);

        if (dryRun) {
          console.log(`  [dry-run] ${image.id} -> işlenecek (${buffer.length} byte)`);
          success++;
          continue;
        }

        const pathname = `listings/${image.listingId}/${randomUUID()}${extension}`;
        const blob = await put(pathname, buffer, { access: "public", contentType });
        await prisma.listingImage.update({ where: { id: image.id }, data: { url: blob.url } });
        await del(image.url);

        console.log(`  OK: ${image.id} -> ${blob.url}`);
        success++;
      } catch (err) {
        console.error(`  HATA: ${image.id} (${image.url}):`, err);
        failed++;
      }
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
