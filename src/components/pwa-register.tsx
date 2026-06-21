"use client";

import { useEffect } from "react";

const LOG_PREFIX = "[PWA register]";

// Geliştirme modunda (npm run dev) service worker'ı bilerek KAYIT ETMİYORUZ -
// SW'nin kendi önbelleği, Turbopack'in hot reload ile servis ettiği taze
// dosyalarla çakışıp kafa karıştırıcı "değişiklik görünmüyor" sorunlarına yol
// açabilir. PWA/SW davranışını test etmek için her zaman bir production
// build kullanın: `npm run build && npm run start`.
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log(LOG_PREFIX, "Atlandı: development modunda service worker kaydedilmez.");
      return;
    }
    if (!("serviceWorker" in navigator)) {
      console.log(LOG_PREFIX, "Atlandı: bu tarayıcı serviceWorker API'sini desteklemiyor.");
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log(LOG_PREFIX, "Kayıt başarılı, scope:", registration.scope);
      })
      .catch((err) => {
        console.error(LOG_PREFIX, "Kayıt BAŞARISIZ:", err);
      });
  }, []);

  return null;
}
