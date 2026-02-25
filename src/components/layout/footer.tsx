/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

const platformLinks = [
  { href: "/about", label: "About MaDe Market" },
  { href: "/products", label: "Browse Products" },
  { href: "/products", label: "Weekly Specials" },
  { href: "/cart", label: "Smart Cart Comparison" },
  { href: "/saved", label: "My Wishlist" },
];

const regions = [
  { href: "/products?region=Khomas", label: "Khomas (Windhoek)" },
  { href: "/products?region=Erongo", label: "Erongo (Coast)" },
  { href: "/products?region=Oshana", label: "Oshana (North)" },
  { href: "/products?region=Otjozondjupa", label: "Otjozondjupa" },
];

const categories = [
  { href: "/products?category=groceries", label: "Groceries" },
  { href: "/products?category=drinks", label: "Drinks & Beverages" },
  { href: "/products?category=personal-care", label: "Personal Care" },
  { href: "/products?category=household", label: "Household Essentials" },
];

export function Footer() {
  const { data: session } = useSession();
  const isMerchant = session?.user?.role === "vendor" || session?.user?.role === "admin";

  return (
    <footer className="bg-white border-t border-slate-100 pt-12 sm:pt-20 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 sm:gap-12 mb-12 sm:mb-16">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <img
                src="/logo.png"
                alt="MaDe Market"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              We help you find the lowest grocery price across retailers. Saving Namibians money, one shop at a time.
            </p>
          </div>

          {/* Shop by Region */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-wider">Popular Regions</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              {regions.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-wider">Categories</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              {categories.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform & Partners */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-6 uppercase tracking-wider">Company</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}

              {/* Partner Links */}
              {isMerchant && (
                <li>
                  <Link href="/dashboard" className="hover:text-primary transition-colors font-semibold text-primary/80">
                    Merchant Dashboard
                  </Link>
                </li>
              )}
              <li>
                <a
                  href="https://wa.me/264818222368"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  List Your Business
                </a>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} MaDe Market Namibia. All prices shown are for comparison purposes only.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-xs text-slate-400 hover:text-slate-600">Terms</Link>
            <Link href="/privacy" className="text-xs text-slate-400 hover:text-slate-600">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
