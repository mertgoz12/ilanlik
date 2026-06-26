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
    name: "Elektronik",
    slug: "elektronik",
    children: [
      {
        name: "Telefon",
        slug: "telefon",
        children: [
          { name: "Cep Telefonu", slug: "cep-telefonu" },
          { name: "Tablet", slug: "tablet" },
          { name: "Akıllı Saat & Bileklik", slug: "akilli-saat-bileklik" },
          {
            name: "Telefon Aksesuarları",
            slug: "telefon-aksesuarlari",
            children: [
              { name: "Kılıf & Kapak", slug: "telefon-kilif" },
              { name: "Şarj Aleti & Kablo", slug: "telefon-sarj-kablo" },
              { name: "Kulaklık", slug: "telefon-kulaklik" },
              { name: "Powerbank", slug: "powerbank" },
              { name: "Ekran Koruyucu", slug: "ekran-koruyucu" },
            ],
          },
        ],
      },
      {
        name: "Bilgisayar",
        slug: "bilgisayar",
        children: [
          { name: "Dizüstü Bilgisayar", slug: "dizustu-bilgisayar" },
          { name: "Masaüstü Bilgisayar", slug: "masaustu-bilgisayar" },
          {
            name: "Bilgisayar Bileşenleri",
            slug: "bilgisayar-bilesenleri",
            children: [
              { name: "Ekran Kartı", slug: "ekran-karti" },
              { name: "İşlemci", slug: "islemci" },
              { name: "RAM (Bellek)", slug: "ram" },
              { name: "SSD & Hard Disk", slug: "ssd-harddisk" },
              { name: "Anakart", slug: "anakart" },
              { name: "Güç Kaynağı", slug: "guc-kaynagi" },
            ],
          },
          { name: "Monitör", slug: "monitor" },
          { name: "Klavye & Mouse", slug: "klavye-mouse" },
          { name: "Yazıcı & Tarayıcı", slug: "yazici-tarayici" },
          { name: "Ağ Ürünleri (Modem/Router)", slug: "ag-urunleri" },
        ],
      },
      {
        name: "TV, Ses & Görüntü",
        slug: "tv-ses-goruntu",
        children: [
          { name: "Televizyon", slug: "televizyon" },
          { name: "Ev Elektroniği", slug: "ev-elektronigi" },
          { name: "Hoparlör & Ses Sistemi", slug: "hoparlor-ses-sistemi" },
          { name: "Kulaklık", slug: "kulaklik" },
          { name: "Projeksiyon", slug: "projeksiyon" },
        ],
      },
      {
        name: "Fotoğraf & Kamera",
        slug: "fotograf-kamera",
        children: [
          { name: "Fotoğraf Makinesi", slug: "fotograf-makinesi" },
          { name: "Lens", slug: "lens" },
          { name: "Aksiyon Kamera", slug: "aksiyon-kamera" },
          { name: "Drone", slug: "drone" },
        ],
      },
    ],
  },
  {
    name: "Ev & Yaşam",
    slug: "ev-yasam",
    children: [
      {
        name: "Mobilya",
        slug: "mobilya",
        children: [
          { name: "Koltuk & Kanepe", slug: "koltuk-kanepe" },
          { name: "Masa & Sandalye", slug: "masa-sandalye" },
          { name: "Yatak Odası", slug: "yatak-odasi" },
          { name: "Dolap & Vestiyer", slug: "dolap-vestiyer" },
          { name: "TV Ünitesi", slug: "tv-unitesi" },
          { name: "Bahçe Mobilyası", slug: "bahce-mobilyasi" },
          { name: "Diğer Mobilya", slug: "diger-mobilya" },
        ],
      },
      {
        name: "Beyaz Eşya",
        slug: "beyaz-esya",
        children: [
          { name: "Buzdolabı", slug: "buzdolabi" },
          { name: "Çamaşır Makinesi", slug: "camasir-makinesi" },
          { name: "Bulaşık Makinesi", slug: "bulasik-makinesi" },
          { name: "Fırın & Ocak", slug: "firin-ocak" },
          { name: "Kurutma Makinesi", slug: "kurutma-makinesi" },
          { name: "Klima", slug: "klima" },
        ],
      },
      {
        name: "Küçük Ev Aletleri",
        slug: "kucuk-ev-aletleri",
        children: [
          { name: "Elektrikli Süpürge", slug: "elektrikli-supurge" },
          { name: "Ütü", slug: "utu" },
          { name: "Blender & Mutfak Robotu", slug: "blender-mutfak-robotu" },
          { name: "Kahve Makinesi", slug: "kahve-makinesi" },
          { name: "Su Isıtıcı & Çay Makinesi", slug: "su-isitici-cayci" },
          { name: "Tost & Izgara Makinesi", slug: "tost-izgara" },
        ],
      },
      {
        name: "Dekorasyon",
        slug: "dekorasyon",
        children: [
          { name: "Dekoratif Aksesuar & Süs Eşyası", slug: "dekoratif-aksesuar" },
          { name: "Tablo & Çerçeve", slug: "tablo-cerceve" },
          { name: "Vazo & Saksı", slug: "vazo-saksi" },
          { name: "Ayna", slug: "ayna" },
        ],
      },
      { name: "Aydınlatma", slug: "aydinlatma" },
      { name: "Halı & Kilim", slug: "hali-kilim" },
      {
        name: "Ev Tekstili",
        slug: "ev-tekstili",
        children: [
          { name: "Perde", slug: "perde" },
          { name: "Nevresim & Yatak Örtüsü", slug: "nevresim" },
          { name: "Havlu & Bornoz", slug: "havlu-bornoz" },
        ],
      },
      {
        name: "Mutfak Gereçleri",
        slug: "mutfak-gerecleri",
        children: [
          { name: "Tencere & Tava", slug: "tencere-tava" },
          { name: "Sofra & Servis", slug: "sofra-servis" },
          { name: "Saklama Kabı", slug: "saklama-kabi" },
        ],
      },
    ],
  },
  {
    name: "Moda & Giyim",
    slug: "giyim-aksesuar",
    children: [
      {
        name: "Kadın Giyim",
        slug: "kadin-giyim",
        children: [
          { name: "Elbise", slug: "kadin-elbise" },
          { name: "Üst Giyim", slug: "kadin-ust-giyim" },
          { name: "Alt Giyim", slug: "kadin-alt-giyim" },
          { name: "Dış Giyim", slug: "kadin-dis-giyim" },
          { name: "İç Giyim & Pijama", slug: "kadin-ic-giyim" },
        ],
      },
      {
        name: "Erkek Giyim",
        slug: "erkek-giyim",
        children: [
          { name: "Üst Giyim", slug: "erkek-ust-giyim" },
          { name: "Alt Giyim", slug: "erkek-alt-giyim" },
          { name: "Dış Giyim", slug: "erkek-dis-giyim" },
          { name: "Takım Elbise", slug: "takim-elbise" },
        ],
      },
      { name: "Çocuk Giyim", slug: "cocuk-giyim" },
      {
        name: "Ayakkabı",
        slug: "ayakkabi",
        children: [
          { name: "Kadın Ayakkabı", slug: "kadin-ayakkabi" },
          { name: "Erkek Ayakkabı", slug: "erkek-ayakkabi" },
          { name: "Spor Ayakkabı", slug: "spor-ayakkabi" },
        ],
      },
      { name: "Çanta", slug: "canta" },
      { name: "Saat", slug: "saat" },
      { name: "Takı & Mücevher", slug: "taki-mucevher" },
      { name: "Gözlük", slug: "gozluk" },
      { name: "Aksesuar", slug: "giyim-aksesuar-diger" },
    ],
  },
  {
    name: "Anne & Bebek",
    slug: "anne-bebek",
    children: [
      { name: "Bebek Arabası", slug: "bebek-arabasi" },
      { name: "Bebek Giyim", slug: "bebek-giyim" },
      { name: "Bebek Oyuncak", slug: "bebek-oyuncak" },
      { name: "Bebek Bakım & Beslenme", slug: "bebek-bakim" },
      { name: "Bebek Odası & Mobilya", slug: "bebek-odasi" },
      { name: "Oto Koltuğu", slug: "oto-koltugu" },
    ],
  },
  {
    name: "Spor & Outdoor",
    slug: "spor",
    children: [
      { name: "Fitness & Kondisyon", slug: "fitness-kondisyon" },
      { name: "Bisiklet", slug: "bisiklet" },
      { name: "Kamp & Doğa", slug: "kamp-doga" },
      { name: "Spor Giyim", slug: "spor-giyim" },
      { name: "Scooter & Paten", slug: "scooter-paten" },
      { name: "Su Sporları", slug: "su-sporlari" },
      { name: "Takım Sporları", slug: "takim-sporlari" },
    ],
  },
  {
    name: "Hobi & Eğlence",
    slug: "hobi-oyuncak",
    children: [
      {
        name: "Konsol & Oyun",
        slug: "konsol-oyun",
        children: [
          { name: "Oyun Konsolu", slug: "oyun-konsolu" },
          { name: "Konsol Oyunları", slug: "konsol-oyunlari" },
          { name: "Oyuncu Ekipmanları", slug: "oyuncu-ekipmanlari" },
        ],
      },
      {
        name: "Müzik Aletleri",
        slug: "muzik",
        children: [
          { name: "Gitar", slug: "gitar" },
          { name: "Klavye & Piyano", slug: "klavye-piyano" },
          { name: "Diğer Enstrümanlar", slug: "diger-enstruman" },
        ],
      },
      { name: "Kitap, Dergi & Film", slug: "kitap-dergi-film" },
      { name: "Koleksiyon & Antika", slug: "antika" },
      { name: "El İşi & Hobi Malzemeleri", slug: "el-isi-hobi" },
      { name: "Oyuncak", slug: "oyuncak" },
    ],
  },
  {
    name: "Kişisel Bakım & Kozmetik",
    slug: "kisisel-bakim-kozmetik",
    children: [
      { name: "Parfüm & Deodorant", slug: "parfum" },
      { name: "Cilt Bakımı", slug: "cilt-bakimi" },
      { name: "Makyaj", slug: "makyaj" },
      { name: "Saç Bakımı & Şekillendirici", slug: "sac-bakimi" },
      { name: "Tıraş & Epilasyon", slug: "tiras-epilasyon" },
    ],
  },
  {
    name: "Ofis & Kırtasiye",
    slug: "ofis-kirtasiye",
    children: [
      { name: "Ofis Mobilyası", slug: "ofis-mobilyasi" },
      { name: "Kırtasiye Malzemeleri", slug: "kirtasiye-malzemeleri" },
      { name: "Yazıcı & Sarf Malzeme", slug: "yazici-sarf" },
    ],
  },
  {
    name: "Bahçe & Yapı Market",
    slug: "bahce-yapi-market",
    children: [
      { name: "Bahçe Aletleri", slug: "bahce-aletleri" },
      { name: "El Aletleri", slug: "el-aletleri" },
      { name: "Elektrikli Aletler", slug: "elektrikli-aletler" },
      { name: "Hırdavat & Nalbur", slug: "hirdavat" },
      { name: "Banyo & Yapı", slug: "banyo-yapi" },
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
  { name: "Diğer", slug: "diger" },
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
  /** Kökten bu yaprağa kadar tüm ad'lar (breadcrumb) - örn. ["Ev & Yaşam",
   * "Mobilya", "Koltuk & Kanepe"]. */
  breadcrumb: string[];
  /** breadcrumb ile aynı sırada, her seviyenin slug'ı - kademeli seçicide
   * ara düğümlere de ikon/tema atayabilmek için (bkz. category-picker). */
  breadcrumbSlugs: string[];
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
      breadcrumbSlugs: path.map((n) => n.slug),
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
