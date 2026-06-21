import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AnnouncementBar } from "@/components/announcement-bar";
import { BottomNav } from "@/components/bottom-nav";
import { CookieConsent } from "@/components/cookie-consent";
import { MobileSearchProvider } from "@/components/mobile-search-context";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { PwaRegister } from "@/components/pwa-register";
import { UnreadMessagesProvider } from "@/components/unread-messages-context";
import { getSession } from "@/lib/session";
import { getUnreadMessageCount } from "@/lib/messages";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin", "latin-ext"],
  weight: ["800"],
});

const SITE_TITLE = "İlanlio | Yapay Zeka Destekli Güvenli İlan Platformu";
const SITE_DESCRIPTION =
  "İlanlio'da her ilan yapay zeka ile denetlenir. İkinci el elektronik, ev eşyası, hobi ve daha fazlası - güvenilir alışverişin yeni adresi.";

export const metadata: Metadata = {
  metadataBase: new URL("https://ilanlio.com"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "https://ilanlio.com",
    siteName: "İlanlio",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    title: "İlanlio",
    statusBarStyle: "default",
  },
  // appleWebApp.capable sadece daha yeni "mobile-web-app-capable" etiketini
  // üretir; eski iOS/Safari sürümleri "Ana Ekrana Ekle" sonrası tam ekran
  // (adres çubuğusuz) açılış için hâlâ apple- önekli etiketi arar.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B2A4A",
  width: "device-width",
  initialScale: 1,
};

// React hydrate olmadan (PwaInstallBanner'ın useEffect'i bağlanmadan) ÖNCE
// beforeinstallprompt ateşlenirse, dinleyici henüz takılı olmadığından olay
// sonsuza dek kaçırılır - kaçırılan bir olay bir daha asla tekrar
// tetiklenmez. next/script'in "beforeInteractive" stratejisi bu projede
// (App Router + Turbopack) script'i RSC akışı üzerinden React ağacının bir
// parçası olarak gönderiyor; yani gerçekte hydration'dan ÖNCE çalışmıyor -
// bu yüzden burada <head> içine GERÇEKTEN ham, statik bir <script> etiketi
// olarak (next/script kullanmadan) gömülüyor; tarayıcı bunu dokümanı
// parse ederken, herhangi bir React/Next kodu çalışmadan önce işler.
const PWA_INSTALL_CAPTURE_SCRIPT = `
  window.__pwaDeferredPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    var isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (!isMobile) return;
    e.preventDefault();
    window.__pwaDeferredPrompt = e;
    window.dispatchEvent(new Event("pwa-install-ready"));
  });
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const unreadCount = session ? await getUnreadMessageCount(session.id) : 0;

  return (
    <html lang="tr" className={`${inter.variable} ${sora.variable} h-full antialiased`}>
      <head>
        <script id="pwa-install-capture" dangerouslySetInnerHTML={{ __html: PWA_INSTALL_CAPTURE_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <UnreadMessagesProvider initialCount={unreadCount}>
          <MobileSearchProvider>
            <AnnouncementBar />
            <Navbar />
            <PwaInstallBanner />
            <main className="flex flex-1 flex-col pb-16 md:pb-0">{children}</main>
            <Footer />
            <CookieConsent />
            <BottomNav isLoggedIn={!!session} />
            <PwaRegister />
          </MobileSearchProvider>
        </UnreadMessagesProvider>
      </body>
    </html>
  );
}
