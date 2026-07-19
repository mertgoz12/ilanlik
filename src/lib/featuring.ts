import { prisma } from "./prisma";

// ÖNE ÇIKARMA (VİTRİN) HAK SİSTEMİ
// Kullanıcı, yayında olan her 3 ilan için 1 ilanını ücretsiz öne çıkarma
// hakkı kazanır (3 ilan -> 1 vitrin, 6 -> 2, ...). Ayrı bir kredi/DB alanı
// gerektirmez: hak = floor(yayındaki ilan sayısı / 3), kullanılan = öne
// çıkarılmış (isFeatured) yayındaki ilan sayısı. Kalan = hak - kullanılan.
export const LISTINGS_PER_FEATURE = 3;

export type FeatureAllowance = {
  /** Yayında (active) ilan sayısı */
  activeCount: number;
  /** Kazanılan toplam öne çıkarma hakkı = floor(activeCount / 3) */
  allowance: number;
  /** Şu an öne çıkarılmış (active + isFeatured) ilan sayısı */
  used: number;
  /** Kalan kullanılabilir hak */
  remaining: number;
  /** Bir sonraki hakka kaç ilan kaldı (0 = bu ilanla yeni hak açıldı) */
  toNext: number;
};

export async function getFeatureAllowance(userId: string): Promise<FeatureAllowance> {
  const [activeCount, used] = await Promise.all([
    prisma.listing.count({ where: { userId, status: "active" } }),
    prisma.listing.count({ where: { userId, status: "active", isFeatured: true } }),
  ]);
  const allowance = Math.floor(activeCount / LISTINGS_PER_FEATURE);
  const remaining = Math.max(0, allowance - used);
  const toNext = activeCount === 0 ? LISTINGS_PER_FEATURE : LISTINGS_PER_FEATURE - (activeCount % LISTINGS_PER_FEATURE || LISTINGS_PER_FEATURE);
  return { activeCount, allowance, used, remaining, toNext };
}
