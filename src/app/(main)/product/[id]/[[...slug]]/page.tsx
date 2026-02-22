/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, use } from "react";
import {
  Heart,
  Bell,
  Store,
  TrendingDown,
  Check,
  ArrowLeft,
  ExternalLink,
  ShoppingCart,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoreLogo } from "@/components/store-logo";
import { useCart } from "@/hooks/use-cart";
import { useSaved } from "@/hooks/use-saved";
import { formatCurrency } from "@/lib/currency";
import { cn, productUrl } from "@/lib/utils";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface StorePrice {
  storeId: string;
  storeName: string;
  storeLogo: string | null;
  storeAddress: string | null;
  storeWebsite: string | null;
  price: number;
  inStock: boolean;
  externalUrl: string | null;
}

interface ProductDetail {
  id: string;
  name: string;
  imageUrl: string | null;
  categoryName: string | null;
  unit: string | null;
  brand: string | null;
  size: string | null;
  description: string | null;
}

interface RelatedProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  categoryName: string | null;
  unit: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  storeCount: number;
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string; slug?: string[] }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [storePrices, setStorePrices] = useState<StorePrice[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertSet, setAlertSet] = useState(false);

  const addItem = useCart((s) => s.addItem);
  const toggleSaved = useSaved((s) => s.toggleSaved);
  const isSavedInStore = useSaved((s) => s.savedIds.includes(id));
  const hasHydrated = useSaved((s) => s._hasHydrated);
  const { status } = useSession();
  const router = useRouter();

  const saved = hasHydrated ? isSavedInStore : false;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/products/${id}/prices`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();

        setProduct(data.product);
        setStorePrices(data.prices);

        // Update recently viewed
        if (typeof window !== "undefined" && data.product) {
          const stored = localStorage.getItem("recently_viewed");
          let list = stored ? JSON.parse(stored) : [];
          list = list.filter((p: { id: string }) => p.id !== data.product.id);
          list.unshift({
            id: data.product.id,
            name: data.product.name,
            imageUrl: data.product.imageUrl,
            categoryName: data.product.categoryName,
            unit: data.product.unit,
            minPrice: data.prices[0]?.price ?? null,
            maxPrice: data.prices.length > 1 ? data.prices[data.prices.length - 1].price : null,
            storeCount: data.prices.length,
          });
          list = list.slice(0, 10);
          localStorage.setItem("recently_viewed", JSON.stringify(list));
        }

        // Fetch related products
        if (data.product?.categoryName) {
          try {
            const relRes = await fetch(`/api/products?pageSize=8&category=${encodeURIComponent(data.product.categoryName)}`);
            if (relRes.ok) {
              const relData = await relRes.json();
              setRelatedProducts(
                (relData.data || []).filter((p: RelatedProduct) => p.id !== data.product.id).slice(0, 6)
              );
            }
          } catch { }
        }
      } catch { }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-2xl animate-pulse" />
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-32" />
            <div className="h-40 bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-5xl px-4 md:px-8 py-16 text-center">
        <img src="/icons/productplaceholder.png" alt="Not found" className="h-24 w-auto mx-auto mb-4 opacity-50" />
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link href="/products">
          <Button variant="outline" className="mt-4 rounded-xl">
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  const cheapestPrice = storePrices.length > 0 ? storePrices[0].price : null;
  const mostExpensive = storePrices.length > 1 ? storePrices[storePrices.length - 1].price : null;

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-6">
      {/* Back nav */}
      <Link
        href="/products"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* Product Image */}
        <div className="aspect-square rounded-2xl bg-white border border-slate-200 overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-6" />
          ) : (
            <div className="h-full w-full flex items-center justify-center p-20">
              <img
                src="/icons/productplaceholder.png"
                alt="Placeholder"
                className="max-h-full max-w-full object-contain opacity-50"
              />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {product.categoryName && (
              <Badge variant="secondary" className="rounded-lg text-xs">{product.categoryName}</Badge>
            )}
            {product.brand && (
              <Badge variant="outline" className="rounded-lg text-xs">{product.brand}</Badge>
            )}
            {product.size && (
              <Badge variant="outline" className="rounded-lg text-xs">{product.size}</Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="font-heading text-2xl md:text-3xl text-slate-900 leading-tight">{product.name}</h1>

          {product.description && (
            <p className="text-sm text-slate-500 leading-relaxed">{product.description}</p>
          )}

          {product.unit && !product.size && (
            <p className="text-sm text-slate-400">per {product.unit}</p>
          )}

          {/* Price + Actions */}
          {cheapestPrice && (
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-primary">{formatCurrency(cheapestPrice)}</span>
              {mostExpensive && mostExpensive > cheapestPrice && (
                <span className="text-lg text-slate-400 line-through">{formatCurrency(mostExpensive)}</span>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1 h-11 rounded-xl text-sm font-bold"
              onClick={() => {
                if (status !== "authenticated") {
                  toast.error("Please sign in to add items to your cart", {
                    action: { label: "Sign In", onClick: () => router.push("/login") },
                  });
                  return;
                }
                addItem(id, product.name, product.imageUrl);
                toast.success("Added to cart");
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn("h-11 w-11 rounded-xl", saved && "border-red-300 bg-red-50 text-red-500")}
              onClick={() => toggleSaved(id)}
            >
              <Heart className={cn("h-5 w-5", saved && "fill-current")} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn("h-11 w-11 rounded-xl", alertSet && "border-primary bg-accent text-primary")}
              onClick={() => setAlertSet(!alertSet)}
            >
              <Bell className={cn("h-5 w-5", alertSet && "fill-current")} />
            </Button>
          </div>

          {alertSet && (
            <p className="text-xs text-primary flex items-center gap-1">
              <Check className="h-3 w-3" />
              You&apos;ll be notified when the price drops
            </p>
          )}
        </div>
      </div>

      {/* ═══ WHERE TO BUY ══════════════════════════ */}
      <section className="mt-8 sm:mt-12">
        <h2 className="font-heading text-lg sm:text-xl text-slate-900 mb-1">Where To Buy</h2>
        <p className="text-xs text-slate-400 mb-4">
          {storePrices.length > 0
            ? `Available at ${storePrices.length} ${storePrices.length === 1 ? "store" : "stores"} — sorted by lowest price`
            : "No stores currently stock this product"}
        </p>

        <div className="space-y-2">
          {storePrices.map((sp, idx) => {
            const isCheapest = idx === 0 && storePrices.length > 1;
            const savings = cheapestPrice && sp.price > cheapestPrice ? sp.price - cheapestPrice : 0;
            const redirectUrl = sp.externalUrl || sp.storeWebsite;

            return (
              <div
                key={sp.storeId}
                className={cn(
                  "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border bg-white transition-all",
                  isCheapest ? "border-green-200 bg-green-50/30" : "border-slate-200 hover:border-slate-300"
                )}
              >
                {/* Store Logo */}
                <Link href={`/store/${sp.storeId}`} className="shrink-0">
                  <StoreLogo src={sp.storeLogo} name={sp.storeName} size="md" />
                </Link>

                {/* Store Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/store/${sp.storeId}`} className="font-bold text-sm text-slate-900 hover:text-primary transition-colors">
                      {sp.storeName}
                    </Link>
                    {isCheapest && (
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <TrendingDown className="h-2.5 w-2.5" />
                        Cheapest
                      </span>
                    )}
                    {savings > 0 && (
                      <span className="text-[10px] text-red-500 font-medium">
                        +{formatCurrency(savings)} more
                      </span>
                    )}
                  </div>
                  {sp.storeAddress && (
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{sp.storeAddress}</p>
                  )}
                </div>

                {/* Price + Link */}
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <p className={cn("text-lg font-black", isCheapest ? "text-green-700" : "text-slate-900")}>
                    {formatCurrency(sp.price)}
                  </p>
                  <p className={cn("text-[10px] font-medium", sp.inStock ? "text-green-600" : "text-red-500")}>
                    {sp.inStock ? "In Stock" : "Out of Stock"}
                  </p>
                  {redirectUrl && (
                    <a
                      href={redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                    >
                      Go to Store <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {storePrices.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Store className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No stores currently sell this product</p>
            </div>
          )}
        </div>

        {/* Savings summary */}
        {storePrices.length > 1 && cheapestPrice && mostExpensive && mostExpensive > cheapestPrice && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm font-medium text-green-800">
              Cheapest at <strong>{storePrices[0].storeName}</strong> — Save {formatCurrency(mostExpensive - cheapestPrice)} vs most expensive
            </p>
          </div>
        )}
      </section>

      {/* ═══ GOOD TO KNOW ═════════════════════════ */}
      {(product.brand || product.size || product.unit) && (
        <section className="mt-8 sm:mt-10">
          <h2 className="font-heading text-lg sm:text-xl text-slate-900 mb-3">Good to know</h2>
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            {product.brand && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Brand</span>
                <span className="font-medium text-slate-900">{product.brand}</span>
              </div>
            )}
            {product.size && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Size</span>
                <span className="font-medium text-slate-900">{product.size}</span>
              </div>
            )}
            {product.unit && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Unit</span>
                <span className="font-medium text-slate-900">{product.unit}</span>
              </div>
            )}
            {product.categoryName && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Category</span>
                <span className="font-medium text-slate-900">{product.categoryName}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══ RELATED PRODUCTS ═════════════════════ */}
      {relatedProducts.length > 0 && (
        <section className="mt-8 sm:mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg sm:text-xl text-slate-900">Related Products</h2>
            <Link href={`/products?category=${product.categoryName || ""}`} className="text-xs font-bold text-primary hover:underline">
              See All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((rp) => (
              <Link
                key={rp.id}
                href={productUrl(rp.id, rp.name)}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-primary/20 hover:shadow-md transition-all group"
              >
                <div className="aspect-square bg-slate-50 overflow-hidden p-4">
                  {rp.imageUrl ? (
                    <img src={rp.imageUrl} alt={rp.name} className="h-full w-full object-contain group-hover:scale-105 transition-transform" loading="lazy" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <img src="/icons/productplaceholder.png" alt="" className="h-1/2 w-1/2 object-contain opacity-30" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 leading-snug mb-1">{rp.name}</h4>
                  {rp.storeCount > 0 && (
                    <p className="text-[10px] text-slate-400 mb-1">{rp.storeCount} {rp.storeCount === 1 ? "store" : "stores"}</p>
                  )}
                  {rp.minPrice && (
                    <p className="text-sm font-black text-primary">{formatCurrency(rp.minPrice)}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
