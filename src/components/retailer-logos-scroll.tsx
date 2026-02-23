/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Store {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
}

// Static fallbacks used when no approved stores exist in the DB yet
const FALLBACK_STORES: Store[] = [
    { id: "f1", name: "Shoprite", slug: "shoprite", logoUrl: "/images/shoprite.jpeg" },
    { id: "f2", name: "Checkers", slug: "checkers", logoUrl: "/images/checkers.png" },
    { id: "f3", name: "SPAR", slug: "spar", logoUrl: "/images/spar.jpg" },
    { id: "f4", name: "Choppies", slug: "choppies", logoUrl: "/images/choppies.png" },
    { id: "f5", name: "Food Lover's", slug: "food-lovers-market", logoUrl: "/images/foodloversmarket.png" },
    { id: "f6", name: "U-Save", slug: "usave", logoUrl: "/images/usave.png" },
    { id: "f7", name: "Woermann Brock", slug: "woermann-brock", logoUrl: "/images/wb.jpeg" },
    { id: "f8", name: "Namica", slug: "namica", logoUrl: "/images/namica.jpg" },
];

export function RetailerLogosScroll({ grayscale = false }: { grayscale?: boolean }) {
    const [stores, setStores] = useState<Store[]>(FALLBACK_STORES);

    useEffect(() => {
        fetch("/api/stores")
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setStores(data);
                }
            })
            .catch(() => {});
    }, []);

    // Duplicate for seamless infinite scroll
    const doubled = [...stores, ...stores];

    return (
        <div className="w-full overflow-hidden">
            <div className="flex w-fit animate-scroll items-center gap-6 sm:gap-8 md:gap-10 hover:[animation-play-state:paused] py-3 px-1">
                {doubled.map((store, i) => (
                    <Link
                        key={`${store.id}-${i}`}
                        href={store.id.startsWith("f") ? "/products" : `/store/${store.id}`}
                        className={`flex-shrink-0 flex flex-col items-center gap-1.5 sm:gap-2 transition-all duration-300 cursor-pointer group ${grayscale ? "opacity-30 grayscale hover:grayscale-0 hover:opacity-100" : "opacity-70 hover:opacity-100"}`}
                    >
                        <div className="h-10 sm:h-12 md:h-14 w-16 sm:w-20 md:w-24 flex items-center justify-center rounded-xl bg-white/80 border border-slate-100 p-1.5 sm:p-2 group-hover:-translate-y-0.5 transition-transform">
                            {store.logoUrl ? (
                                <img
                                    src={store.logoUrl}
                                    alt={store.name}
                                    className="max-h-full max-w-full object-contain"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="h-full w-full rounded-lg bg-slate-100 flex items-center justify-center">
                                    <span className="text-xs font-bold text-slate-400">{store.name.charAt(0)}</span>
                                </div>
                            )}
                        </div>
                        <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors truncate max-w-[64px] sm:max-w-[80px] md:max-w-[96px] text-center">
                            {store.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
