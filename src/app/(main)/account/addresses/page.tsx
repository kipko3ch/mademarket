"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  ExternalLink,
  Store,
  Info,
} from "lucide-react";

const popularStores = [
  {
    name: "Naivas",
    description: "Shop groceries and household items",
    url: "https://www.naivas.co.ke",
  },
  {
    name: "Carrefour",
    description: "Hypermarket with wide selection",
    url: "https://www.carrefour.ke",
  },
  {
    name: "Quickmart",
    description: "Everyday essentials and fresh produce",
    url: "https://www.quickmart.co.ke",
  },
  {
    name: "Cleanshelf",
    description: "Quality products at great prices",
    url: "https://www.cleanshelf.co.ke",
  },
];

export default function AddressesPage() {
  const { status } = useSession();

  if (status === "unauthenticated") {
    redirect("/login");
  }

  if (status === "loading") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-24 bg-muted rounded-xl" />
          <div className="space-y-3">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
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
          Shipping Addresses
        </h1>
        <p className="text-slate-500 mt-2">
          How delivery works with MaDe Market.
        </p>
      </div>

      {/* Info Section */}
      <section className="mb-10">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                How it works
              </p>
              <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                MaDe Market is a price comparison platform. When you find the
                best price for a product, you shop directly at the retailer's
                store or website. Shipping addresses are managed during checkout
                at the store you choose to purchase from.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visit Stores Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Store className="h-5 w-5 text-slate-600" />
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Shop Directly at These Stores
          </h2>
        </div>

        <div className="space-y-3">
          {popularStores.map((store) => (
            <a
              key={store.name}
              href={store.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-primary/10 transition-colors">
                  <MapPin className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {store.name}
                  </p>
                  <p className="text-xs text-slate-500">{store.description}</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
            </a>
          ))}
        </div>

        <div className="mt-6">
          <Link
            href="/store"
            className="text-sm font-medium text-primary hover:underline"
          >
            Browse all stores on MaDe Market
          </Link>
        </div>
      </section>
    </div>
  );
}
