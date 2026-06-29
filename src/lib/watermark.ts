import sharp from "sharp";

const WATERMARK_TEXT = "ilanlio.com";

// Görselin tam boyutuna göre tek bir SVG katmanı üretir: yalnızca ortada
// ~32 derece çapraz, yarı saydam tek bir filigran yazısı. Hem açık hem koyu
// fotoğraflarda okunsun diye yazının etrafında hafif bir gölge (feDropShadow)
// kullanılır.
function buildWatermarkSvg(width: number, height: number): string {
  const centerFontSize = Math.round(width * 0.085);
  const angle = -32;
  const shadowBlur = Math.max(1, Math.round(centerFontSize * 0.04));

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="wmShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0" stdDeviation="${shadowBlur}" flood-color="#000000" flood-opacity="0.45" />
    </filter>
  </defs>
  <text
    x="${width / 2}" y="${height / 2}"
    transform="rotate(${angle} ${width / 2} ${height / 2})"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="700"
    font-size="${centerFontSize}"
    fill="#ffffff"
    fill-opacity="0.3"
    filter="url(#wmShadow)"
  >${WATERMARK_TEXT}</text>
</svg>`;
}

export type WatermarkResult = { buffer: Buffer; contentType: string; extension: string };

// İlan fotoğraflarına kalıcı "ilanlio.com" filigranı ekler - depolanan
// (Vercel Blob'a yüklenen) görsel bu işlemden geçmiş halidir, filigransız
// orijinal hiçbir zaman saklanmaz/sunulmaz. Görselin orijinal formatı
// (JPEG/PNG/WebP) korunur; tanınmayan formatlarda JPEG'e düşülür.
export async function applyWatermark(input: Buffer): Promise<WatermarkResult> {
  const image = sharp(input).rotate(); // EXIF yönünü piksellere işler (döndürülmüş telefon fotoğrafları düzgün görünsün)
  const metadata = await image.metadata();
  const width = metadata.width ?? 1200;
  const height = metadata.height ?? 900;
  const svg = buildWatermarkSvg(width, height);
  const composited = image.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]);

  if (metadata.format === "png") {
    return { buffer: await composited.png().toBuffer(), contentType: "image/png", extension: ".png" };
  }
  if (metadata.format === "webp") {
    return { buffer: await composited.webp({ quality: 90 }).toBuffer(), contentType: "image/webp", extension: ".webp" };
  }
  return { buffer: await composited.jpeg({ quality: 88 }).toBuffer(), contentType: "image/jpeg", extension: ".jpg" };
}
