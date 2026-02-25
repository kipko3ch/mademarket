"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/products/product-grid";
import { SkeletonGrid } from "@/components/skeleton-card";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, ArrowUpDown, ShoppingBag } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Filters {
    search: string;
    category: string;
    vendorId: string;
    sortBy: string;
    minPrice: string;
    maxPrice: string;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Vendor {
    id: string;
    name: string;
}

export function ProductCatalogClient({
    initialCategories = [],
    initialVendors = []
}: {
    initialCategories?: Category[],
    initialVendors?: Vendor[]
}) {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get("search") || "";
    const initialCategorySlug = searchParams.get("category") || "";

    const [products, setProducts] = useState([]);
    const [sponsored, setSponsored] = useState([]);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        search: initialSearch,
        category: "",
        vendorId: "",
        sortBy: "name",
        minPrice: "",
        maxPrice: "",
    });

    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), pageSize: "20" });
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (filters.category && filters.category !== "all")
            params.set("category", filters.category);
        if (filters.vendorId && filters.vendorId !== "all")
            params.set("vendorId", filters.vendorId);
        if (filters.sortBy) params.set("sortBy", filters.sortBy);
        if (filters.minPrice) params.set("minPrice", filters.minPrice);
        if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);

        try {
            const res = await fetch(`/api/products?${params}`);
            const data = await res.json();
            setProducts(data.data || []);
            setSponsored(data.sponsored || []);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error("Failed to fetch products:", err);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, filters.category, filters.vendorId, filters.sortBy, filters.minPrice, filters.maxPrice]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 400);
        return () => clearTimeout(timer);
    }, [filters.search]);

    useEffect(() => {
        async function fetchMeta() {
            // Only fetch if not provided as props
            if (initialCategories.length === 0 || initialVendors.length === 0) {
                try {
                    const [catRes, vendorRes] = await Promise.all([
                        fetch("/api/categories"),
                        fetch("/api/vendors"),
                    ]);
                    if (catRes.ok) {
                        const cats: Category[] = await catRes.json();
                        setCategories(cats);
                        if (initialCategorySlug) {
                            const match = cats.find(
                                (c) => c.slug === initialCategorySlug.toLowerCase() ||
                                    c.name.toLowerCase() === initialCategorySlug.toLowerCase()
                            );
                            if (match) setFilters((prev) => ({ ...prev, category: match.id }));
                        }
                    }
                    if (vendorRes.ok) {
                        const data = await vendorRes.json();
                        setVendors(Array.isArray(data) ? data : data.vendors || []);
                    }
                } catch { }
            }
        }
        fetchMeta();
    }, [initialCategories, initialVendors, initialCategorySlug]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    function updateFilter(key: string, value: string) {
        setPage(1);
        setFilters((prev) => ({ ...prev, [key]: value }));
    }

    function clearFilters() {
        setPage(1);
        setFilters({
            search: "",
            category: "",
            vendorId: "",
            sortBy: "name",
            minPrice: "",
            maxPrice: "",
        });
    }

    const hasActiveFilters = filters.category || filters.vendorId || filters.minPrice || filters.maxPrice;

    return (
        <>
            <div className="bg-white border border-slate-100 rounded-2xl p-3 sm:p-4 mb-6 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            placeholder="Search products..."
                            value={filters.search}
                            onChange={(e) => updateFilter("search", e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-all outline-none"
                        />
                    </div>

                    <div className="hidden md:flex items-center gap-2 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => updateFilter("category", "")}
                            className={cn(
                                "px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
                                !filters.category
                                    ? "bg-primary text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary"
                            )}
                        >
                            All
                        </button>
                        {categories.slice(0, 6).map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => updateFilter("category", cat.id)}
                                className={cn(
                                    "px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
                                    filters.category === cat.id
                                        ? "bg-primary text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary"
                                )}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="md:hidden">
                        <Select
                            value={filters.category || "all"}
                            onValueChange={(v) => updateFilter("category", v === "all" ? "" : v)}
                        >
                            <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 text-sm h-10">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Select
                        value={filters.sortBy}
                        onValueChange={(v) => updateFilter("sortBy", v)}
                    >
                        <SelectTrigger className="w-full sm:w-44 rounded-xl border-slate-200 bg-slate-50 text-sm h-10">
                            <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="price_asc">Price: Low to High</SelectItem>
                            <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        </SelectContent>
                    </Select>

                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={cn(
                            "h-10 w-10 shrink-0 rounded-xl border flex items-center justify-center transition-colors",
                            showAdvanced
                                ? "bg-primary border-primary text-white"
                                : "bg-slate-50 border-slate-200 text-slate-500 hover:border-primary/30"
                        )}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                    </button>
                </div>

                {showAdvanced && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 border-t border-slate-100">
                        <Select
                            value={filters.vendorId || "all"}
                            onValueChange={(v) => updateFilter("vendorId", v === "all" ? "" : v)}
                        >
                            <SelectTrigger className="w-full sm:w-48 rounded-xl border-slate-200 bg-slate-50 text-sm h-10">
                                <SelectValue placeholder="All Vendors" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Vendors</SelectItem>
                                {vendors.map((vendor) => (
                                    <SelectItem key={vendor.id} value={vendor.id}>
                                        {vendor.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <input
                            type="number"
                            placeholder="Min (N$)"
                            value={filters.minPrice}
                            onChange={(e) => updateFilter("minPrice", e.target.value)}
                            className="w-full sm:w-36 px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none"
                        />
                        <input
                            type="number"
                            placeholder="Max (N$)"
                            value={filters.maxPrice}
                            onChange={(e) => updateFilter("maxPrice", e.target.value)}
                            className="w-full sm:w-36 px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none"
                        />
                    </div>
                )}

                {hasActiveFilters && (
                    <div className="flex items-center gap-2 flex-wrap text-sm">
                        <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Filters:</span>
                        {filters.category && (
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium text-xs">
                                {categories.find((c) => c.id === filters.category)?.name || "Category"}
                                <button onClick={() => updateFilter("category", "")} className="hover:text-red-500">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {filters.vendorId && (
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium text-xs">
                                {vendors.find((v) => v.id === filters.vendorId)?.name || "Vendor"}
                                <button onClick={() => updateFilter("vendorId", "")} className="hover:text-red-500">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        <button onClick={clearFilters} className="text-[10px] text-slate-400 font-bold uppercase hover:text-red-500 transition-colors">
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <SkeletonGrid count={10} />
            ) : products.length > 0 ? (
                <ProductGrid products={products} sponsored={sponsored} />
            ) : (
                <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="h-10 w-10 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
                    <p className="text-slate-500 text-sm mb-8">Try different keywords or filters.</p>
                    <button onClick={clearFilters} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/10">
                        Reset filters
                    </button>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50 disabled:opacity-40"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </button>
                    <span className="text-sm font-medium px-2">{page} / {totalPages}</span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50 disabled:opacity-40"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </>
    );
}
