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

export const metadata: Metadata = {
  metadataBase: new URL("https://ilanlik.com"),
  title: "İlanlık | Yapay Zeka Destekli Araç İlanları",
  description:
    "İlanlık - araç al, sat, ilan ver. Hasar, boya ve değişen bilgileriyle şeffaf araç ilanları.",
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
