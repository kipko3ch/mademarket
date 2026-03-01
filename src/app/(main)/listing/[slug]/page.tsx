/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, use } from "react";
import { ShoppingBag, Loader2, ArrowLeft, MessageCircle, ExternalLink, Tag } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ListingImage {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

interface Listing {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  categoryName: string | null;
  price: string | null;
  checkoutType: "whatsapp" | "external_url";
  whatsappNumber: string | null;
  externalUrl: string | null;
  featured: boolean;
  createdAt: string;
  images: ListingImage[];
}

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/standalone/${slug}`);
        if (!res.ok) {
          if (res.status === 404) setNotFound(true);
          return;
        }
        const data: Listing = await res.json();
        setListing(data);
        setActiveImage(data.images?.[0]?.imageUrl || null);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-10 w-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Listing not found</h1>
          <p className="text-slate-500 text-sm mb-4">This listing may have been removed or is no longer available.</p>
          <Link href="/"><Button variant="outline" className="rounded-xl">Back to Home</Button></Link>
        </div>
      </div>
    );
  }

  const images = listing.images || [];
  const displayImage = activeImage || images[0]?.imageUrl || null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            {displayImage ? (
              <img src={displayImage} alt={listing.title} className="w-full h-auto object-contain max-h-[500px]" />
            ) : (
              <div className="flex items-center justify-center h-72 bg-slate-100">
                <ShoppingBag className="h-16 w-16 text-slate-300" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.imageUrl)}
                  className={`shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${displayImage === img.imageUrl ? "border-primary" : "border-transparent hover:border-slate-300"
                    }`}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          {listing.categoryName && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
              <Tag className="h-3 w-3" />
              {listing.categoryName}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{listing.title}</h1>
            {listing.price && (
              <div className="mt-3 inline-flex items-center gap-1 bg-primary/10 text-primary px-4 py-2 rounded-xl">
                <span className="text-2xl font-bold">N$ {Number(listing.price).toFixed(2)}</span>
              </div>
            )}
          </div>

          {listing.description && (
            <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
          )}

          <div className="pt-2">
            {listing.checkoutType === "whatsapp" && listing.whatsappNumber ? (
              <a
                href={`https://wa.me/${listing.whatsappNumber.replace(/\D/g, "")}?text=Hi, I'm interested in "${listing.title}" listed on MaDe Market.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-colors text-base shadow-sm"
              >
                <FaWhatsapp className="h-5 w-5" />
                Contact via WhatsApp
              </a>
            ) : listing.checkoutType === "external_url" && listing.externalUrl ? (
              <a
                href={listing.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl transition-colors text-base shadow-sm"
              >
                <ExternalLink className="h-5 w-5" />
                View Listing
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
