"use client";

import Link from "next/link";
import { Package, Store, ChevronRight, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface BundleData {
    id: string;
    name: string;
    slug: string | null;
    description: string | null;
    imageUrl: string | null;
    price: string | number;
    externalUrl: string | null;
    items: string | null;
    vendorName: string;
    vendorLogoUrl: string | null;
    vendorSlug: string;
    branchId: string | null;
    bundleImages?: string[];
    productImages?: string[];
}

export function BundleCard({ bundle }: { bundle: BundleData }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const itemsList = bundle.items ? bundle.items.split(",").map((s) => s.trim()).filter(Boolean) : [];

    // Collect all available images for the slideshow
    const allImages = [
        ...(bundle.imageUrl ? [bundle.imageUrl] : []),
        ...(bundle.bundleImages || []),
        ...(bundle.productImages || []),
    ].filter(Boolean) as string[];

    // Slideshow logic
    useEffect(() => {
        if (allImages.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
        }, 2500); // Rotate every 2.5s for visibility

        return () => clearInterval(interval);
    }, [allImages.length]);

    const href = bundle.slug && bundle.vendorSlug
        ? `/store/${bundle.vendorSlug}/bundle/${bundle.slug}`
        : bundle.externalUrl || "#";
    const isExternal = !bundle.slug && bundle.externalUrl;

    const displayImage = allImages[currentImageIndex] || null;

    return (
        <Link
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative w-full bg-transparent overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 group cursor-pointer flex flex-col h-full"
        >
            {/* Bundle Label/Badge */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 text-[10px] font-black tracking-widest px-3 py-1 rounded-full shadow-lg">
                    BUNDLE DEAL
                </Badge>
                {itemsList.length > 0 && (
                    <div className="bg-white/90 backdrop-blur-md text-slate-900 border border-slate-200/50 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 w-fit">
                        <ShoppingBag className="h-3 w-3 text-primary" />
                        {itemsList.length} ITEMS
                    </div>
                )}
            </div>

            {/* Main Visual Section */}
            <div className="relative h-48 sm:h-56 bg-slate-50 border border-slate-100 rounded-[2rem] overflow-hidden shrink-0">
                {displayImage ? (
                    <div className="w-full h-full relative">
                        {/* Background Blur Effect for depth */}
                        <img
                            src={displayImage}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-150"
                        />

                        {/* The actual product images with transition */}
                        <div className="relative w-full h-full flex items-center justify-center p-6">
                            {allImages.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={bundle.name}
                                    className={cn(
                                        "absolute inset-0 w-full h-full object-contain p-6 transition-all duration-1000 transform",
                                        idx === currentImageIndex ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-90 rotate-3"
                                    )}
                                />
                            ))}
                        </div>

                        {/* Slideshow progress dots */}
                        {allImages.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                                {allImages.slice(0, 5).map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "h-1 rounded-full transition-all duration-500",
                                            idx === currentImageIndex % 5 ? "w-4 bg-primary" : "w-1 bg-slate-300"
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-white">
                        <img src="/icons/productplaceholder.png" alt="Placeholder" className="h-16 w-16 object-contain opacity-20" />
                    </div>
                )}

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />

                {/* Price Tag Overlay */}
                <div className="absolute top-4 right-4 z-20">
                    <div className="bg-slate-900 text-white text-sm font-black px-4 py-2 rounded-2xl shadow-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                        {formatCurrency(Number(bundle.price))}
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="p-5 flex flex-col flex-1 relative bg-white">
                <div className="flex items-center gap-2.5 mb-3">
                    {bundle.vendorLogoUrl ? (
                        <div className="h-6 w-6 rounded-lg overflow-hidden bg-white border border-slate-100 p-0.5 shadow-sm">
                            <img src={bundle.vendorLogoUrl} alt="" className="h-full w-full object-contain" />
                        </div>
                    ) : (
                        <div className="h-6 w-6 rounded-lg overflow-hidden bg-white border border-slate-100 p-0.5 shadow-sm flex items-center justify-center">
                            <img src="/icons/productplaceholder.png" alt="" className="h-3 w-3 object-contain opacity-40" />
                        </div>
                    )}
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{bundle.vendorName}</span>
                </div>

                <h4 className="font-heading font-bold text-base text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
                    {bundle.name}
                </h4>

                {bundle.description && (
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                        {bundle.description}
                    </p>
                )}

                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex -space-x-3">
                        {allImages.slice(0, 4).map((img, i) => (
                            <div
                                key={i}
                                className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm transition-transform duration-300 hover:z-10 hover:-translate-y-1"
                            >
                                <img src={img} alt="" className="h-full w-full object-cover" />
                            </div>
                        ))}
                        {allImages.length > 4 && (
                            <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                                +{allImages.length - 4}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span className="text-[11px] font-black text-primary uppercase tracking-wider">Unlock Deal</span>
                        <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                </div>

                {/* Glow effect on hover */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </Link>
    );
}

