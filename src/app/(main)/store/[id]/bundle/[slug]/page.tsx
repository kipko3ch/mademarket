/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, use } from "react";
import { Package, Loader2, ArrowLeft, MessageCircle, Globe, ShoppingCart, FileText, CheckCircle2, ChevronRight, Store, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BundleCard, type BundleData } from "@/components/products/bundle-card";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BundleProduct {
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
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
  bundleImagesRaw?: { imageUrl: string }[];
  bundleProducts?: BundleProduct[];
  productImages?: string[];
  bundleImages?: string[];
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
  const [relatedBundles, setRelatedBundles] = useState<BundleData[]>([]);
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

        const firstImg = bundleData?.imageUrl || (bundleData?.bundleImages && bundleData.bundleImages[0]) || (bundleData?.productImages && bundleData.productImages[0]) || null;
        setActiveImage(firstImg);
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
      <div className="min-h-screen bg-white">
        {/* Skeleton Header */}
        <div className="bg-slate-50/50 border-b border-slate-100 h-16 animate-pulse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start">
            {/* LEFT: Visual Case Skeleton */}
            <div className="lg:col-span-7 space-y-6 animate-pulse">
              <div className="aspect-square sm:aspect-[4/3] rounded-[2.5rem] bg-slate-50 shadow-sm" />
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-2xl bg-slate-50" />
                <div className="w-20 h-20 rounded-2xl bg-slate-50" />
                <div className="w-20 h-20 rounded-2xl bg-slate-50" />
              </div>
            </div>

            {/* RIGHT: Info Skeleton */}
            <div className="lg:col-span-5 space-y-8 animate-pulse">
              <div className="space-y-4">
                <div className="h-6 w-32 bg-slate-100 rounded-full" />
                <div className="h-12 w-full bg-slate-200 rounded-2xl" />
                <div className="h-10 w-48 bg-slate-100 rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-50 rounded-full" />
                  <div className="h-4 w-5/6 bg-slate-50 rounded-full" />
                </div>
              </div>

              <div className="h-24 w-full bg-slate-50 rounded-3xl" />

              <div className="space-y-4">
                <div className="h-4 w-40 bg-slate-100 rounded-full" />
                <div className="space-y-3">
                  <div className="h-16 w-full bg-slate-50 rounded-2xl" />
                  <div className="h-16 w-full bg-slate-50 rounded-2xl" />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-16 flex-1 bg-slate-100 rounded-[1.5rem]" />
                <div className="h-16 flex-1 bg-slate-100 rounded-[1.5rem]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !bundle) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="h-24 w-24 rounded-3xl bg-white shadow-xl flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-slate-300" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2 whitespace-nowrap">Deal Not Found</h1>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            This bundle deal may have expired or been removed by the store owner. Check out the store profile for more deals.
          </p>
          <Link href={`/store/${id}`}>
            <Button size="lg" className="rounded-2xl px-8 w-full sm:w-auto font-bold shadow-lg shadow-primary/20">
              Back to {bundle?.storeName || "Store"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Collect all images
  const allImages = [
    ...(bundle.imageUrl ? [bundle.imageUrl] : []),
    ...(bundle.bundleImages || []),
    ...(bundle.productImages || []),
  ].filter(Boolean) as string[];

  const displayImage = activeImage || allImages[0] || null;

  // Items logic
  const itemsText = bundle.items ? bundle.items.split(/[\n,]/).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Dynamic Header / Breadcrumb Area */}
      <div className="bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href={`/store/${id}`}
            className="group flex items-center gap-2.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
          >
            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-white border border-slate-200 group-hover:bg-primary group-hover:text-white transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span>Store Profile</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="outline" className="rounded-md border-slate-200 text-slate-500 text-[10px] font-bold py-1">
              {bundle.storeName}
            </Badge>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-bold py-1">
              Current Bundle
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start">

          {/* LEFT: Visual Showcase (Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Stage */}
            <div className="relative aspect-square sm:aspect-[4/3] rounded-[2.5rem] bg-slate-50 border border-slate-100 overflow-hidden group/stage shadow-2xl shadow-slate-200/50">
              {displayImage ? (
                <div className="w-full h-full relative">
                  <img
                    src={displayImage}
                    alt={bundle.name}
                    className="w-full h-full object-contain p-10 group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute top-8 right-8">
                    <div className="bg-white/90 backdrop-blur-md border border-white h-12 w-12 rounded-2xl flex items-center justify-center shadow-xl">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-24 w-24 text-slate-200 animate-pulse" />
                </div>
              )}

              {/* Floating Price on Image for Mobile */}
              <div className="absolute bottom-6 left-6 block lg:hidden">
                <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xl shadow-2xl">
                  {formatCurrency(bundle.price || 0)}
                </div>
              </div>
            </div>

            {/* Gallery Picker */}
            {allImages.length > 1 && (
              <div className="flex flex-wrap gap-3 px-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 overflow-hidden transition-all duration-300 relative group",
                      displayImage === img ? "border-primary ring-4 ring-primary/5" : "border-slate-100 hover:border-slate-300"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    {displayImage === img && <div className="absolute inset-0 bg-primary/5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Details & Actions (Span 5) */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Tag className="h-3 w-3" />
                Exclusive Curated Deal
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                {bundle.name}
              </h1>

              <div className="flex items-center gap-4">
                <div className="text-3xl md:text-4xl font-black text-primary">
                  {formatCurrency(bundle.price || 0)}
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold px-3 py-1.5 rounded-xl border-0">
                  Combo Savings
                </Badge>
              </div>

              {bundle.description && (
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                  {bundle.description}
                </p>
              )}
            </div>

            {/* Store Card Minimal */}
            <Link
              href={`/store/${id}`}
              className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-3xl hover:border-primary/20 hover:shadow-md transition-all group"
            >
              <div className="h-14 w-14 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 p-2 shrink-0">
                {bundle.storeLogo ? (
                  <img src={bundle.storeLogo} alt={bundle.storeName} className="h-full w-full object-contain" />
                ) : <Store className="h-full w-full text-slate-300 p-2" />}
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sold by</p>
                <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{bundle.storeName}</h3>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all mr-2" />
            </Link>

            {/* Items Included List */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2.5">
                <ShoppingCart className="h-4 w-4 text-primary" />
                What&apos;s inside this bundle
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {bundle.bundleProducts && bundle.bundleProducts.length > 0 ? (
                  bundle.bundleProducts.map((bp, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                      <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 p-1 flex items-center justify-center overflow-hidden shrink-0">
                        {bp.productImage ? (
                          <img src={bp.productImage} alt={bp.productName} className="h-full w-full object-contain" />
                        ) : <Package className="h-6 w-6 text-slate-200" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{bp.productName}</h4>
                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Qty: {bp.quantity}</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 opacity-40" />
                    </div>
                  ))
                ) : (
                  itemsText.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100 text-sm font-medium text-slate-600">
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Checkout Actions */}
            <div className="pt-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {bundle.storeWhatsapp && (
                  <Button
                    size="lg"
                    className="flex-1 rounded-[1.5rem] py-8 bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-lg gap-3 shadow-xl shadow-green-500/10 active:scale-95 transition-all"
                    onClick={() => {
                      window.open(`https://wa.me/${bundle.storeWhatsapp?.replace(/\D/g, "")}?text=Hi, I'm interested in the bundle deal "${bundle.name}" I saw on MaDe Market.`, "_blank");
                    }}
                  >
                    <MessageCircle className="h-6 w-6" />
                    Order via WA
                  </Button>
                )}
                {bundle.storeWebsite && (
                  <Link href={bundle.storeWebsite} target="_blank" className="flex-1">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full rounded-[1.5rem] py-8 border-2 border-slate-900 text-slate-900 font-black text-lg gap-3 hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                    >
                      <Globe className="h-6 w-6" />
                      Visit Store
                    </Button>
                  </Link>
                )}
              </div>
              <p className="text-[10px] text-center text-slate-400 font-medium px-8 leading-relaxed">
                *Prices and availability are subject to change by the retailer. Confirm stock via WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* RELATED SECTION */}
        <div className="mt-24 sm:mt-32 space-y-16">
          {/* More Bundles */}
          {relatedBundles.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">More <span className="text-primary italic">Live Deals</span></h2>
                  <p className="text-slate-500 text-sm mt-1">Don&apos;t miss out on these other combos from {bundle.storeName}</p>
                </div>
                <Link href={`/store/${id}`} className="hidden sm:flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest hover:underline">
                  Explore Store <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedBundles.map((rb) => (
                  <BundleCard key={rb.id} bundle={rb} />
                ))}
              </div>
            </section>
          )}

          {/* More Brochures */}
          {relatedBrochures.length > 0 && (
            <section className="bg-slate-900 rounded-[3rem] p-8 sm:p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[100px]" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="max-w-xl">
                  <h2 className="text-3xl sm:text-4xl font-black mb-4">Store <span className="text-primary">Catalogues</span></h2>
                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                    Flip through the latest weekly leaflets and digital brochures to find even more hidden gems and grocery deals.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    {relatedBrochures.map((rb) => (
                      <Link
                        key={rb.id}
                        href={`/store/${id}/brochure/${rb.slug}`}
                        className="bg-white/10 backdrop-blur-xl border border-white/10 p-2 sm:p-3 rounded-2xl hover:bg-white/20 transition-all group shrink-0"
                      >
                        <div className="h-32 sm:h-40 aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-white/5">
                          {rb.thumbnailImageUrl ? (
                            <img src={rb.thumbnailImageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : <FileText className="h-10 w-10 m-auto text-white/20" />}
                        </div>
                        <p className="text-xs font-bold text-center text-white truncate max-w-[120px]">{rb.title}</p>
                      </Link>
                    ))}
                  </div>
                </div>

                <Link href={`/store/${id}`} className="group relative h-48 w-full md:w-64 bg-primary rounded-[2rem] flex flex-col items-center justify-center p-8 overflow-hidden active:scale-95 transition-all">
                  <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <Store className="h-12 w-12 text-white mb-4 relative" />
                  <span className="text-sm font-black text-white uppercase tracking-widest text-center relative">Visit Full Store Profile</span>
                </Link>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

