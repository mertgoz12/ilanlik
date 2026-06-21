"use client";

import { useEffect } from "react";

// Geliştirme modunda (npm run dev) service worker'ı bilerek KAYIT ETMİYORUZ -
// SW'nin kendi önbelleği, Turbopack'in hot reload ile servis ettiği taze
// dosyalarla çakışıp kafa karıştırıcı "değişiklik görünmüyor" sorunlarına yol
// açabilir. PWA/SW davranışını test etmek için her zaman bir production
// build kullanın: `npm run build && npm run start`.
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Service worker kaydı başarısız:", err);
    });
  }, []);

  return null;
}
