/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Globe, AtSign, Share2 } from "lucide-react";

const platformLinks = [
  { href: "/products", label: "How it Works" },
  { href: "/products", label: "Stores Map" },
  { href: "/compare", label: "Price History" },
];

const supportLinks = [
  { href: "/contact", label: "Help Center" },
  { href: "/contact", label: "Contact Us" },
  { href: "/contact", label: "FAQ" },
];

const partnerLinks = [
  { href: "/login", label: "Merchant Login" },
  { href: "/register", label: "Partner API" },
  { href: "/register", label: "List Your Store" },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-primary/10 pt-10 sm:pt-16 pb-6 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-4 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand — spans 2 cols on md+ */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 sm:mb-6">
              <img
                src="/logo.png"
                alt="MaDe Market"
                className="h-7 sm:h-8 w-auto"
              />
            </Link>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xs">
              Namibia&apos;s leading independent price comparison platform. Empowering consumers to shop smarter and save more.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-4 sm:mb-6">Platform</h4>
            <ul className="space-y-2.5 sm:space-y-4 text-xs sm:text-sm text-slate-500">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-4 sm:mb-6">Support</h4>
            <ul className="space-y-2.5 sm:space-y-4 text-xs sm:text-sm text-slate-500">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partners */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-bold text-slate-900 text-sm mb-4 sm:mb-6">Partners</h4>
            <ul className="space-y-2.5 sm:space-y-4 text-xs sm:text-sm text-slate-500">
              {partnerLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 sm:pt-8 border-t border-primary/5 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-[10px] sm:text-xs text-slate-400 text-center sm:text-left">
            &copy; {new Date().getFullYear()} MaDe Market Namibia. All rights reserved.
          </p>
          <div className="flex gap-5 sm:gap-6">
            <a href="#" className="text-slate-400 hover:text-primary transition-colors">
              <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-primary transition-colors">
              <AtSign className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-primary transition-colors">
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
