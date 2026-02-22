/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, use } from "react";
import {
  ArrowLeft,
  Store,
  Globe,
  MessageCircle,
  Package,
  ExternalLink,
  FileText,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StoreLogo } from "@/components/store-logo";
import { formatCurrency } from "@/lib/currency";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function parseItems(items: string | null): string[] {
  if (!items) return [];
  return items
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
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

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/bundles/${slug}`);
        if (!res.ok) {
          if (res.status === 404) setNotFound(true);
          throw new Error("Failed to fetch bundle");
        }
        const data = await res.json();
        setBundle(data.bundle);
        setRelatedBundles(data.relatedBundles || []);
        setRelatedBrochures(data.relatedBrochures || []);
      } catch {
        if (!notFound) setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, notFound]);

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 py-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-24 mb-6" />
          <div className="h-40 sm:h-56 md:h-64 bg-slate-100 rounded-2xl mb-6" />
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-full bg-slate-200" />
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-slate-200 rounded w-40" />
              <div className="h-3 bg-slate-200 rounded w-24" />
            </div>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="aspect-[4/3] bg-slate-100 rounded-2xl mb-6" />
            <div className="h-8 bg-slate-200 rounded w-2/3 mb-4" />
            <div className="h-10 bg-slate-200 rounded w-32 mb-6" />
            <div className="space-y-2 mb-6">
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-5/6" />
              <div className="h-3 bg-slate-200 rounded w-4/6" />
            </div>
            <div className="flex gap-2 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 bg-slate-200 rounded-full w-20" />
              ))}
            </div>
            <div className="h-32 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !bundle) {
    return (
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 py-16 text-center">
        <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Package className="h-10 w-10 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Bundle not found</h1>
        <p className="text-slate-500 text-sm mb-4">
          This bundle may have been removed or is no longer available.
        </p>
        <Link href={`/store/${id}`}>
          <Button variant="outline" className="rounded-xl">
            Back to Store
          </Button>
        </Link>
      </div>
    );
  }

  const itemsList = parseItems(bundle.items);

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6">
      {/* Back link */}
      <Link
        href={`/store/${id}`}
        className="inline-flex items-center text-sm text-slate-500 hover:text-primary mb-4 sm:mb-5 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Store
      </Link>

      {/* Store Banner */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-8">
        <div className="relative h-40 sm:h-56 md:h-64 bg-gradient-to-r from-primary/10 via-primary/5 to-slate-50">
          {bundle.storeBanner ? (
            <img
              src={bundle.storeBanner}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-slate-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/30 to-transparent" />
        </div>

        {/* Store Info Overlay */}
        <div className="relative -mt-12 sm:-mt-16 px-4 sm:px-6 md:px-8 pb-4 sm:pb-5">
          <div className="flex items-end gap-3 sm:gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-4 border-white shadow-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
              {bundle.storeLogo ? (
                <img
                  src={bundle.storeLogo}
                  alt={bundle.storeName}
                  className="h-full w-full object-contain p-1.5"
                />
              ) : (
                <Store className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <div className="min-w-0 pb-1">
              <Link
                href={`/store/${id}`}
                className="text-lg sm:text-xl font-bold text-slate-900 hover:text-primary transition-colors leading-tight"
              >
                {bundle.storeName}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bundle Content */}
      <div className="max-w-4xl mx-auto">
        {/* Bundle Image */}
        {bundle.imageUrl ? (
          <div className="rounded-2xl overflow-hidden border bg-slate-50 mb-6">
            <img
              src={bundle.imageUrl}
              alt={bundle.name}
              className="w-full h-auto object-contain max-h-[500px]"
            />
          </div>
        ) : (
          <div className="rounded-2xl border bg-slate-50 mb-6 flex items-center justify-center py-20">
            <div className="text-center">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No bundle image available</p>
            </div>
          </div>
        )}

        {/* Bundle Name */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4">
          {bundle.name}
        </h1>

        {/* Price Badge */}
        {bundle.price != null && (
          <div className="mb-6">
            <Badge className="text-lg sm:text-xl font-bold px-4 py-2 rounded-xl bg-primary text-primary-foreground">
              {formatCurrency(bundle.price)}
            </Badge>
          </div>
        )}

        {/* Description */}
        {bundle.description && (
          <div className="mb-8">
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {bundle.description}
            </p>
          </div>
        )}

        {/* Items Included */}
        {itemsList.length > 0 && (
          <div className="mb-8">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Items Included
            </h2>
            <div className="flex flex-wrap gap-2">
              {itemsList.map((item, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="rounded-lg text-sm px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Store Info Card */}
        <Card className="mb-6 overflow-hidden border-slate-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <StoreLogo src={bundle.storeLogo} name={bundle.storeName} size="lg" />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/store/${id}`}
                  className="font-semibold text-slate-900 hover:text-primary transition-colors"
                >
                  {bundle.storeName}
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">Available on MaDe Market</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {bundle.storeWhatsapp && (
                <Button
                  className="rounded-xl text-sm h-10 bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                  onClick={() => {
                    window.open(
                      generateWhatsAppLink(
                        bundle.storeWhatsapp!,
                        `Hi ${bundle.storeName}, I'm interested in the "${bundle.name}" bundle on MaDe Market!`
                      ),
                      "_blank"
                    );
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-1.5" />
                  WhatsApp
                </Button>
              )}
              {bundle.storeWebsite && (
                <a
                  href={bundle.storeWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none"
                >
                  <Button variant="outline" className="rounded-xl text-sm h-10 w-full">
                    <Globe className="h-4 w-4 mr-1.5" />
                    Website
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main CTA - Visit Store / External Link */}
        {bundle.externalUrl && (
          <a
            href={bundle.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-8"
          >
            <Button className="w-full h-12 sm:h-14 rounded-xl text-base font-semibold">
              <ExternalLink className="h-5 w-5 mr-2" />
              Visit Store
            </Button>
          </a>
        )}

        {/* Related Bundles */}
        {relatedBundles.length > 0 && (
          <div className="mb-8">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-slate-900 mb-4">
              More Bundles
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-3 px-3 scrollbar-hide">
              {relatedBundles.map((rb) => (
                <Link
                  key={rb.id}
                  href={`/store/${id}/bundle/${rb.slug}`}
                  className="shrink-0 w-48 sm:w-56 group"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                    <div className="aspect-square bg-slate-100 overflow-hidden">
                      {rb.imageUrl ? (
                        <img
                          src={rb.imageUrl}
                          alt={rb.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <p className="font-medium text-sm text-slate-900 line-clamp-2 group-hover:text-primary transition-colors">
                        {rb.name}
                      </p>
                      {rb.price != null && (
                        <p className="text-sm font-bold text-primary mt-1">
                          {formatCurrency(rb.price)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Brochures */}
        {relatedBrochures.length > 0 && (
          <div className="mb-8">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-slate-900 mb-4">
              Brochures from {bundle.storeName}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-3 px-3 scrollbar-hide">
              {relatedBrochures.map((rb) => (
                <Link
                  key={rb.id}
                  href={`/store/${id}/brochure/${rb.slug}`}
                  className="shrink-0 w-56 sm:w-64 group"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                    <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                      {rb.thumbnailImageUrl ? (
                        <img
                          src={rb.thumbnailImageUrl}
                          alt={rb.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="h-8 w-8 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <p className="font-medium text-sm text-slate-900 line-clamp-2 group-hover:text-primary transition-colors">
                        {rb.title}
                      </p>
                      {(rb.validFrom || rb.validUntil) && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {rb.validFrom
                            ? formatDate(rb.validFrom)
                            : `Until ${formatDate(rb.validUntil!)}`}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* View all from store */}
        <div className="text-center pt-4 pb-8">
          <Link href={`/store/${id}`}>
            <Button variant="outline" className="rounded-xl">
              <Store className="h-4 w-4 mr-2" />
              View all from {bundle.storeName}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
