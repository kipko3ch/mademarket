"use client";

import { useEffect, useState } from "react";
import { ProductGrid } from "./product-grid";
import { SkeletonGrid } from "../skeleton-card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { GetStartedButton } from "@/components/ui/get-started-button";

export function FeaturedProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFeatured() {
            try {
                const res = await fetch("/api/products?pageSize=10");
                const data = await res.json();
                setProducts(data.data || []);
            } catch (err) {
                console.error("Failed to fetch featured products:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchFeatured();
    }, []);

    return (
        <section className="container mx-auto max-w-7xl px-4 pt-0 pb-16 md:pt-8 md:pb-24">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                        Explore Popular Products
                    </h2>
                    <p className="text-slate-600 mt-1 max-w-xl text-[11px] sm:text-xs md:text-sm">
                        Find the best deals on everyday essentials across top stores.
                    </p>
                </div>
                <Link href="/products" className="shrink-0">
                    <button className="rounded-full px-4 py-1.5 sm:px-5 sm:py-2 text-[10px] sm:text-sm font-bold bg-white text-slate-900 border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
                        View All
                    </button>
                </Link>
            </div>

            <div className="mt-8">
                {loading ? (
                    <SkeletonGrid count={5} />
                ) : (
                    <ProductGrid products={products.slice(0, 5)} />
                )}
            </div>
        </section>
    );
}
