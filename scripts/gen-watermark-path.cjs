// "ilanlio.com" filigran wordmark'ını VEKTÖR PATH olarak üretir ve elde edilen
// `d` + geometriyi src/lib/watermark.ts içine gömmek için ekrana basar.
//
// Neden? sharp/librsvg SVG <text> öğesini sistem fontuyla render eder; Vercel'in
// serverless (Linux) ortamında font bulunmadığından <text> görünmez. Path ise
// fonta ihtiyaç duymaz. Bu script'i yalnız wordmark'ı/fontu değiştirmek
// gerekirse (geliştirici makinesinde, font dosyası mevcutken) çalıştırın:
//
//   npm install --no-save opentype.js
//   node scripts/gen-watermark-path.cjs
//
// Çıktıdaki WORDMARK_PATH / WORDMARK_WIDTH / WORDMARK_CX / WORDMARK_CY
// değerlerini src/lib/watermark.ts içindeki sabitlere kopyalayın.

const fs = require("fs");
const opentype = require("opentype.js");

// Bold daha okunaklı bir filigran verir. Linux/mac'te farklı bir yol gerekebilir.
const FONT_PATH = process.env.WM_FONT || "C:/Windows/Fonts/arialbd.ttf";
const TEXT = "ilanlio.com";
const FONT_SIZE = 100; // referans; watermark.ts içinde transform ile ölçeklenir

const font = opentype.parse(fs.readFileSync(FONT_PATH).buffer);
const p = font.getPath(TEXT, 0, 0, FONT_SIZE);
const d = p.toPathData(2);
const bb = p.getBoundingBox();

const out = {
  text: TEXT,
  fontSize: FONT_SIZE,
  WORDMARK_WIDTH: Number((bb.x2 - bb.x1).toFixed(3)),
  WORDMARK_CX: Number(((bb.x1 + bb.x2) / 2).toFixed(3)),
  WORDMARK_CY: Number(((bb.y1 + bb.y2) / 2).toFixed(3)),
  WORDMARK_PATH: d,
};
console.log(JSON.stringify(out, null, 2));
