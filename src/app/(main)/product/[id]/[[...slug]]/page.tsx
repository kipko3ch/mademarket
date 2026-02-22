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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StoreLogo } from "@/components/store-logo";
import { useCart } from "@/hooks/use-cart";
import { useSaved } from "@/hooks/use-saved";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string; slug?: string[] }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [storePrices, setStorePrices] = useState<StorePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertSet, setAlertSet] = useState(false);

  const addItem = useCart((s) => s.addItem);
  const toggleSaved = useSaved((s) => s.toggleSaved);
  const isSavedInStore = useSaved((s) => s.savedIds.includes(id));
  const hasHydrated = useSaved((s) => s._hasHydrated);

  // Only show saved state if hydrated to prevent mismatch
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
      } catch { }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 text-center">
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
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
      <Link
        href="/products"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square rounded-2xl bg-muted/30 border overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
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
        <div className="space-y-6">
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

          <h1 className="text-2xl md:text-3xl font-bold leading-tight">{product.name}</h1>

          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          {product.unit && !product.size && (
            <p className="text-sm text-muted-foreground">per {product.unit}</p>
          )}

          {cheapestPrice && (
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">{formatCurrency(cheapestPrice)}</span>
              {mostExpensive && mostExpensive > cheapestPrice && (
                <span className="text-lg text-muted-foreground line-through">{formatCurrency(mostExpensive)}</span>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button className="flex-1 h-12 rounded-xl text-sm" onClick={() => addItem(id)}>
              <img src="/icons/cart.png" alt="Cart" className="h-4 w-4 mr-2 object-contain brightness-0 invert" />
              Add to Cart
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn("h-12 w-12 rounded-xl", saved && "border-red-300 bg-red-50 text-red-500")}
              onClick={() => toggleSaved(id)}
            >
              <Heart className={cn("h-5 w-5", saved && "fill-current")} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn("h-12 w-12 rounded-xl", alertSet && "border-primary bg-accent text-primary")}
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

          <Separator />

          {/* Store price comparison */}
          <div>
            <h2 className="text-lg font-semibold mb-1">
              Compare Prices
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              {storePrices.length > 0
                ? `Available at ${storePrices.length} ${storePrices.length === 1 ? "store" : "stores"} — sorted by lowest price`
                : "No stores currently stock this product"}
            </p>
            <div className="space-y-2.5">
              {storePrices.map((sp, idx) => {
                const isCheapest = idx === 0 && storePrices.length > 1;
                const savings = cheapestPrice && sp.price > cheapestPrice
                  ? sp.price - cheapestPrice
                  : 0;
                const redirectUrl = sp.externalUrl || sp.storeWebsite;

                return (
                  <Card key={sp.storeId} className={cn("overflow-hidden hover:shadow-md transition-shadow", isCheapest && "border-green-300 bg-green-50/50")}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <Link href={`/store/${sp.storeId}`}>
                        <StoreLogo src={sp.storeLogo} name={sp.storeName} size="md" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/store/${sp.storeId}`} className="font-medium text-sm hover:text-primary transition-colors">
                            {sp.storeName}
                          </Link>
                          {isCheapest && (
                            <Badge className="bg-green-600 text-white text-[10px] px-1.5 py-0">
                              <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
                              Cheapest
                            </Badge>
                          )}
                          {savings > 0 && (
                            <span className="text-[10px] text-red-500 font-medium">
                              +{formatCurrency(savings)} more
                            </span>
                          )}
                        </div>
                        {sp.storeAddress && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <img src="/icons/location.png" alt="Loc" className="h-3 w-3 object-contain opacity-50" />
                            {sp.storeAddress}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                        <p className={cn("text-lg font-bold", isCheapest ? "text-green-700" : "text-foreground")}>
                          {formatCurrency(sp.price)}
                        </p>
                        <p className={cn("text-[10px]", sp.inStock ? "text-green-600" : "text-red-500")}>
                          {sp.inStock ? "In Stock" : "Out of Stock"}
                        </p>
                        {redirectUrl && (
                          <a
                            href={redirectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                          >
                            Go to Store <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {storePrices.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  <Store className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  No stores currently sell this product
                </p>
              )}
            </div>

            {/* Savings summary */}
            {storePrices.length > 1 && cheapestPrice && mostExpensive && mostExpensive > cheapestPrice && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm font-medium text-green-800">
                  Cheapest at {storePrices[0].storeName} — Save {formatCurrency(mostExpensive - cheapestPrice)} vs most expensive
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
