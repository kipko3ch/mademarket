"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/products/product-grid";
import { SkeletonGrid } from "@/components/skeleton-card";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
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

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [sponsored, setSponsored] = useState([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
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

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (filters.search) params.set("search", filters.search);
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
  }, [page, filters]);

  useEffect(() => {
    async function fetchMeta() {
      try {
        const [catRes, vendorRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/vendors"),
        ]);
        if (catRes.ok) setCategories(await catRes.json());
        if (vendorRes.ok) {
          const data = await vendorRes.json();
          setVendors(Array.isArray(data) ? data : data.vendors || []);
        }
      } catch { }
    }
    fetchMeta();
  }, []);

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
      {/* Filter Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-3 sm:p-4 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-all outline-none"
            />
          </div>

          {/* Category Chips (desktop) */}
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

          {/* Category Select (mobile) */}
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

          {/* Sort */}
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

          {/* Advanced toggle */}
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

        {/* Advanced filters */}
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
              placeholder="Min price (N$)"
              value={filters.minPrice}
              onChange={(e) => updateFilter("minPrice", e.target.value)}
              className="w-full sm:w-36 px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-all outline-none"
            />
            <input
              type="number"
              placeholder="Max price (N$)"
              value={filters.maxPrice}
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
              className="w-full sm:w-36 px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-all outline-none"
            />
          </div>
        )}

        {/* Active filter pills */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Filters:</span>
            {filters.category && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                {categories.find((c) => c.id === filters.category)?.name || "Category"}
                <button onClick={() => updateFilter("category", "")} className="hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.vendorId && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                {vendors.find((v) => v.id === filters.vendorId)?.name || "Vendor"}
                <button onClick={() => updateFilter("vendorId", "")} className="hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                N$ {filters.minPrice || "0"} – {filters.maxPrice || "\u221E"}
                <button onClick={() => { updateFilter("minPrice", ""); updateFilter("maxPrice", ""); }} className="hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <SkeletonGrid count={10} />
      ) : (
        <ProductGrid products={products} sponsored={sponsored} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8 sm:mt-10">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-sm text-slate-500 font-medium px-2">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}

export default function ProductsPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl text-slate-900">
          <span className="highlighter text-red-600">Browse</span> Products
        </h1>
        <p className="text-slate-500 mt-1 text-xs sm:text-sm">
          Compare prices across vendors and find the best deals in Namibia
        </p>
      </div>

      <Suspense fallback={<SkeletonGrid count={10} />}>
        <ProductsContent />
      </Suspense>
    </div>
  );
}
