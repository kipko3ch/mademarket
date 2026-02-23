"use client";

import { useEffect, useState, use } from "react";
import { Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentViewer } from "@/components/content-viewer";
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

        // If bundle has an external URL, redirect directly
        if (bundleData?.externalUrl) {
          setRedirecting(true);
          window.location.href = bundleData.externalUrl;
          return;
        }

        setBundle(bundleData);
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

  if (loading || redirecting) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
        {redirecting && (
          <p className="text-white/60 text-sm">Redirecting to store...</p>
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

  // Collect all images: main image + bundleImages
  const images: string[] = [];
  if (bundle.imageUrl) images.push(bundle.imageUrl);
  if (bundle.bundleImages) {
    for (const bi of bundle.bundleImages) {
      if (bi.imageUrl !== bundle.imageUrl) {
        images.push(bi.imageUrl);
      }
    }
  }

  return (
    <ContentViewer
      type="bundle"
      images={images}
      title={bundle.name}
      description={bundle.description}
      price={bundle.price}
      items={bundle.items}
      externalUrl={bundle.externalUrl}
      storeName={bundle.storeName}
      storeLogo={bundle.storeLogo}
      storeSlug={id}
      storeWhatsapp={bundle.storeWhatsapp}
      storeWebsite={bundle.storeWebsite}
      backHref={`/store/${id}`}
      relatedBundles={relatedBundles}
      relatedBrochures={relatedBrochures.map((rb) => ({
        ...rb,
        validUntil: rb.validUntil,
      }))}
    />
  );
}
