"use client";

import { useEffect, useState, use } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentViewer } from "@/components/content-viewer";
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
  }, [slug, notFound]);

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

  // Collect all images (banner + thumbnail if different)
  const images: string[] = [];
  if (brochure.bannerImageUrl) images.push(brochure.bannerImageUrl);
  if (brochure.thumbnailImageUrl && brochure.thumbnailImageUrl !== brochure.bannerImageUrl) {
    images.push(brochure.thumbnailImageUrl);
  }

  return (
    <ContentViewer
      type="brochure"
      images={images}
      title={brochure.title}
      description={brochure.description}
      storeName={brochure.storeName}
      storeLogo={brochure.storeLogo}
      storeSlug={id}
      storeWhatsapp={brochure.branchWhatsapp}
      storeWebsite={brochure.vendorWebsiteUrl}
      validFrom={brochure.validFrom}
      validUntil={brochure.validUntil}
      backHref={`/store/${id}`}
      relatedBrochures={relatedBrochures.map((rb) => ({
        ...rb,
        validUntil: rb.validUntil,
      }))}
    />
  );
}
