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
      { name: "Kiralık Araçlar", slug: "kiralik-araclar" },
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
      { name: "Deniz Aracı Ekipmanları", slug: "deniz-araci-ekipmanlari" },
    ],
  },
  {
    name: "İkinci El ve Sıfır Alışveriş",
    slug: "ikinci-el-ve-sifir-alisveris",
    children: [
      { name: "Bilgisayar", slug: "bilgisayar" },
      { name: "Cep Telefonu", slug: "cep-telefonu" },
      { name: "Fotoğraf & Kamera", slug: "fotograf-kamera" },
      { name: "Ev Dekorasyon", slug: "ev-dekorasyon" },
      { name: "Ev Elektroniği", slug: "ev-elektronigi" },
      { name: "Giyim & Aksesuar", slug: "giyim-aksesuar" },
      { name: "Saat", slug: "saat" },
      { name: "Anne & Bebek", slug: "anne-bebek" },
      { name: "Kitap, Dergi, Film & Müzik", slug: "kitap-dergi-film-muzik" },
      { name: "Spor", slug: "spor" },
      { name: "Müzik Enstrümanları", slug: "muzik-enstrumanlari" },
      { name: "Koleksiyon", slug: "koleksiyon" },
      { name: "Takı & Mücevher", slug: "taki-mucevher" },
      { name: "Oyun & Hobi", slug: "oyun-hobi" },
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
  { name: "Ustalar ve Hizmetler", slug: "ustalar-ve-hizmetler" },
  { name: "Özel Ders Verenler", slug: "ozel-ders-verenler" },
  { name: "İş İlanları", slug: "is-ilanlari" },
  { name: "Yardımcı Arayanlar", slug: "yardimci-arayanlar" },
  {
    name: "Hayvanlar Alemi",
    slug: "hayvanlar-alemi",
    children: [
      { name: "Evcil Hayvanlar", slug: "evcil-hayvanlar" },
      { name: "Akvaryum Balıkları", slug: "akvaryum-baliklari" },
      { name: "Kümes Hayvanları", slug: "kumes-hayvanlari" },
      { name: "Büyükbaş & Küçükbaş", slug: "buyukbas-kucukbas" },
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
  isVasita: boolean;
};

/** Flat list of categories that listings can be assigned to (subcategories,
 * or top-level categories that have no subcategories of their own). Vasıta
 * ve Emlak, ARAC_EMLAK_AKTIF açılana kadar bu listeden (ve dolayısıyla ilan
 * verme formundan) tamamen çıkarılır - "çok yakında" mesajı menüde ayrıca
 * gösterilir (bkz. CategorySidebar, Footer). */
export function selectableCategories(): SelectableCategory[] {
  const result: SelectableCategory[] = [];
  for (const node of CATEGORY_TREE) {
    if (COMING_SOON_SLUGS.includes(node.slug) && !isVasitaEmlakActive()) continue;
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        result.push({
          slug: child.slug,
          name: child.name,
          groupName: node.name,
          isVasita: node.slug === VASITA_SLUG,
        });
      }
    } else {
      result.push({ slug: node.slug, name: node.name, groupName: node.name, isVasita: false });
    }
  }
  return result;
}
