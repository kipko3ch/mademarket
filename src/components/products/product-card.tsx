/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
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
  const { status } = useSession();
  const router = useRouter();

  const saved = hasHydrated ? isSavedInStore : false;

  return (
    <div className="group flex flex-col transition-all duration-300">
      {/* Image Container Wrapper */}
      <div className="relative mb-3 sm:mb-4">
        {/* Link / Image Container */}
        <Link
          href={productUrl(id, name)}
          onClick={() => { fetch(`/api/products/${id}/click`, { method: "POST" }).catch(() => { }); }}
          className="relative block aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-slate-100 group-hover:border-primary/20 group-hover:shadow-xl group-hover:shadow-primary/5 transition-all duration-500"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-contain p-4 sm:p-6 group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <img
                src="/icons/productplaceholder.png"
                alt="Placeholder"
                className="max-h-[60%] max-w-[60%] object-contain opacity-40"
              />
            </div>
          )}

          {/* Sponsored badge */}
          {sponsored && (
            <div className="absolute top-3 left-3 bg-amber-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full z-10 shadow-sm">
              Sponsored
            </div>
          )}

          {/* Like button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSaved(id);
            }}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full shadow-md transition-all z-10 active:scale-90",
              saved
                ? "bg-red-500 text-white"
                : "bg-white/90 backdrop-blur-md text-slate-400 hover:text-red-500"
            )}
          >
            <Heart className={cn("h-4 w-4", saved && "fill-current")} />
          </button>
        </Link>

        {/* Cart Button - Overlapping the bottom-right corner */}
        <button
          className="absolute -bottom-2 -right-1 h-11 w-11 sm:h-13 sm:w-13 flex items-center justify-center bg-primary text-white border-2 border-white hover:bg-primary/90 rounded-2xl transition-all group/cart shadow-xl active:scale-95 z-20"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (status !== "authenticated") {
              toast.error("Please sign in to add items to your cart", {
                action: { label: "Sign In", onClick: () => router.push("/login") },
              });
              return;
            }
            addItem(id, name, imageUrl);
          }}
        >
          <img
            src="/icons/cart.png"
            alt="Cart"
            className="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5 object-contain brightness-0 invert transition-all scale-110"
          />
        </button>
      </div>

      {/* Product Details - Clean and Aligned */}
      <div className="px-1.5 pr-8 space-y-1.5">
        <div>
          <Link href={productUrl(id, name)}>
            <h4 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {name}
            </h4>
          </Link>
          <div className="flex items-center gap-1.5 mt-1">
            {storeCount > 0 && (
              <span className="text-[10px] sm:text-xs font-bold text-primary/60 uppercase tracking-tight">
                {storeCount} {storeCount === 1 ? "store" : "stores"}
              </span>
            )}
            {unit && (
              <>
                <div className="h-0.5 w-0.5 rounded-full bg-slate-300" />
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium">{unit}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col pt-1">
          {minPrice ? (
            <>
              <span className="text-xl sm:text-2xl font-black text-primary tracking-tighter">
                {formatCurrency(minPrice)}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wide -mt-0.5">
                {storeCount > 1 ? "Minimum Price" : "Current Best Deal"}
              </span>
            </>
          ) : (
            <span className="text-xs font-semibold text-slate-300 italic">Currently unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
}
