/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, use } from "react";
import { Store, MessageCircle, ArrowLeft, Search, Globe, MapPin, Package, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/products/product-card";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import Link from "next/link";

interface BranchData {
  id: string;
  branchName: string;
  branchSlug: string;
  city: string | null;
  area: string | null;
  town: string | null;
  region: string | null;
  address: string | null;
  whatsappNumber: string | null;
  products: BranchProductData[];
}

interface VendorData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  websiteUrl: string | null;
  branches: BranchData[];
  totalProductCount: number;
}

interface BranchProductData {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  unit: string | null;
  price: string;
  bundleInfo: string | null;
  inStock: boolean;
}

interface BrochureData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailImageUrl: string | null;
  bannerImageUrl: string | null;
  validFrom: string | null;
  validUntil: string | null;
  vendorName: string;
  vendorSlug: string;
  vendorLogo: string | null;
}

export default function StoreProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [brochures, setBrochures] = useState<BrochureData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchVendor() {
      try {
        // Fetch vendor by slug or id — the API resolves both
        const vendorRes = await fetch(`/api/vendors/${id}`);
        if (!vendorRes.ok) return;

        const vendorData = await vendorRes.json();
        setVendor(vendorData);

        // Use resolved vendor id for brochure fetches
        const resolvedId = vendorData.id;
        const brochuresRes = await fetch(`/api/brochures?vendorId=${resolvedId}`);
        if (brochuresRes.ok) {
          const data = await brochuresRes.json();
          setBrochures(Array.isArray(data) ? data : data.brochures || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchVendor();
  }, [id]);

  // Collect all products across all branches for filtering
  const allProducts = vendor?.branches.flatMap((b) =>
    b.products.map((p) => ({ ...p, branchName: b.branchName, branchTown: b.city || b.town }))
  ) || [];

  const filteredProducts = allProducts.filter((p) =>
    p.productName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 py-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-24 mb-6" />
          <div className="h-48 sm:h-64 bg-slate-100 rounded-2xl mb-6" />
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-xl bg-slate-200" />
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-slate-200 rounded w-48" />
              <div className="h-4 bg-slate-200 rounded w-72" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-square bg-slate-100 rounded-2xl" />
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 py-16 text-center">
        <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Store className="h-10 w-10 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Vendor not found</h1>
        <p className="text-slate-500 text-sm mb-4">This vendor may not exist or hasn&apos;t been approved yet.</p>
        <Link href="/">
          <Button variant="outline" className="rounded-xl">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6">
      {/* Back link */}
      <Link
        href="/"
        className="group inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-4 sm:mb-6 transition-all"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 group-hover:bg-primary group-hover:text-white transition-all">
          <ArrowLeft className="h-4 w-4" />
        </div>
        <span className="font-medium">Home</span>
      </Link>

      {/* Vendor Banner + Header */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-8">
        {/* Banner Image */}
        <div className="relative h-40 sm:h-56 md:h-72 bg-gradient-to-r from-primary/10 via-primary/5 to-slate-50">
          {vendor.bannerUrl ? (
            <img
              src={vendor.bannerUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-slate-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/30 to-transparent" />
        </div>

        {/* Vendor Info Overlay */}
        <div className="relative -mt-16 sm:-mt-20 px-4 sm:px-6 md:px-8 pb-5 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-5">
            {/* Logo */}
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-4 border-white shadow-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
              {vendor.logoUrl ? (
                <img src={vendor.logoUrl} alt={vendor.name} className="h-full w-full object-contain p-2" />
              ) : (
                <Store className="h-10 w-10 text-slate-400" />
              )}
            </div>

            {/* Name & Meta */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{vendor.name}</h1>
              {vendor.description && (
                <p className="text-slate-600 text-xs sm:text-sm mt-1 line-clamp-2 max-w-xl">{vendor.description}</p>
              )}
              <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
                <Badge variant="secondary" className="rounded-lg bg-primary/10 text-primary border-0 text-xs font-semibold">
                  <Package className="h-3 w-3 mr-1" />
                  {allProducts.length} Products
                </Badge>
                <Badge variant="secondary" className="rounded-lg bg-slate-100 text-slate-600 border-0 text-xs font-semibold">
                  <MapPin className="h-3 w-3 mr-1" />
                  {vendor.branches.length} {vendor.branches.length === 1 ? "Branch" : "Branches"}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 mt-2 sm:mt-0">
              {vendor.websiteUrl && (
                <a href={vendor.websiteUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="rounded-xl text-xs sm:text-sm h-9 sm:h-10">
                    <Globe className="h-4 w-4 mr-1.5" />
                    Website
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Brochures Section */}
      {brochures.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 flex items-center justify-center">
                <img src="/icons/brochure.png" alt="Brochures" className="h-full w-full object-contain" />
              </div>
              <div>
                <h2 className="font-heading text-lg sm:text-xl md:text-2xl text-slate-900">Brochures</h2>
                <p className="text-slate-500 text-xs sm:text-sm">Latest catalogues and weekly leaflets</p>
              </div>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
            {brochures.map((b) => (
              <Link key={b.id} href={`/store/${id}/brochure/${b.slug}`} className="flex flex-col w-[160px] sm:w-[220px] shrink-0 group cursor-pointer">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white mb-3 transition-all duration-300 group-hover:scale-[1.02] border border-slate-100">
                  {b.thumbnailImageUrl || b.bannerImageUrl ? (
                    <img src={b.thumbnailImageUrl || b.bannerImageUrl!} alt={b.title} className="w-full h-full object-cover transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                      <FileText className="h-10 w-10 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">{b.title}</h3>
                  {b.validUntil && (
                    <p className="text-xs text-red-600 font-medium">
                      Expires {new Date(b.validUntil).toLocaleDateString("en-NA", { month: "short", day: "numeric" })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Branch Sections */}
      {vendor.branches.map((branch) => {
        const branchProducts = branch.products.filter((p) =>
          p.productName.toLowerCase().includes(search.toLowerCase())
        );

        return (
          <section key={branch.id} className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h2 className="font-heading text-lg sm:text-xl text-slate-900">
                  <span className="text-primary">{branch.branchName}</span>
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {(branch.city || branch.area || branch.town) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      <MapPin className="h-3 w-3" />
                      {[branch.city || branch.town, branch.area].filter(Boolean).join(", ")}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">{branchProducts.length} products</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {branch.whatsappNumber && (
                  <Button
                    size="sm"
                    className="rounded-xl text-xs h-8 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      window.open(
                        generateWhatsAppLink(branch.whatsappNumber!, `Hi ${vendor.name} ${branch.branchName}, I found your store on MaDe Market!`),
                        "_blank"
                      );
                    }}
                  >
                    <MessageCircle className="h-3.5 w-3.5 mr-1" />
                    WhatsApp
                  </Button>
                )}
              </div>
            </div>

            {branchProducts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 font-medium text-sm">
                  {search ? "No products match your search in this branch" : "No products listed yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {branchProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.productId}
                    name={p.productName}
                    imageUrl={p.productImage}
                    categoryName={null}
                    unit={p.unit}
                    minPrice={Number(p.price)}
                    maxPrice={null}
                    storeCount={1}
                    storeName={vendor.name}
                    storeLogo={vendor.logoUrl}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}

      {/* Global Search Bar */}
      {allProducts.length > 4 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search products across all branches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent shadow-xl transition-all outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
