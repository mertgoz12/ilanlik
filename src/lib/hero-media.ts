// Banner/slider medyasının türünü URL uzantısından tespit eder. Saf yardımcı,
// harici bağımlılığı yok; bu yüzden hem sunucu (RSC, server action) hem de
// istemci (hero-slider) tarafında güvenle import edilebilir.
//
// Slayt "imageUrl" alanı artık görselin yanında GIF ve kısa video da
// tutabiliyor (otomatik oynayan, sürekli başa saran hareketli banner'lar).

const VIDEO_EXTENSIONS = [".mp4", ".webm"];

function cleanPath(url: string): string {
  // Sorgu parametrelerini at, uzantıyı küçük harfe çevir.
  return url.split("?")[0].toLowerCase();
}

export function isHeroVideo(url: string): boolean {
  const clean = cleanPath(url);
  return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

// GIF, <Image> ile optimize edilince animasyonunu kaybeder; bunu işaretleyip
// `unoptimized` ile gösteriyoruz ki hareketi korunsun.
export function isHeroGif(url: string): boolean {
  return cleanPath(url).endsWith(".gif");
}
