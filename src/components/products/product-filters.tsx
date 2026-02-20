"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Store {
  id: string;
  name: string;
}

interface ProductFiltersProps {
  categories: Category[];
  stores: Store[];
  onFilterChange: (filters: {
    search: string;
    category: string;
    storeId: string;
    sortBy: string;
    minPrice: string;
    maxPrice: string;
  }) => void;
}

export function ProductFilters({
  categories,
  stores,
  onFilterChange,
}: ProductFiltersProps) {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    storeId: "",
    sortBy: "name",
    minPrice: "",
    maxPrice: "",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  function updateFilter(key: string, value: string) {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilterChange(updated);
  }

  function clearFilters() {
    const cleared = {
      search: "",
      category: "",
      storeId: "",
      sortBy: "name",
      minPrice: "",
      maxPrice: "",
    };
    setFilters(cleared);
    onFilterChange(cleared);
  }

  const hasActiveFilters = filters.category || filters.storeId || filters.minPrice || filters.maxPrice;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category */}
        <Select
          value={filters.category}
          onValueChange={(v) => updateFilter("category", v)}
        >
          <SelectTrigger className="w-full sm:w-48">
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

        {/* Sort */}
        <Select
          value={filters.sortBy}
          onValueChange={(v) => updateFilter("sortBy", v)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/30 rounded-lg">
          <Select
            value={filters.storeId}
            onValueChange={(v) => updateFilter("storeId", v)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Min price"
            value={filters.minPrice}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
            className="w-full sm:w-32"
          />
          <Input
            type="number"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
            className="w-full sm:w-32"
          />
        </div>
      )}

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {filters.category && (
            <Badge variant="secondary" className="text-xs">
              Category
              <button onClick={() => updateFilter("category", "")} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.storeId && (
            <Badge variant="secondary" className="text-xs">
              Store
              <button onClick={() => updateFilter("storeId", "")} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
