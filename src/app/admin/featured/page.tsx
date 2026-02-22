/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Diamond,
  Plus,
  Trash2,
  Loader2,
  Search,
  X,
  CalendarDays,
  Clock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FeaturedProduct {
  id: string;
  productId: string;
  productName: string;
  priority: "premium" | "standard";
  durationDays: number;
  startsAt: string;
  expiresAt: string;
  active: boolean;
  createdAt: string;
}

interface ProductSearchResult {
  id: string;
  name: string;
  imageUrl?: string;
  price?: number;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AdminFeaturedPage() {
  const [items, setItems] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  /* ---------- fetch featured products ---------- */

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/featured");
      if (res.ok) {
        const data: FeaturedProduct[] = await res.json();
        setItems(data);
      }
    } catch {
      /* swallow */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  /* ---------- toggle active ---------- */

  async function handleToggle(item: FeaturedProduct) {
    const prev = items;
    // Optimistic update
    setItems((cur) =>
      cur.map((i) => (i.id === item.id ? { ...i, active: !i.active } : i))
    );

    try {
      const res = await fetch(`/api/admin/featured/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !item.active }),
      });

      if (!res.ok) throw new Error();
      toast.success(
        !item.active ? "Featured product activated" : "Featured product paused"
      );
    } catch {
      setItems(prev);
      toast.error("Failed to update status");
    }
  }

  /* ---------- delete ---------- */

  async function handleDelete(id: string) {
    if (!confirm("Remove this featured product?")) return;

    try {
      const res = await fetch(`/api/admin/featured/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Featured product removed");
        setItems((cur) => cur.filter((i) => i.id !== id));
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to delete");
    }
  }

  /* ---------- helpers ---------- */

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function isExpired(iso: string) {
    return new Date(iso) < new Date();
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Featured Products
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage products highlighted on the homepage
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Featured
        </Button>
      </div>

      {/* Add Featured Form */}
      {showForm && (
        <AddFeaturedForm
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            fetchItems();
          }}
        />
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-slate-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl">
          <Diamond className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">
            No featured products yet
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Add products to highlight them on the homepage
          </p>
        </div>
      )}

      {/* Featured list */}
      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => {
            const expired = isExpired(item.expiresAt);
            const isPremium = item.priority === "premium";

            return (
              <div
                key={item.id}
                className={`flex flex-col sm:flex-row sm:items-center gap-4 border rounded-2xl p-4 sm:p-5 bg-white transition-colors ${
                  expired
                    ? "border-slate-200 opacity-60"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Left: Icon + info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isPremium
                        ? "bg-amber-100 text-amber-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <Diamond className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900 truncate">
                        {item.productName}
                      </p>
                      <Badge
                        className={
                          isPremium
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-blue-100 text-blue-700 border-blue-200"
                        }
                      >
                        {isPremium ? "Premium" : "Standard"}
                      </Badge>
                      {expired && (
                        <Badge variant="secondary" className="text-xs">
                          Expired
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {item.durationDays} days
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Expires {formatDate(item.expiresAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-3 shrink-0 sm:ml-auto">
                  {/* Active toggle switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.active}
                    onClick={() => handleToggle(item)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0056b2] focus-visible:ring-offset-2 ${
                      item.active ? "bg-[#0056b2]" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                        item.active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span
                    className={`text-xs font-medium w-12 ${
                      item.active ? "text-[#0056b2]" : "text-slate-400"
                    }`}
                  >
                    {item.active ? "Active" : "Paused"}
                  </span>

                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add Featured Form (inline)                                         */
/* ------------------------------------------------------------------ */

function AddFeaturedForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductSearchResult | null>(null);
  const [priority, setPriority] = useState<"premium" | "standard">("standard");
  const [durationDays, setDurationDays] = useState(7);
  const [submitting, setSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /* ---- product search with debounce ---- */

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setSelectedProduct(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(value.trim())}&pageSize=10`
        );
        if (res.ok) {
          const data = await res.json();
          // API may return { products: [...] } or just [...]
          const products: ProductSearchResult[] = Array.isArray(data)
            ? data
            : data.products ?? [];
          setSearchResults(products);
          setShowDropdown(products.length > 0);
        }
      } catch {
        /* swallow */
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  function selectProduct(product: ProductSearchResult) {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setShowDropdown(false);
  }

  /* ---- close dropdown on outside click ---- */

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  /* ---- submit ---- */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error("Please select a product from the search results");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          priority,
          durationDays,
        }),
      });

      if (res.ok) {
        toast.success("Featured product added");
        onCreated();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to add featured product");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-slate-200 rounded-2xl p-6 bg-white space-y-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Add Featured Product
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product search */}
        <div className="md:col-span-2 space-y-2" ref={wrapperRef}>
          <label className="text-sm font-medium text-slate-700">
            Product *
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search for a product..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0 && !selectedProduct)
                  setShowDropdown(true);
              }}
              className="pl-9"
              required
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
            )}
          </div>

          {/* Selected indicator */}
          {selectedProduct && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-xl">
              <Diamond className="h-3.5 w-3.5" />
              Selected: <span className="font-medium">{selectedProduct.name}</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(null);
                  setSearchQuery("");
                }}
                className="ml-auto text-green-500 hover:text-green-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Search dropdown */}
          {showDropdown && (
            <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-lg">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => selectProduct(product)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-8 w-8 rounded-lg object-cover border border-slate-100"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {product.name}
                    </p>
                    {product.price !== undefined && (
                      <p className="text-xs text-slate-500">
                        KSh {product.price.toLocaleString()}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Priority
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPriority("standard")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                priority === "standard"
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Diamond className="h-4 w-4" />
              Standard
            </button>
            <button
              type="button"
              onClick={() => setPriority("premium")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                priority === "premium"
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Diamond className="h-4 w-4" />
              Premium
            </button>
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Duration (days)
          </label>
          <Input
            type="number"
            min={1}
            max={365}
            value={durationDays}
            onChange={(e) =>
              setDurationDays(Math.max(1, parseInt(e.target.value) || 1))
            }
            required
          />
          <p className="text-xs text-slate-400">
            Product will be featured for {durationDays} day
            {durationDays !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <Button
          type="submit"
          disabled={submitting || !selectedProduct}
          className="bg-[#0056b2] hover:bg-[#004a99]"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Diamond className="h-4 w-4 mr-2" />
          )}
          {submitting ? "Adding..." : "Add Featured Product"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
