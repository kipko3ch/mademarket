/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Store,
  ZoomIn,
  ZoomOut,
  Package,
  FileText,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import Link from "next/link";

interface ContentViewerProps {
  /** "brochure" or "bundle" */
  type: "brochure" | "bundle";
  /** All images to display in the viewer */
  images: string[];
  /** Title of the content */
  title: string;
  /** Description text */
  description?: string | null;
  /** Price (bundles only) */
  price?: number | null;
  /** Items text (bundles only, comma-separated) */
  items?: string | null;
  /** External URL (bundles only) */
  externalUrl?: string | null;
  /** Vendor/store info */
  storeName: string;
  storeLogo?: string | null;
  storeSlug: string;
  storeWhatsapp?: string | null;
  storeWebsite?: string | null;
  /** Validity dates (brochures only) */
  validFrom?: string | null;
  validUntil?: string | null;
  /** Back link */
  backHref: string;
  /** Related content */
  relatedBundles?: { id: string; name: string; slug: string; imageUrl: string | null; price: number | null }[];
  relatedBrochures?: { id: string; title: string; slug: string; thumbnailImageUrl: string | null; validUntil: string | null }[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-NA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ContentViewer({
  type,
  images,
  title,
  description,
  price,
  items,
  externalUrl,
  storeName,
  storeLogo,
  storeSlug,
  storeWhatsapp,
  storeWebsite,
  validFrom,
  validUntil,
  backHref,
  relatedBundles = [],
  relatedBrochures = [],
}: ContentViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[currentIndex] : null;
  const hasMultiple = images.length > 1;
  const itemsList = items ? items.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const hasRelated = relatedBundles.length > 0 || relatedBrochures.length > 0;

  function goNext() {
    if (currentIndex < images.length - 1) setCurrentIndex(currentIndex + 1);
  }
  function goPrev() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 bg-black/60 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={backHref}>
            <button className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            {storeLogo && (
              <img src={storeLogo} alt="" className="h-7 w-7 rounded-lg object-contain bg-white p-0.5 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{title}</p>
              <p className="text-white/50 text-xs truncate">{storeName}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasImages && (
            <button
              onClick={() => setZoomed(!zoomed)}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
            </button>
          )}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="h-9 px-3 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
          >
            {showInfo ? "Hide Info" : "Show Info"}
          </button>
        </div>
      </div>

      {/* Main image area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {currentImage ? (
          <img
            src={currentImage}
            alt={title}
            className={`max-h-full transition-transform duration-300 ${
              zoomed
                ? "max-w-none w-auto cursor-zoom-out scale-150"
                : "max-w-full object-contain cursor-zoom-in"
            }`}
            onClick={() => setZoomed(!zoomed)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-white/30">
            {type === "brochure" ? (
              <FileText className="h-16 w-16 mb-3" />
            ) : (
              <Package className="h-16 w-16 mb-3" />
            )}
            <p className="text-sm">No image available</p>
          </div>
        )}

        {/* Navigation arrows */}
        {hasMultiple && !zoomed && (
          <>
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex === images.length - 1}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white disabled:opacity-30 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image counter */}
        {hasMultiple && !zoomed && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {hasMultiple && !zoomed && (
        <div className="flex gap-2 px-4 py-3 bg-black/40 overflow-x-auto scrollbar-hide justify-center shrink-0">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-12 w-12 sm:h-14 sm:w-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                i === currentIndex ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-75"
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Info panel */}
      {showInfo && !zoomed && (
        <div className="bg-white border-t shrink-0 max-h-[45vh] overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4">
            {/* Title + price row */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">{title}</h1>
                {/* Validity */}
                {(validFrom || validUntil) && (
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {validFrom && validUntil
                      ? `${formatDate(validFrom)} – ${formatDate(validUntil)}`
                      : validUntil
                        ? `Valid until ${formatDate(validUntil)}`
                        : `From ${formatDate(validFrom!)}`}
                  </div>
                )}
              </div>
              {price != null && (
                <Badge className="text-base sm:text-lg font-bold px-3 py-1.5 rounded-xl bg-primary text-primary-foreground shrink-0">
                  {formatCurrency(price)}
                </Badge>
              )}
            </div>

            {/* Description */}
            {description && (
              <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
            )}

            {/* Items chips */}
            {itemsList.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {itemsList.map((item, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="rounded-lg text-xs px-2.5 py-1 bg-slate-100 text-slate-700"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {externalUrl && (
                <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                  <Button className="w-full rounded-xl h-10 text-sm font-semibold">
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    Visit Store
                  </Button>
                </a>
              )}
              {storeWhatsapp && (
                <Button
                  className="rounded-xl h-10 text-sm bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                  onClick={() => {
                    const msg = type === "bundle"
                      ? `Hi ${storeName}, I'm interested in the "${title}" bundle on MaDe Market!`
                      : `Hi ${storeName}, I saw your brochure "${title}" on MaDe Market!`;
                    window.open(generateWhatsAppLink(storeWhatsapp, msg), "_blank");
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-1.5" />
                  WhatsApp
                </Button>
              )}
              <Link href={`/store/${storeSlug}`} className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full rounded-xl h-10 text-sm">
                  <Store className="h-4 w-4 mr-1.5" />
                  View Store
                </Button>
              </Link>
            </div>

            {/* Related content */}
            {hasRelated && (
              <div className="pt-2 border-t">
                {relatedBrochures.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">More Brochures</p>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
                      {relatedBrochures.map((rb) => (
                        <Link
                          key={rb.id}
                          href={`/store/${storeSlug}/brochure/${rb.slug}`}
                          className="shrink-0 w-24 group"
                        >
                          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-slate-100 mb-1">
                            {rb.thumbnailImageUrl ? (
                              <img src={rb.thumbnailImageUrl} alt={rb.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileText className="h-5 w-5 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] font-medium text-slate-700 line-clamp-2 group-hover:text-primary transition-colors">{rb.title}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {relatedBundles.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">More Bundles</p>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
                      {relatedBundles.map((rb) => (
                        <Link
                          key={rb.id}
                          href={`/store/${storeSlug}/bundle/${rb.slug}`}
                          className="shrink-0 w-24 group"
                        >
                          <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-1">
                            {rb.imageUrl ? (
                              <img src={rb.imageUrl} alt={rb.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] font-medium text-slate-700 line-clamp-2 group-hover:text-primary transition-colors">{rb.name}</p>
                          {rb.price != null && (
                            <p className="text-[10px] font-bold text-primary">{formatCurrency(rb.price)}</p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
