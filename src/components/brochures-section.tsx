"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";

interface BrochureItem {
  id: string;
  title: string;
  slug: string;
  thumbnailImageUrl: string | null;
  bannerImageUrl: string | null;
  validFrom: string | null;
  validUntil: string | null;
  storeName: string;
  storeSlug: string;
  storeLogo: string | null;
  storeId: string;
}

export function BrochuresSection() {
  const [brochures, setBrochures] = useState<BrochureItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBrochures() {
      try {
        const res = await fetch("/api/brochures");
        if (res.ok) {
          const data = await res.json();
          setBrochures(data.brochures || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchBrochures();
  }, []);

  // Don't render section if no brochures and not loading
  if (!loading && brochures.length === 0) return null;

  return (
    <section className="mb-8 sm:mb-12">
      <div className="flex items-center justify-between mb-5 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/brochure.png" alt="Brochures" className="h-full w-full object-contain" />
          </div>
          <div>
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl text-slate-900">
              <span className="highlighter text-red-600">Store</span> Brochures
            </h2>
            <p className="text-slate-500 mt-0.5 sm:mt-1 text-xs sm:text-sm">
              Browse the latest weekly catalogue leaflets directly.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex overflow-x-auto gap-4 sm:gap-8 pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col w-[160px] sm:w-[220px] shrink-0 animate-pulse">
              <div className="aspect-[3/4] rounded-2xl bg-slate-100 mb-4" />
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-4 sm:gap-8 pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {brochures.map((b) => (
            <Link
              key={b.id}
              href={`/store/${b.storeId}/brochure/${b.slug}`}
              className="flex flex-col w-[160px] sm:w-[220px] shrink-0 group cursor-pointer"
            >
              {/* Image Container */}
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white mb-4 transition-all duration-300 group-hover:scale-[1.02] border border-slate-100">
                {b.thumbnailImageUrl || b.bannerImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.thumbnailImageUrl || b.bannerImageUrl!}
                    alt={b.title}
                    className="w-full h-full object-cover transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50">
                    <FileText className="h-10 w-10 text-slate-300" />
                  </div>
                )}
              </div>

              {/* Text below */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {b.storeLogo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.storeLogo} alt="" className="h-4 w-4 rounded object-contain" />
                  )}
                  <span className="text-[10px] text-slate-400 font-medium">{b.storeName}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {b.title}
                </h3>
                {b.validUntil && (
                  <p className="text-xs text-red-600 font-medium">
                    Expires {new Date(b.validUntil).toLocaleDateString("en-NA", { month: "short", day: "numeric" })}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
