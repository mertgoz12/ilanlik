// İlan no'sundan deterministik çekiliş numarası üretir.
// Aynı listingNo her zaman aynı numarayı verir, Math.random() kullanılmaz.
export function toRaffleNo(listingNo: string): string {
  let h = 5381;
  for (let i = 0; i < listingNo.length; i++) {
    h = ((h << 5) + h + listingNo.charCodeAt(i)) & 0x7fffffff;
  }
  return `İLN-${String(Math.abs(h)).padStart(7, "0").slice(-7)}`;
}
