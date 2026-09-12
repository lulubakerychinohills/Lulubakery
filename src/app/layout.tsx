import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import CookieConsent from "@/components/cookie-consent";
import { DEFAULT_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: `${SITE_NAME} | Custom Cakes & Desserts | Chino Hills, CA`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "custom cakes",
    "Chino Hills bakery",
    "birthday cake",
    "wedding cake",
    "Lulu Bakery",
    "order cake online",
    "California custom desserts",
  ],
  authors: [{ name: SITE_NAME, url: siteUrl.origin }],
  creator: SITE_NAME,
  formatDetection: { telephone: true, email: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl.origin,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Custom Cakes & Desserts`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/brand/avatar.webp",
        width: 1024,
        height: 1024,
        alt: `${SITE_NAME} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Custom Cakes in Chino Hills`,
    description: DEFAULT_DESCRIPTION,
    images: ["/brand/avatar.webp"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.png" }],
    apple: [{ url: "/apple-icon.png" }],
  },
  alternates: { canonical: siteUrl.origin },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
