import { selectableCategories } from "./categories";

// "Fotoğraftan yapay zeka ile ilan doldurma" özelliği. Kullanıcı /ilan-ver
// akışında fotoğraf yükledikten sonra (OPSİYONEL) bir butona basarsa, yüklenen
// görsel(ler) Google Gemini'ye gönderilir ve ilan başlığı, kategori, açıklama,
// durum, marka/model ve tahmini fiyat aralığı ÖNERİLİR. Öneriler forma dolar,
// kullanıcı düzenleyebilir.
//
// ÖNEMLİ: Bu sistem, mevcut Anthropic tabanlı "güven puanı / ekspertiz"
// analizinden (ai-analysis.ts) TAMAMEN bağımsızdır; ayrı API anahtarı
// (GEMINI_API_KEY), ayrı limit tablosu (GeminiFillLog) ve ayrı kod yolu
// kullanır. API çağrısı yalnızca sunucu tarafında yapılır; GEMINI_API_KEY asla
// client'a sızdırılmaz.

// Ücretsiz katmanı olan, görseli destekleyen hafif/ucuz model varsayılan
// alınır; gerekirse .env'den GEMINI_MODEL ile değiştirilebilir. Not:
// gemini-1.5-* modelleri yeni API anahtarları için kaldırıldı (404 döner),
// bu yüzden güncel kuşak 2.5-flash kullanılır.
const DEFAULT_MODEL = "gemini-2.5-flash";
const MAX_ATTEMPTS = 2;

export type GeminiFillImage = {
  data: string; // base64 (data: öneki olmadan)
  mimeType: string; // örn. "image/jpeg"
};

export type GeminiFillSuggestion = {
  title: string | null;
  categorySlug: string | null;
  description: string | null;
  condition: "Sıfır" | "İkinci El" | null;
  brand: string | null;
  model: string | null;
  features: string[];
  priceMin: number | null;
  priceMax: number | null;
  // Öneriler (özellikle fiyat ve marka/model) net değil, tahmini ise true.
  // Arayüz bunu "tahmin" rozetiyle gösterir, kullanıcı mutlaka kontrol etmeli.
  isEstimate: boolean;
  note: string | null; // kısa Türkçe uyarı/açıklama notu (opsiyonel)
};

export type GeminiFillOutcome =
  | { ok: true; suggestion: GeminiFillSuggestion }
  | { ok: false; error: string };

// Modelin seçebileceği kategoriler: ilan verilebilen yaprak kategoriler
// (Vasıta/Emlak kapalıyken otomatik hariç). "slug → tam yol" satırları olarak
// prompt'a verilir, model SADECE bu slug'lardan birini döndürmeli.
function buildCategoryLines(): string {
  return selectableCategories()
    .map((c) => `${c.slug} = ${c.breadcrumb.join(" > ")}`)
    .join("\n");
}

function buildPrompt(selectedCategoryName: string | null): string {
  return `Sen, Türkiye'de kullanılan bir ikinci el/sıfır ürün ilan platformunun yapay zeka asistanısın. Sana bir ürünün bir veya birden fazla fotoğrafı veriliyor. Görevin, bu fotoğraflardan yola çıkarak satıcının ilanını doldurmasına yardımcı olacak ÖNERİLER üretmek.

Çıktın HER ZAMAN ve SADECE aşağıdaki JSON şemasında olmalı. JSON dışında hiçbir metin, açıklama veya Markdown kod bloğu işareti üretme.

KURALLAR:
- Tüm metinler Türkçe, sade ve doğal olmalı.
- "title": Kısa, açıklayıcı, alıcının arayacağı türden bir ilan başlığı (en fazla 70 karakter). Marka/modelden eminsen başlığa kat.
- "categorySlug": Ürünü en iyi anlatan kategoriyi AŞAĞIDAKİ LİSTEDEN seç ve SADECE eşittirin solundaki slug değerini yaz. Listede olmayan bir slug ASLA uydurma. Emin değilsen en yakın genel kategoriyi seç.
- "description": 2-4 cümlelik, ürünün fotoğraftan görünen özelliklerini anlatan bir açıklama. Fotoğrafta görünmeyen şeyleri (kullanım süresi, garanti, kusur) UYDURMA; bunları satıcının eklemesi için "..." gibi boşluk bırakma, sadece görüneni yaz.
- "condition": Yalnızca "Sıfır" veya "İkinci El" olabilir; fotoğraftan net anlaşılmıyorsa null.
- "brand" ve "model": Fotoğraftan (logo, etiket, ürün şekli) EMİN OLDUĞUN markayı/modeli yaz. Emin değilsen UYDURMA, null bırak.
- "features": Fotoğraftan görünen 0-6 adet kısa öne çıkan özellik (örn. "Orijinal kutusu var", "Paslanmaz çelik", "256 GB"). Görünmüyorsa boş dizi.
- "priceMin"/"priceMax": Türk Lirası (TL) cinsinden makul bir TAHMİNİ ikinci el fiyat aralığı. Hiçbir fikrin yoksa ikisi de null.
- "isEstimate": Fiyat, marka veya model gibi alanlardan herhangi biri tahmin/belirsizse true yap. Kullanıcıya "bunları kontrol et" demek için kullanılır.
- "note": İstersen kullanıcıya tek cümlelik kısa bir uyarı (örn. "Fiyat tahminidir, kontrol edin."). Gerek yoksa null.
- Fotoğraf bir ürün göstermiyorsa (boş, alakasız, okunamaz) tüm alanları null/boş bırak ve note'a kısa bir açıklama yaz.

${selectedCategoryName ? `Satıcı ürünü şu an "${selectedCategoryName}" kategorisinde açıyor; fotoğrafla çelişmiyorsa buna uygun bir slug seçmen tercih edilir.\n\n` : ""}SEÇİLEBİLİR KATEGORİLER (slug = tam yol):
${buildCategoryLines()}

ÇIKTI ŞEMASI:
{
  "title": "<metin|null>",
  "categorySlug": "<yukarıdaki listeden bir slug|null>",
  "description": "<metin|null>",
  "condition": "Sıfır" | "İkinci El" | null,
  "brand": "<metin|null>",
  "model": "<metin|null>",
  "features": ["<metin>"],
  "priceMin": <sayı|null>,
  "priceMax": <sayı|null>,
  "isEstimate": <true|false>,
  "note": "<metin|null>"
}`;
}

// Model "Markdown kod bloğu üretme" talimatına bazen uymayabilir; ```json ... ```
// sarmalını JSON.parse'tan önce temizle (ai-analysis.ts ile aynı yaklaşım).
function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

const VALID_CATEGORY_SLUGS = new Set(selectableCategories().map((c) => c.slug));

function toNumberOrNull(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value.replace(/[^\d.]/g, "")) : value;
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

function toTextOrNull(value: unknown, maxLen: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
}

// Modelin döndürdüğü ham JSON'u, arayüzün güvenle kullanabileceği temiz bir
// öneri nesnesine çevirir: geçersiz/uydurma kategori slug'ı atılır, durum iki
// geçerli değerle sınırlanır, fiyatlar sayıya zorlanır.
function normalizeSuggestion(raw: unknown): GeminiFillSuggestion {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  const categorySlug = toTextOrNull(obj.categorySlug, 80);
  const condition =
    obj.condition === "Sıfır" || obj.condition === "İkinci El" ? obj.condition : null;

  const features = Array.isArray(obj.features)
    ? obj.features
        .filter((f): f is string => typeof f === "string" && f.trim().length > 0)
        .slice(0, 6)
        .map((f) => f.trim().slice(0, 60))
    : [];

  return {
    title: toTextOrNull(obj.title, 70),
    categorySlug: categorySlug && VALID_CATEGORY_SLUGS.has(categorySlug) ? categorySlug : null,
    description: toTextOrNull(obj.description, 1200),
    condition,
    brand: toTextOrNull(obj.brand, 60),
    model: toTextOrNull(obj.model, 80),
    features,
    priceMin: toNumberOrNull(obj.priceMin),
    priceMax: toNumberOrNull(obj.priceMax),
    isEstimate: obj.isEstimate === true,
    note: toTextOrNull(obj.note, 200),
  };
}

export async function runGeminiFill(
  images: GeminiFillImage[],
  selectedCategoryName: string | null,
): Promise<GeminiFillOutcome> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY tanımlı değil, yapay zeka doldurma atlanıyor.");
    return { ok: false, error: "Yapay zeka şu an kullanılamıyor." };
  }
  if (images.length === 0) {
    return { ok: false, error: "Önce en az bir fotoğraf yükleyin." };
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const prompt = buildPrompt(selectedCategoryName);

  const parts = [
    { text: prompt },
    ...images.map((img) => ({ inline_data: { mime_type: img.mimeType, data: img.data } })),
  ];

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
        }),
      });

      if (!response.ok) {
        console.error(`Gemini doldurma denemesi ${attempt}: API ${response.status} döndü.`);
        // 429 (kota) gibi durumlarda tekrar denemek anlamsız; çık.
        if (response.status === 429 || response.status === 403) {
          return { ok: false, error: "Yapay zeka şu an yoğun. Lütfen bilgileri elle doldurun." };
        }
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text !== "string") {
        console.error(`Gemini doldurma denemesi ${attempt}: yanıtta metin bulunamadı.`);
        continue;
      }

      const parsed = JSON.parse(extractJson(text));
      return { ok: true, suggestion: normalizeSuggestion(parsed) };
    } catch (err) {
      console.error(`Gemini doldurma denemesi ${attempt} başarısız:`, err);
    }
  }

  return { ok: false, error: "Yapay zeka şu an yanıt veremedi. Lütfen bilgileri elle doldurun." };
}
