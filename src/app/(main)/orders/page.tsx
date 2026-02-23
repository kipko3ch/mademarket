"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  Info,
  Package,
  Clock,
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  store?: string;
  image?: string;
}

export default function OrdersPage() {
  const { status } = useSession();
  const [cartHistory, setCartHistory] = useState<CartItem[]>([]);
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    // Try to load cart history from localStorage
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        const items = Array.isArray(parsed) ? parsed : parsed?.items || [];
        if (items.length > 0) {
          setCartHistory(items);
          setHasHistory(true);
        }
      }
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }, []);

  if (status === "unauthenticated") {
    redirect("/login");
  }

  if (status === "loading") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
      <Link
        href="/account"
        className="group inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-8 transition-all"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 group-hover:bg-primary group-hover:text-white transition-all">
          <ArrowLeft className="h-4 w-4" />
        </div>
        <span className="font-medium">Back to Account</span>
      </Link>

      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900">
          My Orders
        </h1>
        <p className="text-slate-500 mt-2">
          Your purchase history and order tracking.
        </p>
      </div>

      {/* Info Section */}
      <section className="mb-10">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                How purchases work
              </p>
              <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                MaDe Market is a price comparison tool. When you find the best
                deal, purchases happen directly at the retailer's store or
                through their website. To track an order, please visit the
                store where you made your purchase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cart History Section */}
      {hasHistory && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Recent Cart Items
            </h2>
          </div>

          <div className="space-y-3">
            {cartHistory.slice(0, 10).map((item, index) => (
              <div
                key={item.id || index}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <Package className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.store && `${item.store} · `}
                      Qty: {item.quantity || 1}
                    </p>
                  </div>
                </div>
                {item.price && (
                  <span className="text-sm font-semibold text-slate-900">
                    KSh {Number(item.price).toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!hasHistory && (
        <section className="mb-10">
          <div className="text-center py-12 rounded-xl border border-dashed border-slate-200">
            <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-4" />
            <p className="text-sm font-medium text-slate-500">
              No recent cart activity
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Items you add to your cart will appear here.
            </p>
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag className="h-5 w-5 text-slate-600" />
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Quick Links
          </h2>
        </div>

        <div className="space-y-3">
          <Link
            href="/products"
            className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-primary/10 transition-colors">
                <Package className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Browse Products
                </p>
                <p className="text-xs text-slate-500">
                  Compare prices across stores
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
          </Link>

          <Link
            href="/cart"
            className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-primary/10 transition-colors">
                <ShoppingBag className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  View Cart
                </p>
                <p className="text-xs text-slate-500">
                  See items in your current cart
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </section>
    </div>
  );
}
