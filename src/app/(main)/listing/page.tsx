/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Tag, MessageCircle, ExternalLink, Loader2, Search } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

interface ListingItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  categoryId: string | null;
  categoryName: string | null;
  price: string | null;
  checkoutType: "whatsapp" | "external_url";
  whatsappNumber: string | null;
  externalUrl: string | null;
  featured: boolean;
  imageUrl: string | null;
}

export default function ListingsPage() {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch("/api/standalone");
        if (res.ok) {
          const data = await res.json();
          setListings(data);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  const categories = [...new Set(listings.map((l) => l.categoryName).filter(Boolean))] as string[];

  const filtered = listings.filter((l) => {
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory && l.categoryName !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Marketplace</h1>
        <p className="text-slate-500 text-sm mt-1">Cars, houses, electronics, and more for sale</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${!selectedCategory ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${selectedCategory === cat ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-10 w-10 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">No listings found</h2>
          <p className="text-slate-500 text-sm">
            {search || selectedCategory ? "Try adjusting your filters." : "Check back soon for new listings."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((listing) => (
            <Link
              key={listing.id}
              href={`/listing/${listing.slug}`}
              className="group bg-transparent overflow-hidden hover:shadow-md transition-all flex flex-col"
            >
              <div className="aspect-[4/3] bg-slate-100 rounded-2xl border border-slate-100 overflow-hidden">
                {listing.imageUrl ? (
                  <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-12">
                    <img src="/icons/productplaceholder.png" alt="" className="h-full w-full object-contain opacity-20" />
                  </div>
                )}
              </div>
              <div className="p-4">
                {listing.categoryName && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-2">
                    <Tag className="h-2.5 w-2.5" />
                    {listing.categoryName}
                  </span>
                )}
                <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {listing.title}
                </h3>
                {listing.price && (
                  <p className="text-primary font-bold text-base mt-1">N$ {Number(listing.price).toFixed(2)}</p>
                )}
                <div className="mt-3">
                  {listing.checkoutType === "whatsapp" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2.5 py-1.5 rounded-full font-bold">
                      <FaWhatsapp className="h-3.5 w-3.5" /> WhatsApp
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full font-semibold">
                      <ExternalLink className="h-3 w-3" /> View Link
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
