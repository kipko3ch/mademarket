"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { SkeletonCard } from "@/components/skeleton-card";

export function PopularDealsSection() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFeatured() {
            try {
                const res = await fetch("/api/products?pageSize=8"); // We might fetch random or discounted ones later
                const data = await res.json();
                setProducts(data.data || []);
            } catch (err) {
            } finally {
                setLoading(false);
            }
        }
        fetchFeatured();
    }, []);

    if (loading) return (
        <section className="container mx-auto max-w-7xl px-4 pb-16">
            <div className="mb-8">
                <div className="h-8 w-48 bg-slate-100 rounded-full animate-pulse mb-2" />
                <div className="h-4 w-64 bg-slate-50 rounded-full animate-pulse" />
            </div>
            <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-[160px] sm:w-[220px] md:w-[260px] shrink-0">
                        <SkeletonCard />
                    </div>
                ))}
            </div>
        </section>
    );

    if (products.length === 0) return null;

    return (
        <section className="container mx-auto max-w-7xl px-4 pb-16">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                        Popular Deals
                    </h2>
                    <p className="text-slate-600 mt-1 max-w-xl text-[11px] sm:text-xs md:text-sm">
                        Products with the biggest price drops this week.
                    </p>
                </div>
                <Link href="/products" className="shrink-0">
                    <button className="rounded-full px-4 py-1.5 sm:px-5 sm:py-2 text-[10px] sm:text-sm font-bold bg-white text-slate-900 border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
                        View Deals
                    </button>
                </Link>
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
