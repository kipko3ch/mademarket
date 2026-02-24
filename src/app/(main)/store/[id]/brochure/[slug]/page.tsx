/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, use } from "react";
import { FileText, Loader2, ArrowLeft, MessageCircle, Globe, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  branchWhatsapp?: string | null;
  vendorWebsiteUrl?: string | null;
  branchTown?: string | null;
}

interface RelatedBrochure {
  id: string;
  title: string;
  slug: string;
  thumbnailImageUrl: string | null;
  validFrom: string | null;
  validUntil: string | null;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-NA", { day: "numeric", month: "short", year: "numeric" });
}

export default function BrochureDetailPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = use(params);
  const [brochure, setBrochure] = useState<Brochure | null>(null);
  const [relatedBrochures, setRelatedBrochures] = useState<RelatedBrochure[]>([]);
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
      } catch {
        if (!notFound) setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (notFound || !brochure) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-10 w-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Brochure not found</h1>
          <p className="text-slate-500 text-sm mb-4">
            This brochure may have been removed or is no longer available.
          </p>
          <Link href={`/store/${id}`}>
            <Button variant="outline" className="rounded-xl">Back to Store</Button>
          </Link>
        </div>
      </div>
    );
  }

  const validFromStr = formatDate(brochure.validFrom);
  const validUntilStr = formatDate(brochure.validUntil);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back link */}
        <Link
          href={`/store/${id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {brochure.storeName}
        </Link>

        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Brochure image */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            {brochure.bannerImageUrl ? (
              <img
                src={brochure.bannerImageUrl}
                alt={brochure.title}
                className="w-full h-auto object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-80 bg-slate-100">
                <FileText className="h-16 w-16 text-slate-300" />
              </div>
            )}
          </div>

          {/* Right: Info panel */}
          <div className="space-y-5">
            {/* Store info */}
            <div className="flex items-center gap-3">
              {brochure.storeLogo ? (
                <img
                  src={brochure.storeLogo}
                  alt={brochure.storeName}
                  className="h-12 w-12 rounded-xl object-cover border border-slate-100"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-slate-400" />
                </div>
              )}
              <div>
                <Link href={`/store/${id}`} className="font-bold text-slate-900 hover:text-primary transition-colors">
                  {brochure.storeName}
                </Link>
                {brochure.branchTown && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {brochure.branchTown}
                  </p>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">{brochure.title}</h1>
              {brochure.description && (
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">{brochure.description}</p>
              )}
            </div>

            {/* Validity */}
            {(validFromStr || validUntilStr) && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-800 text-sm font-semibold mb-1">
                  <Calendar className="h-4 w-4" />
                  Valid Period
                </div>
                <p className="text-blue-700 text-sm">
                  {validFromStr && `From ${validFromStr}`}
                  {validFromStr && validUntilStr && " — "}
                  {validUntilStr && `Until ${validUntilStr}`}
                </p>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {brochure.branchWhatsapp && (
                <a
                  href={`https://wa.me/${brochure.branchWhatsapp.replace(/\D/g, "")}?text=Hi, I saw your brochure "${brochure.title}" on MaDe Market and I'm interested.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Store
                </a>
              )}
              {brochure.vendorWebsiteUrl && (
                <a
                  href={brochure.vendorWebsiteUrl}
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

        {/* Related brochures */}
        {relatedBrochures.length > 0 && (
          <div className="mt-10">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">More from {brochure.storeName}</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {relatedBrochures.map((rb) => (
                <Link
                  key={rb.id}
                  href={`/store/${id}/brochure/${rb.slug}`}
                  className="shrink-0 w-40 bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {rb.thumbnailImageUrl ? (
                    <img
                      src={rb.thumbnailImageUrl}
                      alt={rb.title}
                      className="w-full h-28 object-cover"
                    />
                  ) : (
                    <div className="w-full h-28 bg-slate-100 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs font-semibold text-slate-700 truncate">{rb.title}</p>
                    {rb.validUntil && (
                      <p className="text-[10px] text-slate-400 mt-0.5">Until {formatDate(rb.validUntil)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
