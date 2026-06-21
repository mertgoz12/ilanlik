// İlanlio - temel PWA service worker.
//
// Kapsam bilinçli olarak dar tutuldu: bu bir "tamamen çevrimdışı çalışan
// uygulama" değil, ilan verileri her zaman taze (veritabanından) gelmeli.
// Sadece şunları yapar:
//  1. Next.js'in değişmez (hash'li) statik varlıklarını (_next/static, ikonlar,
//     logo) önbellekten hızlı sunar.
//  2. Sayfa gezinmelerinde önce ağı dener; ağ yoksa markalı bir "çevrimdışı"
//     sayfası gösterir (tarayıcının çirkin varsayılan hata sayfası yerine).
// Yapı/önbellek mantığı değiştiğinde CACHE_NAME'i artırın - eski önbellek
// activate adımında otomatik silinir.
const CACHE_NAME = "ilanlio-cache-v1";
const OFFLINE_URL = "/offline.html";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/logo.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function isImmutableStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/logo.png"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Sadece GET ve aynı origin - server action'lara (POST), Vercel Blob
  // gibi başka origin'lere veya aramaya karışmıyoruz.
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (isImmutableStaticAsset(url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL).then((res) => res ?? Response.error())),
    );
  }
});
