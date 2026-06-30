import sharp from "sharp";

// "ilanlio.com" filigranı VEKTÖR PATH olarak gömülüdür (Arial Bold'dan bir kez
// üretildi). Neden path? sharp/librsvg, SVG <text> öğesini sistem fontuyla
// render eder; Vercel'in serverless (Linux) ortamında font bulunmadığından
// <text> görünmez (yazısız boş filigran). Path ise fonta ihtiyaç duymaz, her
// ortamda aynı çizilir. Yeniden üretmek için: scripts/gen-watermark-path.cjs.

// fontSize=100 ile üretilen path'in geometrisi (path koordinat birimi):
const WORDMARK_PATH =
  "M20.90-58.89L7.18-58.89L7.18-71.58L20.90-71.58L20.90-58.89M20.90 0L7.18 0L7.18-51.86L20.90-51.86L20.90 0M48.68 0L34.96 0L34.96-71.58L48.68-71.58L48.68 0M73-36.04L60.55-38.28Q62.65-45.80 67.77-49.41Q72.90-53.03 83.01-53.03Q92.19-53.03 96.68-50.85Q101.17-48.68 103-45.34Q104.83-41.99 104.83-33.06L104.69-17.04Q104.69-10.21 105.35-6.96Q106.01-3.71 107.81 0L94.24 0Q93.70-1.37 92.92-4.05Q92.58-5.27 92.43-5.66Q88.92-2.25 84.91-0.54Q80.91 1.17 76.37 1.17Q68.36 1.17 63.75-3.17Q59.13-7.52 59.13-14.16Q59.13-18.55 61.23-22Q63.33-25.44 67.11-27.27Q70.90-29.10 78.03-30.47Q87.65-32.28 91.36-33.84L91.36-35.21Q91.36-39.16 89.40-40.84Q87.45-42.53 82.03-42.53Q78.37-42.53 76.32-41.09Q74.27-39.65 73-36.04M91.36-22.17L91.36-24.90Q88.72-24.02 83.01-22.80Q77.29-21.58 75.54-20.41Q72.85-18.51 72.85-15.58Q72.85-12.70 75-10.60Q77.15-8.50 80.47-8.50Q84.18-8.50 87.55-10.94Q90.04-12.79 90.82-15.48Q91.36-17.24 91.36-22.17M165.53-32.23L165.53 0L151.81 0L151.81-26.46Q151.81-34.86 150.93-37.33Q150.05-39.79 148.07-41.16Q146.09-42.53 143.31-42.53Q139.75-42.53 136.91-40.58Q134.08-38.62 133.03-35.40Q131.98-32.18 131.98-23.49L131.98 0L118.26 0L118.26-51.86L131.01-51.86L131.01-44.24Q137.79-53.03 148.10-53.03Q152.64-53.03 156.40-51.39Q160.16-49.76 162.08-47.22Q164.01-44.68 164.77-41.46Q165.53-38.23 165.53-32.23M193.16 0L179.44 0L179.44-71.58L193.16-71.58L193.16 0M220.95-58.89L207.23-58.89L207.23-71.58L220.95-71.58L220.95-58.89M220.95 0L207.23 0L207.23-51.86L220.95-51.86L220.95 0M231.84-26.66Q231.84-33.50 235.21-39.89Q238.57-46.29 244.75-49.66Q250.93-53.03 258.54-53.03Q270.31-53.03 277.83-45.39Q285.35-37.74 285.35-26.07Q285.35-14.31 277.76-6.57Q270.17 1.17 258.64 1.17Q251.51 1.17 245.04-2.05Q238.57-5.27 235.21-11.50Q231.84-17.72 231.84-26.66M245.90-25.93Q245.90-18.21 249.56-14.11Q253.22-10.01 258.59-10.01Q263.96-10.01 267.60-14.11Q271.24-18.21 271.24-26.03Q271.24-33.64 267.60-37.74Q263.96-41.85 258.59-41.85Q253.22-41.85 249.56-37.74Q245.90-33.64 245.90-25.93M309.81 0L296.09 0L296.09-13.72L309.81-13.72L309.81 0M369.09-36.52L355.57-34.08Q354.88-38.13 352.47-40.19Q350.05-42.24 346.19-42.24Q341.06-42.24 338.01-38.70Q334.96-35.16 334.96-26.86Q334.96-17.63 338.06-13.82Q341.16-10.01 346.39-10.01Q350.29-10.01 352.78-12.23Q355.27-14.45 356.30-19.87L369.78-17.58Q367.68-8.30 361.72-3.56Q355.76 1.17 345.75 1.17Q334.38 1.17 327.61-6.01Q320.85-13.18 320.85-25.88Q320.85-38.72 327.64-45.87Q334.42-53.03 346-53.03Q355.47-53.03 361.06-48.95Q366.65-44.87 369.09-36.52M376.32-26.66Q376.32-33.50 379.69-39.89Q383.06-46.29 389.23-49.66Q395.41-53.03 403.03-53.03Q414.79-53.03 422.31-45.39Q429.83-37.74 429.83-26.07Q429.83-14.31 422.24-6.57Q414.65 1.17 403.13 1.17Q396 1.17 389.53-2.05Q383.06-5.27 379.69-11.50Q376.32-17.72 376.32-26.66M390.38-25.93Q390.38-18.21 394.04-14.11Q397.71-10.01 403.08-10.01Q408.45-10.01 412.08-14.11Q415.72-18.21 415.72-26.03Q415.72-33.64 412.08-37.74Q408.45-41.85 403.08-41.85Q397.71-41.85 394.04-37.74Q390.38-33.64 390.38-25.93M439.55 0L439.55-51.86L452.20-51.86L452.20-44.78Q458.98-53.03 468.36-53.03Q473.34-53.03 477-50.98Q480.66-48.93 483.01-44.78Q486.43-48.93 490.38-50.98Q494.34-53.03 498.83-53.03Q504.54-53.03 508.50-50.71Q512.45-48.39 514.40-43.90Q515.82-40.58 515.82-33.15L515.82 0L502.10 0L502.10-29.64Q502.10-37.35 500.68-39.60Q498.78-42.53 494.82-42.53Q491.94-42.53 489.40-40.77Q486.87-39.01 485.74-35.62Q484.62-32.23 484.62-24.90L484.62 0L470.90 0L470.90-28.42Q470.90-35.99 470.17-38.18Q469.43-40.38 467.90-41.46Q466.36-42.53 463.72-42.53Q460.55-42.53 458.01-40.82Q455.47-39.11 454.37-35.89Q453.27-32.67 453.27-25.20L453.27 0";
const WORDMARK_WIDTH = 508.643;   // path bbox genişliği
const WORDMARK_CX = 261.499;     // path bbox merkez X
const WORDMARK_CY = -35.205;     // path bbox merkez Y

// Filigranın görselin ne kadar enini kaplayacağı (~%45, eski <text> görünümüne
// yakın). Ortada ~32 derece çapraz, yarı saydam, hafif gölgeli tek katman.
const COVERAGE = 0.45;
const ANGLE = -32;

function buildWatermarkSvg(width: number, height: number): string {
  const scale = (width * COVERAGE) / WORDMARK_WIDTH;
  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="wmShadow" x="-10%" y="-60%" width="120%" height="220%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#000000" flood-opacity="0.45" />
    </filter>
  </defs>
  <g transform="translate(${width / 2} ${height / 2}) rotate(${ANGLE}) scale(${scale}) translate(${-WORDMARK_CX} ${-WORDMARK_CY})">
    <path d="${WORDMARK_PATH}" fill="#ffffff" fill-opacity="0.30" filter="url(#wmShadow)" />
  </g>
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
