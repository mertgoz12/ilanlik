// Digital Asset Links — TWA (Trusted Web Activity) doğrulaması için.
// https://www.ilanlio.com/.well-known/assetlinks.json adresinde sunulur.
// Next 16'da .well-known statik dosya yerine Route Handler ile servis edilir
// (bkz. node_modules/next/dist/docs/01-app/02-guides/backend-for-frontend.md).

export const dynamic = "force-static";

const PACKAGE_NAME = "com.ilanlio.www.twa";

// SHA-256 sertifika parmak izleri.
// 1. Yükleme (upload) anahtarı — android-signing/.../signing.keystore
// 2. (EKLENECEK) Google Play App Signing anahtarı — Play Console > Uygulama
//    bütünlüğü > Uygulama imzalama anahtarı sertifikası. Play'den yüklenen
//    uygulamanın doğrulanması için bu şart. Alındığında diziye ekleyin.
const SHA256_FINGERPRINTS = [
  "8B:0F:08:E7:44:43:5C:B4:19:CE:A1:DB:7B:8B:B9:7B:D9:3D:38:00:15:17:A4:D8:80:0E:CA:EE:82:9C:B0:FD",
];

export function GET() {
  const body = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: PACKAGE_NAME,
        sha256_cert_fingerprints: SHA256_FINGERPRINTS,
      },
    },
  ];

  return new Response(JSON.stringify(body, null, 2), {
    headers: { "content-type": "application/json" },
  });
}
