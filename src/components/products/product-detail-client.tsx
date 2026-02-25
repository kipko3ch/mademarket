/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import {
    Heart,
    Bell,
    Store,
    TrendingDown,
    ArrowLeft,
    ExternalLink,
    ShoppingCart,
    Share2,
    Search,
    Package,
    ArrowRight,
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
        // Update recently viewed
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
    const mostExpensive = branchPrices.length > 1 ? branchPrices[branchPrices.length - 1].price : null;

    return (
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-4 sm:py-8 lg:py-12">
            {/* Search Bar - Quick Access */}
            <div className="mb-8 md:hidden">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                        placeholder="Search for something else..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                {/* LEFT: Product Visuals */}
                <div className="lg:col-span-6 xl:col-span-7 space-y-6 lg:sticky lg:top-24">
                    <Link
                        href="/products"
                        className="group inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-all uppercase tracking-widest mb-2"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                        Back to Catalog
                    </Link>

                    <div className="relative aspect-square sm:aspect-[4/3] rounded-[2.5rem] bg-white border-2 border-slate-50 overflow-hidden shadow-2xl shadow-slate-200/50 group select-none">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-8 sm:p-12 transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-slate-50">
                                <Package className="h-24 w-24 text-slate-200" />
                            </div>
                        )}

                        {/* Quick Actions Overlay */}
                        <div className="absolute top-6 right-6 flex flex-col gap-3">
                            <button
                                onClick={() => toggleSaved(product.id)}
                                className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95",
                                    saved ? "bg-red-500 text-white" : "bg-white/90 backdrop-blur-md text-slate-900 hover:bg-white"
                                )}
                            >
                                <Heart className={cn("h-5 w-5", saved && "fill-current")} />
                            </button>
                            <button className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md text-slate-900 flex items-center justify-center shadow-lg hover:bg-white active:scale-95 transition-all">
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Gallery Thumbnails */}
                        <div className="absolute bottom-6 left-6 flex gap-2">
                            <div className="w-16 h-16 rounded-xl border-2 border-primary bg-white p-1 overflow-hidden">
                                <img src={product.imageUrl || ""} alt="" className="w-full h-full object-contain" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Product Info & Pricing */}
                <div className="lg:col-span-6 xl:col-span-5 space-y-8 lg:pt-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            {product.categoryName && (
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                                    {product.categoryName}
                                </span>
                            )}
                            {product.brand && (
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border border-slate-200 px-2.5 py-1 rounded-full">
                                    {product.brand}
                                </span>
                            )}
                        </div>

                        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-slate-900 leading-[1.1] md:-tracking-wider">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-6 pt-2">
                            <div className="space-y-0.5">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Cheapest Price</p>
                                <p className="text-4xl font-black text-slate-900">
                                    {cheapestPrice ? formatCurrency(cheapestPrice) : "---"}
                                </p>
                            </div>

                            {mostExpensive && mostExpensive > (cheapestPrice || 0) && (
                                <div className="space-y-0.5 border-l border-slate-100 pl-6">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-red-500">Max Price</p>
                                    <p className="text-2xl font-bold text-slate-400 line-through">
                                        {formatCurrency(mostExpensive)}
                                    </p>
                                </div>
                            )}
                        </div>

                        <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-lg">
                            {product.description || `High-quality ${product.name} available at various Namibian retailers. Compare prices below to find the best deal for your wallet.`}
                        </p>
                    </div>

                    {/* Action Card */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl transition-colors group-hover:bg-primary/30" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Stock Status</p>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-sm font-bold">In Stock at {branchPrices.length} Locations</span>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full bg-white/5 border-white/10 text-white hover:bg-white/15 text-[10px] font-black px-4"
                                    onClick={() => setAlertSet(!alertSet)}
                                >
                                    <Bell className={cn("h-3 w-3 mr-1.5", alertSet && "fill-current")} />
                                    {alertSet ? "Alert Set" : "Notify Price Drop"}
                                </Button>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
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
                                    className="flex-1 h-16 bg-primary hover:bg-primary/90 rounded-[1.5rem] flex items-center justify-center gap-3 font-bold transition-all active:scale-95 shadow-lg shadow-primary/20"
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    Add to Smart Cart
                                </button>
                            </div>

                            {alertSet && (
                                <p className="text-[10px] text-primary mt-4 font-bold uppercase tracking-widest text-center">
                                    Notifications enabled for price reductions
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ WHERE TO BUY ══════════════════════════ */}
            <section className="mt-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h2 className="font-heading text-3xl md:text-4xl text-slate-900 mb-2">
                            <span className="highlighter text-red-600">Where</span> to Buy
                        </h2>
                        <p className="text-slate-500 text-sm md:text-base font-medium">
                            {branchPrices.length > 0
                                ? `Comparison of ${branchPrices.length} active branches in your region`
                                : "No branches currently stock this product"}
                        </p>
                    </div>

                    <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
                        <button className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-slate-900 shadow-sm transition-all">Lowest price</button>
                        <button className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all">Distance</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {branchPrices.map((bp, idx) => {
                        const isCheapest = idx === 0 && branchPrices.length > 1;
                        const savings = cheapestPrice && bp.price > cheapestPrice ? bp.price - cheapestPrice : 0;
                        const redirectUrl = bp.externalUrl || bp.vendorWebsiteUrl;

                        return (
                            <div
                                key={bp.branchId}
                                className={cn(
                                    "group relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 rounded-[2.5rem] border transition-all duration-500",
                                    isCheapest
                                        ? "bg-gradient-to-br from-green-100/50 via-white to-white border-green-200 shadow-xl shadow-green-500/5"
                                        : "bg-white border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-200/50"
                                )}
                            >
                                {/* Visual Label */}
                                {isCheapest && (
                                    <div className="absolute top-0 right-0 px-8 py-1.5 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-3xl shadow-lg">
                                        Best Deal Found
                                    </div>
                                )}

                                {/* Vendor Identity */}
                                <div className="flex items-center gap-5 w-full sm:w-1/3">
                                    <Link href={`/store/${bp.vendorSlug}`} className="shrink-0 transition-transform duration-300 group-hover:scale-110">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-3xl border border-slate-100 p-3 shadow-md">
                                            <img src={bp.vendorLogoUrl || ""} alt="" className="w-full h-full object-contain" />
                                        </div>
                                    </Link>
                                    <div className="min-w-0">
                                        <Link href={`/store/${bp.vendorSlug}`} className="block font-black text-lg text-slate-900 leading-tight hover:text-primary transition-colors truncate">
                                            {bp.vendorName}
                                        </Link>
                                        <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                                            <Store className="h-3 w-3" />
                                            <p className="text-xs font-medium truncate">{bp.branchTown || "National Distribution"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Savings / Stats */}
                                <div className="flex flex-col sm:items-center justify-center flex-1 w-full sm:w-auto text-left sm:text-center border-y sm:border-y-0 sm:border-x border-slate-50 py-4 sm:py-0 px-0 sm:px-6">
                                    {savings > 0 ? (
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">Price Gap</p>
                                            <p className="text-lg font-bold text-slate-900">+{formatCurrency(savings)}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Extra vs cheapest</p>
                                        </div>
                                    ) : isCheapest ? (
                                        <div className="space-y-1">
                                            <TrendingDown className="h-6 w-6 text-green-500 mx-auto mb-1 animate-bounce" />
                                            <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">Maximum Savings</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Price Score</p>
                                            <p className="text-lg font-bold text-slate-500">Competitive</p>
                                        </div>
                                    )}
                                </div>

                                {/* Pricing & CTA */}
                                <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-1/3">
                                    <div className="text-left sm:text-right">
                                        <p className={cn("text-3xl font-black", isCheapest ? "text-green-600" : "text-slate-900")}>
                                            {formatCurrency(bp.price)}
                                        </p>
                                        <div className="flex items-center sm:justify-end gap-1.5 mt-1">
                                            <span className={cn("w-1.5 h-1.5 rounded-full", bp.inStock ? "bg-green-500" : "bg-red-500")} />
                                            <span className={cn("text-[11px] font-bold uppercase tracking-widest", bp.inStock ? "text-green-600" : "text-red-500")}>
                                                {bp.inStock ? "Available" : "Stock Alert"}
                                            </span>
                                        </div>
                                    </div>

                                    {redirectUrl ? (
                                        <a
                                            href={redirectUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 hover:bg-primary text-white rounded-3xl flex items-center justify-center shadow-lg transition-all active:scale-90 group-hover:rotate-6"
                                        >
                                            <ExternalLink className="h-6 w-6" />
                                        </a>
                                    ) : (
                                        <Link
                                            href={`/store/${bp.vendorSlug}`}
                                            className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 hover:bg-slate-200 text-slate-400 rounded-3xl flex items-center justify-center shadow-sm transition-all"
                                        >
                                            <ArrowRight className="h-6 w-6" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {branchPrices.length === 0 && (
                        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <Store className="h-20 w-20 mx-auto mb-4 text-slate-200" />
                            <h3 className="text-xl font-bold text-slate-900">No Retailers Found</h3>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                                This product might be currently unavailable across all vendors in your area.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* ═══ RELATED PRODUCTS ═════════════════════ */}
            {relatedProducts.length > 0 && (
                <section className="mt-24">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="font-heading text-2xl sm:text-3xl text-slate-900">
                                <span className="highlighter text-red-600">Related</span> deals
                            </h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Customers also viewed</p>
                        </div>
                        <Link href={`/products?category=${product.categoryName || ""}`} className="bg-slate-100 px-6 py-2.5 rounded-xl text-xs font-extrabold text-slate-900 hover:bg-slate-200 transition-all">
                            SEE ALL MATCHES
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {relatedProducts.map((rp) => (
                            <Link
                                key={rp.id}
                                href={productUrl(rp.id, rp.name)}
                                className="group flex flex-col bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all"
                            >
                                <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center p-6">
                                    {rp.imageUrl ? (
                                        <img src={rp.imageUrl} alt={rp.name} className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                                    ) : (
                                        <Package className="h-10 w-10 text-slate-200" />
                                    )}
                                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[9px] font-black text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        QUICK VIEW
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors truncate">{rp.name}</h4>
                                    <div className="mt-auto flex items-center justify-between">
                                        <p className="text-sm font-black text-primary">{rp.minPrice ? formatCurrency(rp.minPrice) : "---"}</p>
                                        <div className="h-7 w-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                            <ArrowRight className="h-3 w-3" />
                                        </div>
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
