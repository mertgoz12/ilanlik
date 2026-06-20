const STORAGE_KEY = "ilanlio:recent-searches:v1";
const MAX_RECENT = 6;

// SSR sırasında window yok; bu dosya sadece "use client" bileşenlerden
// çağrılır ama yine de savunmacı kontrol ediyoruz.
function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getRecentSearches(): string[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(term: string): string[] {
  const trimmed = term.trim();
  if (!trimmed || !hasStorage()) return getRecentSearches();

  const existing = getRecentSearches().filter(
    (item) => item.toLocaleLowerCase("tr-TR") !== trimmed.toLocaleLowerCase("tr-TR"),
  );
  const next = [trimmed, ...existing].slice(0, MAX_RECENT);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage dolu/devre dışıysa son aramalar sessizce kaydedilmez.
  }
  return next;
}

export function removeRecentSearch(term: string): string[] {
  if (!hasStorage()) return [];
  const next = getRecentSearches().filter((item) => item !== term);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // yoksay
  }
  return next;
}
