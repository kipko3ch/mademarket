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
  title: "MaDe Market — Compare Grocery Prices",
  description:
    "Compare grocery prices across multiple stores. Find the cheapest deals and save money on every shop.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
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
      </body>
    </html>
  );
}
