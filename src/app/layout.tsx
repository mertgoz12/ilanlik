import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AnnouncementBar } from "@/components/announcement-bar";
import { CookieConsent } from "@/components/cookie-consent";
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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const unreadCount = session ? await getUnreadMessageCount(session.id) : 0;

  return (
    <html lang="tr" className={`${inter.variable} ${sora.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <UnreadMessagesProvider initialCount={unreadCount}>
          <AnnouncementBar />
          <Navbar />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
          <CookieConsent />
        </UnreadMessagesProvider>
      </body>
    </html>
  );
}
