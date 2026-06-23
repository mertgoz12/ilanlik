// Bu dosya bilinçli olarak prisma/sunucu-only bağımlılık İÇERMEZ - admin
// editör formu (client component) slugify/BLOG_CATEGORIES'i doğrudan
// kullanabilsin diye sorgu fonksiyonları (bkz. blog.ts) buradan ayrı tutulur.

// Sahibinden tarzı sabit içerik kategorileri - ilan kategori ağacından
// (categories.ts) tamamen bağımsızdır, sadece blog yazılarını etiketlemek içindir.
export const BLOG_CATEGORIES = [
  "Güvenli Alışveriş",
  "İpuçları",
  "Rehberler",
  "Kategori Tavsiyeleri",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export function isValidBlogCategory(value: string): value is BlogCategory {
  return (BLOG_CATEGORIES as readonly string[]).includes(value);
}

// Türkçe karakterleri ASCII'ye çevirip URL-güvenli bir slug üretir (örn.
// "İkinci El Alışverişte 5 Kural" -> "ikinci-el-alisveriste-5-kural").
export function slugify(value: string): string {
  const map: Record<string, string> = {
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
    ı: "i",
    İ: "i",
    ö: "o",
    Ö: "o",
    ş: "s",
    Ş: "s",
    ü: "u",
    Ü: "u",
  };
  return value
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => map[ch] ?? ch)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Ortalama okuma hızı (dk başına kelime) - kapak/başlık hariç içerik
// uzunluğundan kabaca okuma süresi tahmini.
const WORDS_PER_MINUTE = 200;

export function estimateReadingMinutes(content: string): number {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}
