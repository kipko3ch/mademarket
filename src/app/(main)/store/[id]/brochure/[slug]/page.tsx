/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, use } from "react";
import {
  ArrowLeft,
  Store,
  Calendar,
  FileText,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StoreLogo } from "@/components/store-logo";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Brochure {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  bannerImageUrl: string | null;
  thumbnailImageUrl: string | null;
  status: string;
  validFrom: string | null;
  validUntil: string | null;
  storeName: string;
  storeSlug: string;
  storeLogo: string | null;
  storeBanner: string | null;
}

interface RelatedBrochure {
  id: string;
  title: string;
  slug: string;
  thumbnailImageUrl: string | null;
  validFrom: string | null;
  validUntil: string | null;
}

interface RelatedBundle {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number | null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BrochureDetailPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = use(params);
  const [brochure, setBrochure] = useState<Brochure | null>(null);
  const [relatedBrochures, setRelatedBrochures] = useState<RelatedBrochure[]>([]);
  const [relatedBundles, setRelatedBundles] = useState<RelatedBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/brochures/${slug}`);
        if (!res.ok) {
          if (res.status === 404) setNotFound(true);
          throw new Error("Failed to fetch brochure");
        }
        const data = await res.json();
        setBrochure(data.brochure);
        setRelatedBrochures(data.relatedBrochures || []);
        setRelatedBundles(data.relatedBundles || []);
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
          <div className="h-8 bg-slate-200 rounded w-2/3 mb-4" />
          <div className="h-64 sm:h-80 bg-slate-100 rounded-2xl mb-6" />
          <div className="h-4 bg-slate-200 rounded w-48 mb-3" />
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-3 bg-slate-200 rounded w-5/6" />
            <div className="h-3 bg-slate-200 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !brochure) {
    return (
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 py-16 text-center">
        <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <FileText className="h-10 w-10 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Brochure not found</h1>
        <p className="text-slate-500 text-sm mb-4">
          This brochure may have been removed or is no longer available.
        </p>
        <Link href={`/store/${id}`}>
          <Button variant="outline" className="rounded-xl">
            Back to Store
          </Button>
        </Link>
      </div>
    );
  }

  const isActive = brochure.status === "active";
  const hasValidity = brochure.validFrom || brochure.validUntil;

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
          {brochure.storeBanner ? (
            <img
              src={brochure.storeBanner}
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
              {brochure.storeLogo ? (
                <img
                  src={brochure.storeLogo}
                  alt={brochure.storeName}
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
                {brochure.storeName}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Brochure Content */}
      <div className="max-w-4xl mx-auto">
        {/* Title & Status */}
        <div className="flex flex-wrap items-start gap-3 mb-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight flex-1">
            {brochure.title}
          </h1>
          {!isActive && (
            <Badge variant="secondary" className="rounded-lg text-xs shrink-0 mt-1">
              {brochure.status}
            </Badge>
          )}
        </div>

        {/* Validity Dates */}
        {hasValidity && (
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            <span>
              {brochure.validFrom && brochure.validUntil
                ? `Valid from ${formatDate(brochure.validFrom)} to ${formatDate(brochure.validUntil)}`
                : brochure.validFrom
                  ? `Valid from ${formatDate(brochure.validFrom)}`
                  : `Valid until ${formatDate(brochure.validUntil!)}`}
            </span>
          </div>
        )}

        {/* Brochure Banner Image */}
        {brochure.bannerImageUrl && (
          <div className="rounded-2xl overflow-hidden border bg-slate-50 mb-6">
            <img
              src={brochure.bannerImageUrl}
              alt={brochure.title}
              className="w-full h-auto object-contain"
            />
          </div>
        )}

        {/* Thumbnail (show if no banner) */}
        {!brochure.bannerImageUrl && brochure.thumbnailImageUrl && (
          <div className="rounded-2xl overflow-hidden border bg-slate-50 mb-6 max-w-lg">
            <img
              src={brochure.thumbnailImageUrl}
              alt={brochure.title}
              className="w-full h-auto object-contain"
            />
          </div>
        )}

        {/* No images placeholder */}
        {!brochure.bannerImageUrl && !brochure.thumbnailImageUrl && (
          <div className="rounded-2xl border bg-slate-50 mb-6 flex items-center justify-center py-20">
            <div className="text-center">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No brochure image available</p>
            </div>
          </div>
        )}

        {/* Description */}
        {brochure.description && (
          <div className="mb-8">
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {brochure.description}
            </p>
          </div>
        )}

        {/* Related Brochures */}
        {relatedBrochures.length > 0 && (
          <div className="mb-8">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-slate-900 mb-4">
              More Brochures
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

        {/* Related Bundles */}
        {relatedBundles.length > 0 && (
          <div className="mb-8">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-slate-900 mb-4">
              Bundles from {brochure.storeName}
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
                          N$ {Number(rb.price).toFixed(2)}
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
              View all from {brochure.storeName}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
