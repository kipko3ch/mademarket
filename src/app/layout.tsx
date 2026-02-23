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
  title: "MaDe Market Namibia | Compare Grocery Prices, Specials & Deals",
  description:
    "Save money on your monthly groceries in Namibia. MaDe Market compares real-time prices from Shoprite, SPAR, Checkers, and Woermann Brock to find you the absolute cheapest deals.",
  keywords: ["Grocery Comparison Namibia", "Shoprite Specials", "SPAR Namibia Deals", "Checkers Price Comparison", "Save Money Namibia", "Namibian Retailers", "Smart Shopping Namibia"],
  authors: [{ name: "MaDe Market Team" }],
  openGraph: {
    title: "MaDe Market Namibia | Compare Grocery Prices & Save",
    description: "Find the lowest grocery prices across Namibia. Compare Shoprite, SPAR, Checkers and more in one place.",
    url: "https://mademarket.com.na",
    siteName: "MaDe Market",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MaDe Market - Compare Grocery Prices",
      },
    ],
    locale: "en_NA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MaDe Market Namibia | Compare Grocery Prices",
    description: "Save up to 30% on your weekly shopping by comparing prices in Namibia.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "MaDe Market Namibia",
              "url": "https://mademarket.com.na",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://mademarket.com.na/products?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </body>
    </html>
  );
}
