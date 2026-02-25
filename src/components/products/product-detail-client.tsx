/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import {
    Heart,
    Bell,
    Store,
    ArrowLeft,
    ShoppingCart,
    Share2,
    Package,
    MapPin,
    ChevronRight,
    Info,
    Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useSaved } from "@/hooks/use-saved";
import { formatCurrency } from "@/lib/currency";
import { cn, productUrl } from "@/lib/utils";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BranchPrice {
    branchId: string;
    branchName: string;
    branchTown: string | null;
    vendorId: string;
    vendorName: string;
    vendorSlug: string;
    branchSlug: string;
    vendorLogoUrl: string | null;
    vendorWebsiteUrl: string | null;
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

export function ProductDetailClient({
    product,
    branchPrices,
    initialRelatedProducts = [],
}: {
    product: ProductDetail;
    branchPrices: BranchPrice[];
    initialRelatedProducts?: RelatedProduct[];
}) {
    const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>(initialRelatedProducts);
    const [alertSet, setAlertSet] = useState(false);

    const addItem = useCart((s) => s.addItem);
    const toggleSaved = useSaved((s) => s.toggleSaved);
    const isSavedInStore = useSaved((s) => s.savedIds.includes(product.id));
    const hasHydrated = useSaved((s) => s._hasHydrated);
    const { status } = useSession();
    const router = useRouter();

    const saved = hasHydrated ? isSavedInStore : false;

    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("recently_viewed");
            let list = stored ? JSON.parse(stored) : [];
            list = list.filter((p: { id: string }) => p.id !== product.id);
            list.unshift({
                id: product.id,
                name: product.name,
                imageUrl: product.imageUrl,
                categoryName: product.categoryName,
                unit: product.unit,
                minPrice: branchPrices[0]?.price ?? null,
                maxPrice: branchPrices.length > 1 ? branchPrices[branchPrices.length - 1].price : null,
                storeCount: branchPrices.length,
            });
            list = list.slice(0, 10);
            localStorage.setItem("recently_viewed", JSON.stringify(list));
        }
    }, [product, branchPrices]);

    const cheapestPrice = branchPrices.length > 0 ? branchPrices[0].price : null;

    return (
        <div className="mx-auto max-w-6xl px-4 py-4 md:py-8 lg:py-12">
            {/* 🧭 NAVIGATION TOP BAR */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                <div className="flex items-center gap-3 sm:gap-6">
                    <Link
                        href="/"
                        className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-all uppercase tracking-widest"
                    >
                        <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                            <Home className="h-3.5 w-3.5" />
                        </div>
                        <span className="hidden sm:inline">Home</span>
                    </Link>
                    <div className="h-4 w-px bg-slate-100" />
                    <Link
                        href="/products"
                        className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-all uppercase tracking-widest"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                        Back to browsing
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            if (typeof navigator !== "undefined") {
                                navigator.share({ title: product.name, url: window.location.href }).catch(() => { });
                            }
                        }}
                        className="rounded-xl h-9 w-9 text-slate-400 hover:text-primary"
                    >
                        <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSaved(product.id)}
                        className={cn("rounded-xl h-9 w-9 transition-all text-slate-400 hover:text-red-500", saved && "text-red-500 bg-red-50")}
                    >
                        <Heart className={cn("h-4 w-4", saved && "fill-current")} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* 🖼️ LEFT: Product Visuals */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="relative aspect-square rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm flex items-center justify-center p-8 group">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                            <img src="/icons/productplaceholder.png" alt="" className="h-20 w-20 object-contain opacity-20" />
                        )}
                        {product.categoryName && (
                            <Badge className="absolute top-6 left-6 bg-slate-100/80 backdrop-blur-md text-slate-600 border-0 font-bold uppercase tracking-widest text-[9px] px-3 py-1">
                                {product.categoryName}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* 📝 RIGHT: Basic Info & Quick Actions */}
                <div className="lg:col-span-7 space-y-6 lg:pt-2">
                    <div className="space-y-4">
                        <div>
                            {product.brand && (
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{product.brand}</p>
                            )}
                            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 leading-tight md:-tracking-tight">
                                {product.name}
                            </h1>
                            {product.unit && (
                                <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wider">{product.unit}</p>
                            )}
                        </div>

                        <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-xl">
                            {product.description || `Compare the best prices for ${product.name} across Namibia. Find reliable deals at your local retailers.`}
                        </p>

                        {/* 💰 PRICING & CART REARRANGED */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-4 pb-6 border-y border-slate-50">
                            <div className="shrink-0">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Best Price Today</p>
                                <p className="text-4xl font-black text-primary leading-none tracking-tighter">
                                    {cheapestPrice ? formatCurrency(cheapestPrice) : "---"}
                                </p>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">In Stock</span>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-wrap gap-2">
                                <Button
                                    onClick={() => {
                                        if (status !== "authenticated") {
                                            toast.error("Please sign in to add items to your cart", {
                                                action: { label: "Sign In", onClick: () => router.push("/login") },
                                            });
                                            return;
                                        }
                                        addItem(product.id, product.name, product.imageUrl);
                                        toast.success("Added to cart");
                                    }}
                                    className="rounded-2xl flex-1 h-16 font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 text-base"
                                >
                                    <ShoppingCart className="h-5 w-5 mr-3" />
                                    Add to Cart
                                </Button>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "rounded-2xl h-16 px-6 font-bold transition-all border-slate-200",
                                        alertSet ? "border-primary text-primary bg-primary/5" : "text-slate-600 hover:bg-slate-50"
                                    )}
                                    onClick={() => setAlertSet(!alertSet)}
                                >
                                    <Bell className={cn("h-5 w-5", alertSet && "fill-current")} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* 📊 PRICE COMPARISON SECTION */}
                    <div className="space-y-6 pt-2">
                        <div className="flex items-center justify-between">
                            <h2 className="font-heading text-xl md:text-2xl text-slate-900">
                                <span className="highlighter text-red-600">Price</span> Comparison
                            </h2>
                            <div className="hidden sm:flex text-[10px] font-bold text-slate-400 uppercase tracking-widest items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <Info className="h-3 w-3" />
                                Live Pricing
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {branchPrices.map((bp, idx) => {
                                const isCheapest = idx === 0 && branchPrices.length > 1;

                                return (
                                    <div
                                        key={bp.branchId}
                                        className={cn(
                                            "relative group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300",
                                            isCheapest
                                                ? "bg-primary/[0.02] border-primary/20 shadow-sm"
                                                : "bg-white border-slate-100 hover:border-primary/20"
                                        )}
                                    >
                                        {isCheapest && (
                                            <div className="absolute -top-2 -left-2 bg-primary text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-lg shadow-xl shadow-primary/20 z-10">
                                                Cheapest
                                            </div>
                                        )}

                                        {/* Store Link */}
                                        <Link href={`/store/${bp.vendorSlug}`} className="shrink-0">
                                            <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl border border-slate-100 p-2 shadow-sm flex items-center justify-center transition-transform group-hover:scale-105">
                                                <img src={bp.vendorLogoUrl || ""} alt="" className="w-full h-full object-contain" />
                                            </div>
                                        </Link>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-slate-900 text-sm md:text-base leading-tight truncate">
                                                    {bp.vendorName}
                                                </span>
                                                {bp.inStock ? (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="In Stock" />
                                                ) : (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Out of Stock" />
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5 truncate uppercase tracking-widest">
                                                <MapPin className="h-2.5 w-2.5" />
                                                {bp.branchTown || "General Branch"}
                                            </p>
                                        </div>

                                        {/* Price */}
                                        <div className="text-right">
                                            <p className={cn("text-lg md:text-xl font-black", isCheapest ? "text-primary" : "text-slate-900")}>
                                                {formatCurrency(bp.price)}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{bp.branchName}</p>
                                        </div>

                                        {/* Action */}
                                        <div className="pl-2">
                                            <Link
                                                href={`/store/${bp.vendorSlug}`}
                                                className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center transition-all"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}

                            {branchPrices.length === 0 && (
                                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <img src="/icons/productplaceholder.png" alt="" className="h-10 w-10 mx-auto mb-3 object-contain opacity-20" />
                                    <p className="text-slate-400 font-bold text-sm">No vendors found for this item</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* RELATED PRODUCTS */}
            {relatedProducts.length > 0 && (
                <section className="mt-20 border-t border-slate-50 pt-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="font-heading text-xl md:text-2xl text-slate-900 border-l-4 border-red-600 pl-4">
                            Related <span className="text-red-600">Deals</span>
                        </h2>
                        <Link href={`/products?category=${product.categoryName || ""}`} className="text-[10px] font-black tracking-widest text-primary hover:underline uppercase">
                            View Category
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {relatedProducts.map((rp) => (
                            <Link
                                key={rp.id}
                                href={productUrl(rp.id, rp.name)}
                                className="group flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all"
                            >
                                <div className="aspect-square bg-slate-50/50 relative overflow-hidden flex items-center justify-center p-6">
                                    {rp.imageUrl ? (
                                        <img src={rp.imageUrl} alt={rp.name} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110" />
                                    ) : (
                                        <img src="/icons/productplaceholder.png" alt="" className="h-8 w-8 object-contain opacity-20" />
                                    )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">{rp.name}</h4>
                                    <div className="mt-auto flex items-center justify-between">
                                        <p className="text-sm font-black text-primary">{rp.minPrice ? formatCurrency(rp.minPrice) : "---"}</p>
                                        <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
