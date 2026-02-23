"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Banner {
    id: string;
    title: string;
    subtitle: string | null;
    ctaText: string | null;
    ctaUrl: string | null;
    imageUrl: string;
    bgColor: string | null;
}

// Fallback banners shown when no admin banners exist yet
const FALLBACK_BANNERS: Banner[] = [
    {
        id: "f1",
        title: "Compare Prices Across Namibia",
        subtitle: "Find the cheapest groceries at Shoprite, SPAR, Checkers & more.",
        ctaText: "Compare Now",
        ctaUrl: "/products",
        imageUrl: "/images/Flag_map_of_Namibia.svg",
        bgColor: "#dbeafe",
    },
    {
        id: "f2",
        title: "Save up to 30% Weekly",
        subtitle: "Smart cart auto-picks the cheapest store combination for you.",
        ctaText: "Build Smart Cart",
        ctaUrl: "/products",
        imageUrl: "/images/save.png",
        bgColor: "#dcfce7",
    },
    {
        id: "f3",
        title: "Fresh Deals Every Day",
        subtitle: "Real-time prices updated daily from all major Namibian stores.",
        ctaText: "Browse Deals",
        ctaUrl: "/products",
        imageUrl: "/images/fresh.png",
        bgColor: "#fef9c3",
    },
];

export function HeroBannerCarousel() {
    const [banners, setBanners] = useState<Banner[]>(FALLBACK_BANNERS);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        fetch("/api/banners")
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) setBanners(data);
            })
            .catch(() => { });
    }, []);

    const next = useCallback(() => setCurrent((c) => (c + 1) % banners.length), [banners.length]);

    // Auto-advance
    useEffect(() => {
        if (banners.length <= 1) return;
        const t = setInterval(next, 5000);
        return () => clearInterval(t);
    }, [banners.length, next]);

    const visibleBanner = banners[current];

    return (
        <div className="relative w-full group">
            {/* Main Carousel Banner */}
            <div
                className="relative rounded-2xl overflow-hidden w-full flex border border-black/5"
                style={{ backgroundColor: visibleBanner.bgColor || "#f0f4ff", minHeight: 'clamp(150px, 26vw, 320px)' }}
            >
                {/* Soft glare */}
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2 pointer-events-none blur-2xl" />

                {/* Text content */}
                <div className="relative z-10 flex flex-col justify-center h-full max-w-[60%] px-4 py-5 sm:px-8 sm:py-8 md:px-12 md:py-10 lg:px-16">

                    {/* Eyebrow */}
                    <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5 md:mb-2 block">
                        MaDe Market
                    </span>

                    <h2 className="font-heading text-[1.1rem] sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-slate-900 leading-[1.08] mb-2 md:mb-4">
                        {visibleBanner.title}
                    </h2>

                    {visibleBanner.subtitle && (
                        <p className="text-[10px] sm:text-sm md:text-base lg:text-lg text-slate-600 leading-snug mb-3 sm:mb-4 md:mb-6 hidden sm:block max-w-xs md:max-w-sm">
                            {visibleBanner.subtitle}
                        </p>
                    )}

                    {visibleBanner.ctaText && visibleBanner.ctaUrl && (
                        <Link href={visibleBanner.ctaUrl} className="w-fit">
                            <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 md:px-6 md:py-2.5 font-semibold shadow-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors text-[11px] sm:text-sm cursor-pointer">
                                {visibleBanner.ctaText}
                            </span>
                        </Link>
                    )}
                </div>

                {/* Product image */}
                <div className="relative w-[40%] shrink-0 self-end">
                    <img
                        src={visibleBanner.imageUrl}
                        alt={visibleBanner.title}
                        className="w-full h-auto max-h-[clamp(120px,24vw,300px)] object-contain object-bottom pointer-events-none pr-2 sm:pr-4 md:pr-6 drop-shadow-lg"
                    />
                </div>
            </div>

            {/* Dot indicators */}
            {banners.length > 1 && (
                <div className="absolute bottom-2.5 sm:bottom-4 left-0 right-0 flex items-center justify-center gap-1.5 z-20">
                    {banners.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${current === i ? "w-4 sm:w-6 bg-slate-800" : "w-1.5 sm:w-2 bg-slate-800/30 hover:bg-slate-800/50"
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
