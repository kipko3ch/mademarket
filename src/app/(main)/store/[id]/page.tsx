/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, use } from "react";
import { Store, MessageCircle, ArrowLeft, Search, Globe, MapPin, Package, FileText, Gift, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/products/product-card";
import { BundleCard, type BundleData } from "@/components/products/bundle-card";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import Link from "next/link";

interface BranchData {
  id: string;
  branchName: string;
  branchSlug: string;
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
  const [bundles, setBundles] = useState<BundleData[]>([]);
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
        // Fetch bundles
        const bundlesRes = await fetch(`/api/bundles?vendorId=${resolvedId}`);
        if (bundlesRes.ok) {
          const data = await bundlesRes.json();
          setBundles(data);
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
    b.products.map((p) => ({ ...p, branchName: b.branchName, branchTown: b.town }))
  ) || [];

  const filteredProducts = allProducts.filter((p) =>
    p.productName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 py-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-100 rounded-full w-24 mb-6" />
          <div className="h-64 bg-slate-50 rounded-[2.5rem] mb-12 shadow-sm" />

          <div className="mb-12">
            <div className="h-8 bg-slate-100 rounded-full w-48 mb-6" />
            <div className="flex gap-4 overflow-hidden -mx-3 px-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-[280px] sm:w-[320px] shrink-0 h-80 bg-slate-50 rounded-[2rem] border border-slate-100" />
              ))}
            </div>
          </div>

          <div className="space-y-12">
            {[1, 2].map(i => (
              <div key={i}>
                <div className="h-20 bg-slate-50 rounded-3xl mb-8 border border-slate-100" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {Array.from({ length: 12 }).map((_, j) => (
                    <div key={j} className="space-y-3">
                      <div className="aspect-square bg-slate-50 rounded-[2rem]" />
                      <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                      <div className="h-3 bg-slate-50 rounded-full w-1/2" />
                    </div>
                  ))}
                </div>
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

      {/* Conditional Content: Search Results or Default Sections */}
      {search ? (
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Found <span className="text-primary italic">{filteredProducts.length}</span> Results
              </h2>
              <p className="text-slate-500 text-sm mt-1">Showing all matches for &quot;{search}&quot;</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearch("")}
              className="rounded-xl text-xs font-bold text-slate-500 hover:text-primary transition-colors"
            >
              <X className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Clear Search
            </Button>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {filteredProducts.map((p) => (
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
          ) : (
            <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <Package className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No products found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                We couldn&apos;t find any products in this store that match your search. Try different keywords.
              </p>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Bundles Section */}
          {bundles.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center bg-amber-50 rounded-2xl">
                    <img src="/icons/bundle.png" alt="Bundles" className="h-6 w-6 object-contain" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl md:text-2xl text-slate-900 font-bold">Store Bundles</h2>
                    <p className="text-slate-500 text-xs sm:text-sm">Exclusive curated deals from the owner</p>
                  </div>
                </div>
              </div>
              <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
                {bundles.map((bundle) => (
                  <div key={bundle.id} className="w-[280px] sm:w-[320px] shrink-0">
                    <BundleCard bundle={bundle} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Brochures Section */}
          {brochures.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center bg-primary/5 rounded-2xl">
                    <img src="/icons/brochure.png" alt="Brochures" className="h-6 w-6 object-contain" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl md:text-2xl text-slate-900 font-bold">Brochures</h2>
                    <p className="text-slate-500 text-xs sm:text-sm">Latest catalogues and weekly leaflets</p>
                  </div>
                </div>
              </div>
              <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
                {brochures.map((b) => (
                  <Link key={b.id} href={`/store/${id}/brochure/${b.slug}`} className="flex flex-col w-[160px] sm:w-[220px] shrink-0 group cursor-pointer">
                    <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-white mb-3 transition-all duration-300 group-hover:scale-[1.02] border border-slate-100 shadow-sm group-hover:shadow-xl">
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
                        <p className="text-xs text-red-600 font-black flex items-center gap-1.5 mt-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                          Exp: {new Date(b.validUntil).toLocaleDateString("en-NA", { month: "short", day: "numeric" })}
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
            const branchProducts = branch.products;

            return (
              <section key={branch.id} className="mb-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <div>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">
                      {vendor.name} {branch.town ? `\u2013 ${branch.town}` : `\u2013 ${branch.branchName}`}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {branch.town && (
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {branch.town}{branch.region ? `, ${branch.region}` : ""}
                        </span>
                      )}
                      <div className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className="text-xs font-black text-primary">{branchProducts.length} Products Available</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {branch.whatsappNumber && (
                      <Button
                        size="sm"
                        className="rounded-xl px-5 py-5 text-xs font-black bg-[#25D366] hover:bg-[#128C7E] shadow-lg shadow-green-500/10 active:scale-95 transition-all flex-1 sm:flex-none"
                        onClick={() => {
                          window.open(
                            generateWhatsAppLink(branch.whatsappNumber!, `Hi ${vendor.name} ${branch.branchName}, I found your store on MaDe Market!`),
                            "_blank"
                          );
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                    )}
                  </div>
                </div>

                {branchProducts.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold text-sm">
                      No products listed for this branch yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
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
        </>
      )}

      {/* Global Search Bar Overlay */}
      {allProducts.length > 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                placeholder="Search products in this store..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-4 border border-slate-200 rounded-[1.25rem] bg-white/90 backdrop-blur-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
