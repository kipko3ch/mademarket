"use client";

import { useEffect, useState } from "react";
import { useSaved } from "@/hooks/use-saved";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { productUrl } from "@/lib/utils";
import Link from "next/link";

interface ProductInfo {
  id: string;
  name: string;
  imageUrl: string | null;
  minPrice: number | null;
  storeCount: number;
}

export default function SavedPage() {
  const toggleSaved = useSaved((s) => s.toggleSaved);
  const savedIds = useSaved((s) => s.savedIds);
  const clearAll = useSaved((s) => s.clearAll);
  const hasHydrated = useSaved((s) => s._hasHydrated);

  const addItem = useCart((s) => s.addItem);
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      if (!hasHydrated || savedIds.length === 0) {
        setProducts([]);
        return;
      }
      setFetching(true);
      try {
        const res = await fetch("/api/products?pageSize=100");
        if (res.ok) {
          const data = await res.json();
          const saved = (data.data as ProductInfo[]).filter((p) =>
            savedIds.includes(p.id)
          );
          setProducts(saved);
        }
      } catch { }
      setFetching(false);
    }
    fetchProducts();
  }, [hasHydrated, savedIds]);

  if (!hasHydrated || (savedIds.length === 0 && !fetching)) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6 p-4">
          <img src="/icons/nosaveditems.png" alt="No Items" className="max-h-full max-w-full object-contain" />
        </div>
        <h1 className="text-2xl font-bold mb-2">No saved items</h1>
        <p className="text-muted-foreground mb-6">
          Save products to track prices and quickly add them to your cart
        </p>
        <Link href="/products">
          <Button className="rounded-xl">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Saved Items</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {savedIds.length} {savedIds.length === 1 ? "item" : "items"} saved
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={clearAll}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      {fetching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-muted rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-2xl border bg-card p-4 card-shadow"
            >
              <Link
                href={productUrl(product.id, product.name)}
                className="h-16 w-16 rounded-xl bg-muted shrink-0 overflow-hidden"
              >
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center p-2">
                    <img src="/icons/productplaceholder.png" alt="Loc" className="max-h-full max-w-full object-contain opacity-50" />
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={productUrl(product.id, product.name)}>
                  <p className="font-medium text-sm truncate hover:text-primary transition-colors">
                    {product.name}
                  </p>
                </Link>
                <p className="text-sm font-bold mt-0.5">
                  {product.minPrice
                    ? formatCurrency(product.minPrice)
                    : "No price"}
                </p>
                <Badge variant="secondary" className="text-[10px] mt-1">
                  {product.storeCount}{" "}
                  {product.storeCount === 1 ? "store" : "stores"}
                </Badge>
              </div>
              <div className="flex flex-col gap-1.5">
                <Button
                  size="icon"
                  className="h-8 w-8 rounded-lg group/cart"
                  onClick={() => addItem(product.id, product.name, product.imageUrl)}
                >
                  <img src="/icons/cart.png" alt="Cart" className="h-3.5 w-3.5 object-contain brightness-0 invert group-hover/cart:opacity-80 transition-opacity" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-lg text-destructive"
                  onClick={() => toggleSaved(product.id)}
                >
                  <Heart className="h-3.5 w-3.5 fill-current" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
