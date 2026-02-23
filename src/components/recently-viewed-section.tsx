"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";

export function RecentlyViewedSection() {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("recently_viewed");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setProducts(parsed);
                }
            } catch (err) {
                console.error("Failed to parse recently viewed products", err);
            }
        }
    }, []);

    if (products.length === 0) return null;

    return (
        <section className="container mx-auto max-w-7xl px-4 pb-16">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                        Recently Viewed
                    </h2>
                    <p className="text-slate-600 mt-1 max-w-xl text-[11px] sm:text-xs md:text-sm">
                        Products you were interested in.
                    </p>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem("recently_viewed");
                        setProducts([]);
                    }}
                    className="text-[10px] sm:text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
                >
                    Clear History
                </button>
            </div>

            {/* Horizontal Scroll Area */}
            <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 pt-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {products.map((product) => (
                    <div key={product.id} className="w-[160px] sm:w-[220px] md:w-[260px] shrink-0 snap-start">
                        <ProductCard {...product} />
                    </div>
                ))}
            </div>
        </section>
    );
}
