/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useSaved } from "@/hooks/use-saved";
import { formatCurrency } from "@/lib/currency";
import { cn, productUrl } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl: string | null;
  categoryName: string | null;
  unit: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  storeCount: number;
  sponsored?: boolean;
  storeLogo?: string | null;
  storeName?: string | null;
}

export function ProductCard({
  id,
  name,
  imageUrl,
  categoryName,
  unit,
  minPrice,
  maxPrice,
  storeCount,
  sponsored,
  storeLogo,
  storeName,
}: ProductCardProps) {
  const addItem = useCart((s) => s.addItem);
  const toggleSaved = useSaved((s) => s.toggleSaved);
  const isSavedInStore = useSaved((s) => s.savedIds.includes(id));
  const hasHydrated = useSaved((s) => s._hasHydrated);

  const saved = hasHydrated ? isSavedInStore : false;

  return (
    <div className="group bg-white border border-primary/5 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      {/* Image */}
      <Link
        href={productUrl(id, name)}
        onClick={() => { fetch(`/api/products/${id}/click`, { method: "POST" }).catch(() => {}); }}
        className="relative block mb-2.5 sm:mb-4 aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-slate-50"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-contain p-3 sm:p-4 group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full p-6">
            <img
              src="/icons/productplaceholder.png"
              alt="Placeholder"
              className="max-h-[60%] max-w-[60%] object-contain opacity-50"
            />
          </div>
        )}

        {/* Sponsored badge */}
        {sponsored && (
          <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-amber-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 rounded-full z-10">
            Sponsored
          </span>
        )}

        {/* Like button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaved(id);
          }}
          className={cn(
            "absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1.5 sm:p-2 rounded-full shadow-sm transition-colors z-10",
            saved
              ? "bg-red-500 text-white"
              : "bg-white/80 backdrop-blur text-slate-400 hover:text-red-500"
          )}
        >
          <Heart className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", saved && "fill-current")} />
        </button>
      </Link>

      {/* Product info */}
      <div className="space-y-0.5 sm:space-y-1 mb-2.5 sm:mb-4">
        <Link href={productUrl(id, name)}>
          <h4 className="font-semibold text-xs sm:text-sm text-slate-800 truncate group-hover:text-primary transition-colors">
            {name}
          </h4>
        </Link>
        {storeCount > 0 && (
          <span className="text-[10px] sm:text-xs text-slate-500 block">
            {storeCount} {storeCount === 1 ? "store" : "stores"}
          </span>
        )}
      </div>

      {/* Price + cart row */}
      <div className="flex items-end justify-between">
        <div>
          {minPrice ? (
            <>
              <p className="text-[8px] sm:text-[10px] uppercase font-bold text-primary/60 leading-none">
                {storeCount > 1 ? "From" : "Price"}
              </p>
              <p className="text-lg sm:text-2xl font-bold text-primary">
                {formatCurrency(minPrice)}
              </p>
            </>
          ) : (
            <p className="text-xs sm:text-sm text-slate-400">No price</p>
          )}
        </div>
        <button
          className="bg-primary/10 hover:bg-primary p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all group/cart"
          onClick={(e) => {
            e.preventDefault();
            addItem(id, name, imageUrl);
          }}
        >
          <img
            src="/icons/cart.png"
            alt="Cart"
            className="h-4 w-4 sm:h-5 sm:w-5 object-contain group-hover/cart:brightness-0 group-hover/cart:invert transition-all"
          />
        </button>
      </div>
    </div>
  );
}
