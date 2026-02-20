import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <ShoppingCart className="h-5 w-5 text-primary" />
              MaDe Market
            </Link>
            <p className="text-sm text-muted-foreground">
              Compare grocery prices across stores. Save money on every shop.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Shop</h4>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">Browse Products</Link></li>
              <li><Link href="/compare" className="text-sm text-muted-foreground hover:text-foreground">Compare Prices</Link></li>
              <li><Link href="/cart" className="text-sm text-muted-foreground hover:text-foreground">Smart Cart</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">For Stores</h4>
            <ul className="space-y-2">
              <li><Link href="/register" className="text-sm text-muted-foreground hover:text-foreground">Register Store</Link></li>
              <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Vendor Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} MaDe Market. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
