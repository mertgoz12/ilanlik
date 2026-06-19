const MIN_LISTING_NO = 1_000_000_000;
const MAX_LISTING_NO = 9_999_999_999;

/** Rastgele 10 haneli (1000000000-9999999999) bir ilan numarası üretir. */
export function generateListingNo(): string {
  return String(Math.floor(MIN_LISTING_NO + Math.random() * (MAX_LISTING_NO - MIN_LISTING_NO + 1)));
}
