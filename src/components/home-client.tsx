/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { ChevronRight, Store, ArrowRight, Diamond, TrendingUp, Package } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { LocationModal } from "@/components/location-modal";
import { BrochuresSection } from "@/components/brochures-section";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  imageUrl: string;
  bgColor: string | null;
}

interface StoreData {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  productCount: number;
}

interface ProductData {
  id: string;
  name: string;
  normalizedName: string;
  imageUrl: string | null;
  unit: string | null;
  categoryId: string | null;
  categoryName: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  storeCount: number;
}

interface FeaturedProductData extends ProductData {
  priority: "premium" | "standard";
}

interface BundleData {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  imageUrl: string | null;
  price: string;
  externalUrl: string | null;
  items: string | null;
  storeName: string;
  storeLogoUrl: string | null;
  storeId: string;
}

interface HomeClientProps {
  banners: Banner[];
  stores: StoreData[];
  products: ProductData[];
  featuredProducts?: FeaturedProductData[];
  popularProducts?: ProductData[];
  bundles?: BundleData[];
}

// ─── Fallback data ──────────────────────────────────────────────────────────

const FALLBACK_BANNERS: Banner[] = [
  {
    id: "f1",
    title: "Find the Best Grocery Prices in Namibia",
    subtitle: "Stop overpaying. Compare real-time prices from Shoprite, SPAR, Checkers, and more in one place.",
    ctaText: "Start Comparing",
    ctaUrl: "/products",
    imageUrl: "/images/Flag_map_of_Namibia.svg",
    bgColor: null,
  },
  {
    id: "f2",
    title: "Save up to 30% Weekly",
    subtitle: "Smart cart auto-picks the cheapest store combination for you.",
    ctaText: "Build Smart Cart",
    ctaUrl: "/products",
    imageUrl: "/images/save.png",
    bgColor: null,
  },
  {
    id: "f3",
    title: "Fresh Deals Every Day",
    subtitle: "Real-time prices updated daily from all major Namibian stores.",
    ctaText: "Browse Deals",
    ctaUrl: "/products",
    imageUrl: "/images/fresh.png",
    bgColor: null,
  },
];

const FALLBACK_STORES: StoreData[] = [
  { id: "f1", name: "Shoprite", slug: "shoprite", logoUrl: "/images/shoprite.jpeg", description: null, productCount: 0 },
  { id: "f2", name: "Checkers", slug: "checkers", logoUrl: "/images/checkers.png", description: null, productCount: 0 },
  { id: "f3", name: "SPAR", slug: "spar", logoUrl: "/images/spar.jpg", description: null, productCount: 0 },
  { id: "f4", name: "Choppies", slug: "choppies", logoUrl: "/images/choppies.png", description: null, productCount: 0 },
  { id: "f5", name: "Food Lover's", slug: "food-lovers", logoUrl: "/images/foodloversmarket.png", description: null, productCount: 0 },
  { id: "f6", name: "U-Save", slug: "usave", logoUrl: "/images/usave.png", description: null, productCount: 0 },
  { id: "f7", name: "Woermann Brock", slug: "wb", logoUrl: "/images/wb.jpeg", description: null, productCount: 0 },
  { id: "f8", name: "Namica", slug: "namica", logoUrl: "/images/namica.jpg", description: null, productCount: 0 },
];

// Store brand colors for the marquee letter icons
const STORE_COLORS: Record<string, string> = {
  "Shoprite": "bg-red-600",
  "Checkers": "bg-blue-700",
  "SPAR": "bg-green-600",
  "Choppies": "bg-yellow-500",
  "Food Lover's": "bg-green-700",
  "U-Save": "bg-red-500",
  "Woermann Brock": "bg-orange-600",
  "Namica": "bg-teal-600",
};

// ─── Main Component ─────────────────────────────────────────────────────────

export function HomeClient({ banners, stores, products, featuredProducts = [], popularProducts = [], bundles = [] }: HomeClientProps) {
  const displayBanners = banners.length > 0 ? banners : FALLBACK_BANNERS;
  const displayStores = stores.length > 0 ? stores : FALLBACK_STORES;
  // Only show featured products that admin has explicitly added
  const displayFeatured = featuredProducts;
  const dealProducts = products.slice(8, 12);

  const [recentlyViewed, setRecentlyViewed] = useState<ProductData[]>([]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recently_viewed");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setRecentlyViewed(parsed);
      }
    } catch { }
  }, []);

  return (
    <div className="bg-background text-foreground">
      <LocationModal />

      <main className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-10">

        {/* ═══════════════════════════════════════════════════════════
            § 1  HERO — Dark rounded card with gradient overlay
        ═══════════════════════════════════════════════════════════ */}
        <HeroCarousel banners={displayBanners} />

        {/* ═══════════════════════════════════════════════════════════
            § 2  RETAILER MARQUEE — White rounded container
        ═══════════════════════════════════════════════════════════ */}
        <section className="mb-8 sm:mb-16">
          <div className="text-center mb-4 sm:mb-8">
            <h3 className="text-primary text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold">
              Supported Retailers
            </h3>
          </div>
          <RetailerMarquee stores={displayStores} />
        </section>

        {/* ═══════════════════════════════════════════════════════════
            § 3  FEATURED PRODUCTS (Admin-Controlled)
        ═══════════════════════════════════════════════════════════ */}
        {displayFeatured.length > 0 && (
          <section className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <div>
                <h2 className="font-heading text-xl sm:text-2xl md:text-3xl text-slate-900">
                  Featured Deals
                </h2>
                <p className="text-slate-500 mt-0.5 sm:mt-1 text-xs sm:text-sm">
                  Hand-picked lowest prices today
                </p>
              </div>
              <Link
                href="/products"
                className="text-primary font-bold flex items-center gap-1 hover:underline text-xs sm:text-sm shrink-0"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {displayFeatured.map((p) => (
                <div key={p.id} className="relative">
                  {"priority" in p && (p as FeaturedProductData).priority === "premium" && (
                    <div className="absolute top-2 left-2 z-20 bg-amber-400 text-white p-1 rounded-lg shadow-lg">
                      <Diamond className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <ProductCard {...p} storeCount={Number(p.storeCount)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════
            § 3.5  RECENTLY VIEWED
        ═══════════════════════════════════════════════════════════ */}
        {recentlyViewed.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl md:text-2xl text-slate-900">
                Recently Viewed
              </h2>
              <button
                onClick={() => { localStorage.removeItem("recently_viewed"); setRecentlyViewed([]); }}
                className="text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {recentlyViewed.map((p) => (
                <div key={p.id} className="w-[200px] sm:w-[240px] shrink-0 snap-start">
                  <ProductCard {...p} storeCount={Number(p.storeCount)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════
            § 4  DEALS — Horizontal scroll
        ═══════════════════════════════════════════════════════════ */}
        {dealProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="font-heading text-xl md:text-2xl text-slate-900">Popular Deals</h2>
                <p className="text-slate-500 mt-1 text-sm">Products with the biggest price drops.</p>
              </div>
              <Link
                href="/products"
                className="shrink-0 text-sm font-bold text-primary hover:underline flex items-center gap-1"
              >
                View Deals
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {dealProducts.map((p) => (
                <div key={p.id} className="w-[220px] sm:w-[260px] shrink-0 snap-start">
                  <ProductCard {...p} storeCount={Number(p.storeCount)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════
            § 4.5  POPULAR PRODUCTS — Single horizontal row
        ═══════════════════════════════════════════════════════════ */}
        {popularProducts.length > 0 && (
          <section className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/trending.png" alt="Trending" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h2 className="font-heading text-lg sm:text-xl md:text-2xl text-slate-900">
                    Popular Right Now
                  </h2>
                  <p className="text-slate-500 text-[10px] sm:text-xs">Most searched & clicked products</p>
                </div>
              </div>
              <Link
                href="/products"
                className="text-primary font-bold flex items-center gap-1 hover:underline text-xs sm:text-sm shrink-0"
              >
                See All
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </div>
            <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-3 snap-x snap-mandatory scrollbar-hide -mx-3 px-3 sm:-mx-4 sm:px-4 md:mx-0 md:px-0">
              {popularProducts.map((p) => (
                <div key={p.id} className="w-[180px] sm:w-[220px] md:w-[240px] shrink-0 snap-start">
                  <ProductCard {...p} storeCount={Number(p.storeCount)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════
            § 4.7  BUNDLES — Store bundles with external redirect
        ═══════════════════════════════════════════════════════════ */}
        {bundles.length > 0 && (
          <BundleCarousel bundles={bundles} />
        )}

        {/* ═══════════════════════════════════════════════════════════
            § 5  BROCHURES
        ═══════════════════════════════════════════════════════════ */}
        <BrochuresSection />

        {/* ═══════════════════════════════════════════════════════════
            § 6  CTA SECTION — Two-card grid
        ═══════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-10 sm:mb-16">
          {/* Savings card */}
          <div className="bg-primary/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col justify-center border border-primary/10">
            <img src="/icons/wallet.png" alt="Savings" className="h-8 w-8 sm:h-12 sm:w-12 object-contain mb-3 sm:mb-4" />
            <h3 className="font-heading text-xl sm:text-2xl text-slate-900 mb-2 sm:mb-4">
              Save up to 30% monthly
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">
              Our users save an average of N$ 450 every month just by switching their store for basic essentials.
            </p>
            <Link href="/products">
              <span className="inline-flex items-center bg-primary text-white font-semibold px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 cursor-pointer">
                Build Your List
              </span>
            </Link>
          </div>

          {/* Smart Cart card */}
          <div className="bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden group">
            <div className="absolute inset-0 z-0 opacity-20 group-hover:scale-110 transition-transform duration-700">
              <img
                src="/images/namibia.svg"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10">
              <img src="/icons/smartcart.png" alt="Smart Cart" className="h-8 w-8 sm:h-12 sm:w-12 object-contain mb-3 sm:mb-4 brightness-0 invert" />
              <h3 className="font-heading text-xl sm:text-2xl mb-2 sm:mb-4">
                Smart Cart Technology
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">
                Upload your shopping list and we&apos;ll tell you which store combo gives you the absolute lowest total.
              </p>
              <Link href="/cart">
                <span className="inline-flex items-center bg-white text-primary font-semibold px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-sm hover:bg-slate-100 transition-colors cursor-pointer">
                  Try Smart Cart
                </span>
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

// ─── Hero Carousel ──────────────────────────────────────────────────────────

function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const next = useCallback(() => setCurrent((c) => (c + 1) % banners.length), [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [banners.length, next]);

  const b = banners[current];

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-8 sm:mb-12 md:-mx-8">
      <div className="relative min-h-[280px] sm:min-h-[380px] md:min-h-[460px] lg:min-h-[500px] flex items-center px-5 py-8 sm:px-8 sm:py-10 md:px-16 md:py-12 bg-slate-900 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={b.imageUrl}
            alt=""
            className="w-full h-full object-cover object-center opacity-40 sm:opacity-50 md:opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/70 sm:via-slate-900/50 to-slate-900/20 sm:to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-2xl w-full">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-white leading-[1.1] mb-3 sm:mb-4 md:mb-6">
            {b.title}
          </h2>

          {b.subtitle && (
            <p className="text-sm sm:text-base md:text-lg text-white/70 mb-5 sm:mb-6 md:mb-8 max-w-md leading-relaxed">
              {b.subtitle}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {b.ctaText && b.ctaUrl && (
              <Link href={b.ctaUrl}>
                <span className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 sm:px-7 sm:py-3 md:px-8 md:py-3.5 rounded-full text-sm sm:text-base hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 cursor-pointer">
                  {b.ctaText}
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            )}
            <Link href="/products">
              <span className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold px-5 py-2.5 sm:px-7 sm:py-3 md:px-8 md:py-3.5 rounded-full text-sm sm:text-base hover:bg-white/20 transition-all cursor-pointer">
                Browse Stores
              </span>
            </Link>
          </div>

          {/* Dots */}
          {banners.length > 1 && (
            <div className="flex items-center gap-2 mt-6 sm:mt-8 md:mt-10">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${current === i
                    ? "w-6 sm:w-8 h-1.5 sm:h-2 bg-primary"
                    : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/30 hover:bg-white/50"
                    }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Bundle Carousel ─────────────────────────────────────────────────────────

function BundleCarousel({ bundles }: { bundles: BundleData[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const visibleCount = typeof window !== "undefined" && window.innerWidth >= 768 ? 3 : typeof window !== "undefined" && window.innerWidth >= 640 ? 2 : 1;
  const totalPages = Math.ceil(bundles.length / visibleCount);

  useEffect(() => {
    if (isPaused || totalPages <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalPages);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, totalPages]);

  const visibleBundles = bundles.slice(
    activeIndex * visibleCount,
    activeIndex * visibleCount + visibleCount
  );

  return (
    <section className="mb-8 sm:mb-12">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/bundle.png" alt="Bundles" className="h-full w-full object-contain" />
          </div>
          <div>
            <h2 className="font-heading text-lg sm:text-xl md:text-2xl text-slate-900">
              Store Bundles
            </h2>
            <p className="text-slate-500 text-[10px] sm:text-xs">Curated bundles from top retailers</p>
          </div>
        </div>
        {/* Page indicators */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "transition-all duration-300 rounded-full",
                  i === activeIndex
                    ? "w-6 h-2 bg-primary"
                    : "w-2 h-2 bg-slate-200 hover:bg-slate-300"
                )}
              />
            ))}
          </div>
        )}
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {visibleBundles.map((bundle) => (
          <BundleCard key={bundle.id} bundle={bundle} />
        ))}
      </div>
    </section>
  );
}

// ─── Bundle Card ─────────────────────────────────────────────────────────────

function BundleCard({ bundle }: { bundle: BundleData }) {
  const itemsList = bundle.items ? bundle.items.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const href = bundle.slug && bundle.storeId
    ? `/store/${bundle.storeId}/bundle/${bundle.slug}`
    : bundle.externalUrl || "#";
  const isExternal = !bundle.slug && bundle.externalUrl;

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="w-full bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all group cursor-pointer"
    >
      {/* Bundle Image */}
      <div className="relative h-36 sm:h-44 bg-slate-50 overflow-hidden">
        {bundle.imageUrl ? (
          <img
            src={bundle.imageUrl}
            alt={bundle.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-50 to-slate-50">
            <Package className="h-10 w-10 text-violet-300" />
          </div>
        )}
        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-primary text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-full shadow-lg">
          {formatCurrency(Number(bundle.price))}
        </div>
      </div>

      {/* Bundle Info */}
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-2">
          {bundle.storeLogoUrl ? (
            <div className="h-5 w-5 rounded overflow-hidden bg-white border border-slate-100">
              <img src={bundle.storeLogoUrl} alt="" className="h-full w-full object-contain" />
            </div>
          ) : null}
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium">{bundle.storeName}</span>
        </div>
        <h4 className="font-bold text-sm sm:text-base text-slate-900 mb-1.5 line-clamp-1">{bundle.name}</h4>
        {bundle.description && (
          <p className="text-[10px] sm:text-xs text-slate-500 mb-2 line-clamp-2">{bundle.description}</p>
        )}
        {itemsList.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {itemsList.slice(0, 4).map((item, i) => (
              <span key={i} className="text-[9px] sm:text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {item}
              </span>
            ))}
            {itemsList.length > 4 && (
              <span className="text-[9px] sm:text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                +{itemsList.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── Retailer Marquee ───────────────────────────────────────────────────────

function RetailerMarquee({ stores }: { stores: StoreData[] }) {
  const unique = Array.from(new Map(stores.map(s => [s.id, s])).values());
  // Repeat enough times so the marquee never shows a visible gap/restart
  const repeatCount = unique.length <= 4 ? 4 : unique.length <= 8 ? 3 : 2;
  const doubled = Array.from({ length: repeatCount }, () => unique).flat();
  const isFallback = stores.length > 0 && stores[0].id.startsWith("f");

  // Scroll by 1/repeatCount of total width so it loops one set of unique stores
  const scrollPercent = `${(-100 / repeatCount).toFixed(2)}%`;
  const scrollDuration = `${unique.length * 4}s`;

  return (
    <div className="relative py-4 sm:py-6 bg-white overflow-hidden group/marquee">
      {/* Soft gradient fades on both sides for a smoother look */}
      <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

      <div
        className="flex w-fit animate-scroll items-center gap-8 sm:gap-16 md:gap-20 px-6 sm:px-12 hover:[animation-play-state:paused] will-change-transform"
        style={{ "--scroll-offset": scrollPercent, "--scroll-duration": scrollDuration } as React.CSSProperties}
      >
        {doubled.map((s, i) => {
          const href = isFallback ? "/products" : `/store/${s.id}`;
          const colorClass = STORE_COLORS[s.name] || "bg-slate-500";

          return (
            <Link
              key={`${s.id}-${i}`}
              href={href}
              className="flex-shrink-0 flex flex-col items-center gap-2.5 group transition-all duration-300"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center transition-all duration-300">
                {s.logoUrl ? (
                  <img
                    src={s.logoUrl}
                    alt={s.name}
                    className="max-h-full max-w-full object-contain transition-all duration-500"
                  />
                ) : (
                  <div className={`w-full h-full ${colorClass} rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-xl`}>
                    {s.name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">
                {s.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
