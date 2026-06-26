export type CategoryNode = {
  name: string;
  slug: string;
  children?: CategoryNode[];
};

export const VASITA_SLUG = "vasita";
export const EMLAK_SLUG = "emlak";

// İlk yayın sürümünde Vasıta ve Emlak ilan girişine kapalı tutulur ("çok
// yakında"); ilgili tüm kod (araç şeması, katalog, EKS hazırlığı) silinmeden
// bu bayrakla saklanır. Açmak için .env dosyasına ARAC_EMLAK_AKTIF=true ekleyin.
export function isVasitaEmlakActive(): boolean {
  return process.env.ARAC_EMLAK_AKTIF === "true";
}

export const COMING_SOON_SLUGS = [VASITA_SLUG, EMLAK_SLUG];

// Verilen slug (üst kategori veya alt kategori), kapalı tutulan Vasıta/Emlak
// ağaçlarının bir parçasıysa true döner - bayrak açıldığında otomatik olarak
// false döner.
export function isComingSoonSlug(slug: string): boolean {
  if (isVasitaEmlakActive()) return false;
  const path = findCategoryPath(slug);
  if (!path || path.length === 0) return false;
  return COMING_SOON_SLUGS.includes(path[0].slug);
}

export const CATEGORY_TREE: CategoryNode[] = [
  {
    name: "Emlak",
    slug: "emlak",
    children: [
      { name: "Konut", slug: "konut" },
      { name: "İş Yeri", slug: "is-yeri" },
      { name: "Arsa", slug: "arsa" },
      { name: "Konut Projeleri", slug: "konut-projeleri" },
      { name: "Bina", slug: "bina" },
      { name: "Devre Mülk", slug: "devre-mulk" },
      { name: "Turistik Tesis", slug: "turistik-tesis" },
    ],
  },
  {
    name: "Vasıta",
    slug: VASITA_SLUG,
    children: [
      { name: "Otomobil", slug: "otomobil" },
      { name: "Arazi, SUV & Pickup", slug: "arazi-suv-pickup" },
      { name: "Elektrikli Araçlar", slug: "elektrikli-araclar" },
      { name: "Motosiklet", slug: "motosiklet" },
      { name: "Minivan & Panelvan", slug: "minivan-panelvan" },
      { name: "Ticari Araçlar", slug: "ticari-araclar" },
      { name: "Deniz Araçları", slug: "deniz-araclari" },
      { name: "Hasarlı Araçlar", slug: "hasarli-araclar" },
    ],
  },
  {
    name: "Yedek Parça, Aksesuar, Donanım & Tuning",
    slug: "yedek-parca-aksesuar-donanim-tuning",
    children: [
      { name: "Otomotiv Ekipmanları", slug: "otomotiv-ekipmanlari" },
      { name: "Motosiklet Ekipmanları", slug: "motosiklet-ekipmanlari" },
      { name: "Deniz Araçları Ekipmanları", slug: "deniz-araclari-ekipmanlari" },
    ],
  },
  {
    name: "İkinci El ve Sıfır Alışveriş",
    slug: "ikinci-el-ve-sifir-alisveris",
    children: [
      { name: "Bilgisayar", slug: "bilgisayar" },
      {
        name: "Cep Telefonu & Aksesuar",
        slug: "cep-telefonu",
        children: [
          { name: "Cep Telefonu", slug: "cep-telefonu-cihaz" },
          { name: "Tablet", slug: "tablet" },
          { name: "Akıllı Saat & Bileklik", slug: "akilli-saat-bileklik" },
          { name: "Telefon Aksesuarları", slug: "telefon-aksesuarlari" },
        ],
      },
      { name: "Fotoğraf & Kamera", slug: "fotograf-kamera" },
      {
        name: "Ev Dekorasyon",
        slug: "ev-dekorasyon",
        children: [
          {
            name: "Mobilya",
            slug: "mobilya",
            children: [
              { name: "Koltuk & Kanepe", slug: "koltuk-kanepe" },
              { name: "Masa & Sandalye", slug: "masa-sandalye" },
              { name: "Yatak Odası", slug: "yatak-odasi" },
              { name: "Dolap & Vestiyer", slug: "dolap-vestiyer" },
              { name: "Diğer Mobilya", slug: "diger-mobilya" },
            ],
          },
          { name: "Aydınlatma", slug: "aydinlatma" },
          { name: "Halı & Kilim", slug: "hali-kilim" },
          { name: "Ev Tekstili", slug: "ev-tekstili" },
          { name: "Dekoratif Aksesuar & Süs Eşyası", slug: "dekoratif-aksesuar" },
          { name: "Mutfak Gereçleri", slug: "mutfak-gerecleri" },
        ],
      },
      { name: "Ev Elektroniği", slug: "ev-elektronigi" },
      { name: "Elektrikli Ev Aletleri", slug: "elektrikli-ev-aletleri" },
      {
        name: "Giyim & Aksesuar",
        slug: "giyim-aksesuar",
        children: [
          { name: "Kadın Giyim", slug: "kadin-giyim" },
          { name: "Erkek Giyim", slug: "erkek-giyim" },
          { name: "Ayakkabı", slug: "ayakkabi" },
          { name: "Çanta", slug: "canta" },
          { name: "Aksesuar", slug: "giyim-aksesuar-diger" },
        ],
      },
      { name: "Saat", slug: "saat" },
      { name: "Anne & Bebek", slug: "anne-bebek" },
      { name: "Kişisel Bakım & Kozmetik", slug: "kisisel-bakim-kozmetik" },
      { name: "Hobi & Oyuncak", slug: "hobi-oyuncak" },
      { name: "Oyuncu Ekipmanları", slug: "oyuncu-ekipmanlari" },
      { name: "Kitap, Dergi & Film", slug: "kitap-dergi-film" },
      { name: "Müzik", slug: "muzik" },
      { name: "Antika", slug: "antika" },
      { name: "Bahçe & Yapı Market", slug: "bahce-yapi-market" },
      { name: "Teknik Elektronik", slug: "teknik-elektronik" },
      { name: "Ofis & Kırtasiye", slug: "ofis-kirtasiye" },
      { name: "Spor", slug: "spor" },
      { name: "Diğer", slug: "diger" },
    ],
  },
  {
    name: "İş Makineleri & Sanayi",
    slug: "is-makineleri-sanayi",
    children: [
      { name: "İş Makineleri", slug: "is-makineleri" },
      { name: "Tarım Makineleri", slug: "tarim-makineleri" },
      { name: "Sanayi", slug: "sanayi" },
      { name: "Elektrik & Enerji", slug: "elektrik-enerji" },
    ],
  },
  {
    name: "Ustalar ve Hizmetler",
    slug: "ustalar-ve-hizmetler",
    children: [
      { name: "İç Tadilat & Dekorasyon", slug: "ic-tadilat-dekorasyon" },
      { name: "Nakliye", slug: "nakliye" },
      { name: "Araç Servis & Bakım", slug: "arac-servis-bakim" },
    ],
  },
  {
    name: "Özel Ders Verenler",
    slug: "ozel-ders-verenler",
    children: [
      { name: "Lise & Üniversite", slug: "lise-universite" },
      { name: "İlkokul & Ortaokul", slug: "ilkokul-ortaokul" },
      { name: "Yabancı Dil", slug: "yabanci-dil" },
    ],
  },
  {
    name: "İş İlanları",
    slug: "is-ilanlari",
    children: [
      { name: "Eğitim", slug: "egitim" },
      { name: "Sağlık", slug: "saglik" },
      { name: "Güzellik & Bakım", slug: "guzellik-bakim" },
      { name: "IT & Yazılım", slug: "it-yazilim" },
      { name: "Bilişim", slug: "bilisim" },
      { name: "İnsan Kaynakları", slug: "insan-kaynaklari" },
    ],
  },
  { name: "Yardımcı Arayanlar", slug: "yardimci-arayanlar" },
  {
    name: "Hayvanlar Alemi",
    slug: "hayvanlar-alemi",
    children: [
      { name: "Aksesuar & Ekipman", slug: "hayvan-aksesuar-ekipman" },
      { name: "Yem & Mama", slug: "yem-mama" },
      { name: "Evcil Hayvanlar", slug: "evcil-hayvanlar" },
      { name: "Çiftlik Hayvanları", slug: "ciftlik-hayvanlari" },
      { name: "Büyükbaş", slug: "buyukbas" },
      { name: "Küçükbaş", slug: "kucukbas" },
      { name: "Deniz Canlıları", slug: "deniz-canlilari" },
    ],
  },
];

export function findCategory(
  slug: string,
  nodes: CategoryNode[] = CATEGORY_TREE,
): CategoryNode | null {
  for (const node of nodes) {
    if (node.slug === slug) return node;
    if (node.children) {
      const found = findCategory(slug, node.children);
      if (found) return found;
    }
  }
  return null;
}

export function findCategoryPath(
  slug: string,
  nodes: CategoryNode[] = CATEGORY_TREE,
  path: CategoryNode[] = [],
): CategoryNode[] | null {
  for (const node of nodes) {
    const nextPath = [...path, node];
    if (node.slug === slug) return nextPath;
    if (node.children) {
      const found = findCategoryPath(slug, node.children, nextPath);
      if (found) return found;
    }
  }
  return null;
}

export function collectSlugs(node: CategoryNode): string[] {
  return [node.slug, ...(node.children?.flatMap(collectSlugs) ?? [])];
}

export function isVasitaSlug(slug: string): boolean {
  const path = findCategoryPath(slug);
  return !!path && path[0]?.slug === VASITA_SLUG;
}

export type SelectableCategory = {
  slug: string;
  name: string;
  groupName: string;
  /** Kökten bu yaprağa kadar tüm ad'lar (breadcrumb) - örn. ["İkinci El ve
   * Sıfır Alışveriş", "Ev Dekorasyon", "Mobilya", "Koltuk & Kanepe"]. */
  breadcrumb: string[];
  isVasita: boolean;
};

// Bir ilanın atanabileceği KESİN yaprak kategoriler (hiç alt kategorisi
// olmayanlar) - ağaç kaç seviye derinse de aynı şekilde çalışır, sadece
// önceki sürümdeki 2 seviye varsayımı kaldırıldı. Vasıta ve Emlak,
// ARAC_EMLAK_AKTIF açılana kadar bu listeden (ve dolayısıyla ilan verme
// formundan) tamamen çıkarılır - "çok yakında" mesajı menüde ayrıca
// gösterilir (bkz. CategorySidebar, Footer).
function collectLeaves(
  node: CategoryNode,
  ancestors: CategoryNode[],
  isVasita: boolean,
  result: SelectableCategory[],
): void {
  const path = [...ancestors, node];
  if (!node.children || node.children.length === 0) {
    result.push({
      slug: node.slug,
      name: node.name,
      groupName: path[path.length - 2]?.name ?? node.name,
      breadcrumb: path.map((n) => n.name),
      isVasita,
    });
    return;
  }
  for (const child of node.children) {
    collectLeaves(child, path, isVasita, result);
  }
}

export function selectableCategories(): SelectableCategory[] {
  const result: SelectableCategory[] = [];
  for (const node of CATEGORY_TREE) {
    if (COMING_SOON_SLUGS.includes(node.slug) && !isVasitaEmlakActive()) continue;
    collectLeaves(node, [], node.slug === VASITA_SLUG, result);
  }
  return result;
}

// "İ"/"ı" gibi Türkçe harflerin İngilizce/ASCII küçültme kurallarıyla yanlış
// eşleşmesini önlemek için locale'e duyarlı küçültme kullanılır (bkz. arama
// kutusu otomatik tamamlama - searchSelectableCategories).
function turkishLower(value: string): string {
  return value.toLocaleLowerCase("tr-TR");
}

/** Arama kutusu otomatik tamamlama için: yazılan kelimeyle adı eşleşen
 * (Vasıta/Emlak "çok yakında" kapalıyken hariç tutulan) seçilebilir
 * kategoriler. */
export function searchSelectableCategories(query: string, limit = 5): SelectableCategory[] {
  const normalizedQuery = turkishLower(query.trim());
  if (!normalizedQuery) return [];
  const matches: SelectableCategory[] = [];
  for (const category of selectableCategories()) {
    if (turkishLower(category.name).includes(normalizedQuery)) {
      matches.push(category);
      if (matches.length >= limit) break;
    }
  }
  return matches;
}
