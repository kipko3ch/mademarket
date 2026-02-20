/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

const shopLinks = [
  { href: "/products", label: "Browse Products" },
  { href: "/compare", label: "Compare Prices" },
  { href: "/cart", label: "Smart Cart" },
];

const storeLinks = [
  { href: "/register", label: "Register Store" },
  { href: "/dashboard", label: "Vendor Dashboard" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export function Footer() {
  return (
    <footer className="bg-background border-t border-border/40">
      <div className="container mx-auto max-w-7xl px-4 pt-16 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand column */}
          <div className="md:col-span-4 lg:col-span-5">
            <Link href="/" className="inline-block mb-6">
              <img
                src="/logo.png"
                alt="MaDe Market"
                className="h-9 w-auto dark:brightness-0 dark:invert"
              />
            </Link>
            <p className="text-base leading-relaxed text-muted-foreground max-w-xs">
              Your smartest way to shop for groceries. Compare prices across multiple stores and save on every trip.
            </p>
          </div>

          {/* Links cluster */}
          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Shop */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-6">
                Shop
              </h4>
              <ul className="space-y-4">
                {shopLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Stores */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-6">
                For Stores
              </h4>
              <ul className="space-y-4">
                {storeLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-sm font-semibold text-foreground mb-6">
                Company
              </h4>
              <ul className="space-y-4">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MaDe Market. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
