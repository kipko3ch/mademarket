import type { Metadata } from "next";
import { Inter, Dela_Gothic_One } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";
import { PromoPopup } from "@/components/promo-popup";

const delaGothic = Dela_Gothic_One({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
  display: 'swap',
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mademarketnam.com"),
  title: {
    default: "MaDe Market Namibia | Compare Grocery Prices, Specials & Deals",
    template: "%s | MaDe Market Namibia"
  },
  description:
    "Save up to 30% on your monthly groceries in Namibia. MaDe Market compares real-time prices from Shoprite, SPAR, Checkers, and Woermann Brock to find the cheapest deals near you.",
  keywords: [
    "Grocery Comparison Namibia",
    "Shoprite Specials Namibia",
    "SPAR Namibia Deals",
    "Checkers Namibia Price Comparison",
    "Save Money Namibia",
    "Namibian Retailers",
    "Cheap Groceries Windhoek",
    "Namibia Price Tracker",
    "MaDe Market"
  ],
  authors: [{ name: "MaDe Market Team" }],
  creator: "MaDe Market",
  publisher: "MaDe Market Namibia",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    title: "MaDe Market Namibia | Compare Grocery Prices & Save",
    description: "Find the lowest grocery prices across Namibia. Compare Shoprite, SPAR, Checkers and more in real-time.",
    url: "https://mademarketnam.com",
    siteName: "MaDe Market",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MaDe Market - Price Comparison Tool",
      },
    ],
    locale: "en_NA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MaDe Market Namibia | Compare Grocery Prices",
    description: "Save on your weekly shopping by comparing prices in Namibia.",
    images: ["/og-image.png"],
    creator: "@mademarket",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${delaGothic.variable} antialiased font-sans bg-background text-foreground`}>
        <Providers>{children}</Providers>
        <PromoPopup />

        {/* Structured Data for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "MaDe Market Namibia",
                "url": "https://mademarketnam.com",
                "description": "Namibia's leading grocery price comparison platform.",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://mademarketnam.com/products?search={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "MaDe Market",
                "url": "https://mademarketnam.com",
                "logo": "https://mademarketnam.com/icon.png",
                "sameAs": [
                  "https://www.facebook.com/mademarket",
                  "https://www.instagram.com/mademarket"
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "areaServed": "NA",
                  "availableLanguage": "English"
                }
              }
            ])
          }}
        />
      </body>
    </html>
  );
}
