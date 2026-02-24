/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, use } from "react";
import { Package, Loader2, ArrowLeft, MessageCircle, Globe, ShoppingCart, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface BundleImage {
  id: string;
  imageUrl: string;
}

interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  externalUrl: string | null;
  items: string | null;
  storeName: string;
  storeSlug: string;
  storeLogo: string | null;
  storeBanner: string | null;
  storeWebsite: string | null;
  storeWhatsapp: string | null;
  bundleImages?: BundleImage[];
}

interface RelatedBundle {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number | null;
}

interface RelatedBrochure {
  id: string;
  title: string;
  slug: string;
  thumbnailImageUrl: string | null;
  validFrom: string | null;
  validUntil: string | null;
}

export default function BundleDetailPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = use(params);
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [relatedBundles, setRelatedBundles] = useState<RelatedBundle[]>([]);
  const [relatedBrochures, setRelatedBrochures] = useState<RelatedBrochure[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/bundles/${slug}`);
        if (!res.ok) {
          if (res.status === 404) setNotFound(true);
          throw new Error("Failed to fetch bundle");
        }
        const data = await res.json();
        const bundleData = data.bundle;

        if (bundleData?.externalUrl) {
          setRedirecting(true);
          window.location.href = bundleData.externalUrl;
          return;
        }

        setBundle(bundleData);
        setRelatedBundles(data.relatedBundles || []);
        setRelatedBrochures(data.relatedBrochures || []);
        setActiveImage(bundleData?.imageUrl || null);
      } catch {
        if (!notFound) setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading || redirecting) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
        {redirecting && (
          <p className="text-slate-500 text-sm">Redirecting to store...</p>
        )}
      </div>
    );
  }

  if (notFound || !bundle) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Package className="h-10 w-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Bundle not found</h1>
          <p className="text-slate-500 text-sm mb-4">
            This bundle may have been removed or is no longer available.
          </p>
          <Link href={`/store/${id}`}>
            <Button variant="outline" className="rounded-xl">Back to Store</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Collect all images
  const allImages: string[] = [];
  if (bundle.imageUrl) allImages.push(bundle.imageUrl);
  if (bundle.bundleImages) {
    for (const bi of bundle.bundleImages) {
      if (bi.imageUrl !== bundle.imageUrl) allImages.push(bi.imageUrl);
    }
  }

  const displayImage = activeImage || allImages[0] || null;

  // Parse items list
  const itemsList = bundle.items
    ? bundle.items.split("\n").filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back link */}
        <Link
          href={`/store/${id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {bundle.storeName}
        </Link>

        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Bundle images */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={bundle.name}
                  className="w-full h-auto object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-80 bg-slate-100">
                  <Package className="h-16 w-16 text-slate-300" />
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${
                      displayImage === img ? "border-primary" : "border-transparent hover:border-slate-300"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info panel */}
          <div className="space-y-5">
            {/* Store info */}
            <div className="flex items-center gap-3">
              {bundle.storeLogo ? (
                <img
                  src={bundle.storeLogo}
                  alt={bundle.storeName}
                  className="h-12 w-12 rounded-xl object-cover border border-slate-100"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-slate-400" />
                </div>
              )}
              <Link href={`/store/${id}`} className="font-bold text-slate-900 hover:text-primary transition-colors">
                {bundle.storeName}
              </Link>
            </div>

            {/* Title + price */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">{bundle.name}</h1>
              {bundle.price != null && (
                <div className="mt-2 inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-xl">
                  <span className="text-xl font-bold">N$ {Number(bundle.price).toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {bundle.description && (
              <p className="text-slate-500 text-sm leading-relaxed">{bundle.description}</p>
            )}

            {/* Items list */}
            {itemsList.length > 0 && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Included Items
                </p>
                <ul className="space-y-1.5">
                  {itemsList.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-primary mt-0.5 font-bold">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {bundle.storeWhatsapp && (
                <a
                  href={`https://wa.me/${bundle.storeWhatsapp.replace(/\D/g, "")}?text=Hi, I'm interested in the bundle "${bundle.name}" on MaDe Market.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Store
                </a>
              )}
              {bundle.storeWebsite && (
                <a
                  href={bundle.storeWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
                >
                  <Globe className="h-4 w-4" />
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Related content */}
        {(relatedBundles.length > 0 || relatedBrochures.length > 0) && (
          <div className="mt-10 space-y-6">
            {relatedBundles.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">More Bundles from {bundle.storeName}</h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {relatedBundles.map((rb) => (
                    <Link
                      key={rb.id}
                      href={`/store/${id}/bundle/${rb.slug}`}
                      className="shrink-0 w-40 bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {rb.imageUrl ? (
                        <img src={rb.imageUrl} alt={rb.name} className="w-full h-28 object-cover" />
                      ) : (
                        <div className="w-full h-28 bg-slate-100 flex items-center justify-center">
                          <Package className="h-8 w-8 text-slate-300" />
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs font-semibold text-slate-700 truncate">{rb.name}</p>
                        {rb.price != null && (
                          <p className="text-xs text-primary font-bold mt-0.5">N$ {Number(rb.price).toFixed(2)}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {relatedBrochures.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Brochures from {bundle.storeName}</h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {relatedBrochures.map((rb) => (
                    <Link
                      key={rb.id}
                      href={`/store/${id}/brochure/${rb.slug}`}
                      className="shrink-0 w-40 bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {rb.thumbnailImageUrl ? (
                        <img src={rb.thumbnailImageUrl} alt={rb.title} className="w-full h-28 object-cover" />
                      ) : (
                        <div className="w-full h-28 bg-slate-100 flex items-center justify-center">
                          <FileText className="h-8 w-8 text-slate-300" />
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs font-semibold text-slate-700 truncate">{rb.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
