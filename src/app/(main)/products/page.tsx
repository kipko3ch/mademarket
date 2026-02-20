"use client";

import { useEffect, useState, useCallback } from "react";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Filters {
  search: string;
  category: string;
  storeId: string;
  sortBy: string;
  minPrice: string;
  maxPrice: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [sponsored, setSponsored] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "",
    storeId: "",
    sortBy: "name",
    minPrice: "",
    maxPrice: "",
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (filters.search) params.set("search", filters.search);
    if (filters.category && filters.category !== "all") params.set("category", filters.category);
    if (filters.storeId && filters.storeId !== "all") params.set("storeId", filters.storeId);
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

  // Fetch categories and stores on mount
  useEffect(() => {
    async function fetchMeta() {
      try {
        const [catRes, storeRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/stores"),
        ]);
        if (catRes.ok) setCategories(await catRes.json());
        if (storeRes.ok) setStores(await storeRes.json());
      } catch {}
    }
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced filter change
  function handleFilterChange(newFilters: Filters) {
    setPage(1);
    setFilters(newFilters);
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Products</h1>
        <p className="text-muted-foreground mt-1">
          Compare prices across stores and find the best deals
        </p>
      </div>

      <ProductFilters
        categories={categories}
        stores={stores}
        onFilterChange={handleFilterChange}
      />

      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-muted rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          <ProductGrid products={products} sponsored={sponsored} />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
