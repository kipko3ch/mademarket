"use client";

import { useEffect, useState } from "react";
import { useCompare } from "@/hooks/use-compare";
import { useCart } from "@/hooks/use-cart";
import { StoreLogo } from "@/components/store-logo";
import { Search, ArrowRightLeft, ArrowUpDown, ShoppingCart, Plus, Check } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { cn, productUrl } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

interface StoreOption {
  id: string;
  name: string;
  logoUrl: string | null;
  productCount: number;
}

type SortMode = "name" | "savings";

export default function ComparePage() {
  const [availableStores, setAvailableStores] = useState<StoreOption[]>([]);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("savings");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());
  const {
    selectedStoreIds,
    results,
    stores: comparedStores,
    loading,
    toggleStore,
    compare,
  } = useCompare();
  const { addItem } = useCart();

  function toggleProductSelection(productId: string) {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function addSingleToCart(productId: string, productName: string, productImage?: string | null) {
    addItem(productId, productName, productImage);
    setAddedProducts((prev) => new Set(prev).add(productId));
    toast.success(`${productName} added to cart`);
    setTimeout(() => {
      setAddedProducts((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }, 2000);
  }

  function addSelectedToCart() {
    const toAdd = sortedResults.filter((r) => selectedProducts.has(r.productId));
    if (toAdd.length === 0) {
      toast.error("Select products to add to cart");
      return;
    }
    for (const r of toAdd) {
      addItem(r.productId, r.productName, r.productImage);
    }
    toast.success(`${toAdd.length} item${toAdd.length > 1 ? "s" : ""} added to Smart Cart`);
    setSelectedProducts(new Set());
  }

  useEffect(() => {
    fetch("/api/stores")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAvailableStores(data); })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (selectedStoreIds.length >= 2) {
      compare(undefined, search || undefined);
    }
  }, [selectedStoreIds.length]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch() {
    if (selectedStoreIds.length >= 2) {
      compare(undefined, search || undefined);
    }
  }

  const sortedResults = [...results].sort((a, b) => {
    if (sortMode === "savings") {
      const savA = Math.max(...a.prices.map((p) => p.price)) - Math.min(...a.prices.map((p) => p.price));
      const savB = Math.max(...b.prices.map((p) => p.price)) - Math.min(...b.prices.map((p) => p.price));
      return savB - savA;
    }
    return a.productName.localeCompare(b.productName);
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-10 py-4 sm:py-8">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">

        {/* ── Sidebar Filters ─────────────────────────── */}
        <aside className="w-full lg:w-64 space-y-6">
          <div>
            <h2 className="font-heading text-sm mb-4 uppercase tracking-wider text-slate-500">
              Search Results
            </h2>
            <div className="flex flex-wrap gap-2 text-sm text-slate-500">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <span className="text-slate-900 font-semibold">Compare</span>
            </div>
          </div>

          {/* Store selection */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-primary" />
              Retailer
            </h3>
            <div className="space-y-3">
              {availableStores.map((store) => {
                const isSelected = selectedStoreIds.includes(store.id);
                return (
                  <label key={store.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleStore(store.id)}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-600 group-hover:text-primary">
                      {store.name}
                    </span>
                  </label>
                );
              })}
            </div>
            {availableStores.length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center">No stores available</p>
            )}
            {selectedStoreIds.length > 0 && selectedStoreIds.length < 2 && (
              <p className="text-xs text-amber-600 mt-3 font-medium">
                Select at least one more store
              </p>
            )}
          </div>

          {/* Product search */}
          {selectedStoreIds.length >= 2 && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                Filter
              </h3>
              <input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-3 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="mt-3 w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
              >
                {loading ? "Loading..." : "Search"}
              </button>
            </div>
          )}
        </aside>

        {/* ── Main Content Area ───────────────────────── */}
        <div className="flex-1">
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="font-heading text-lg sm:text-2xl text-slate-900">Price Comparison</h2>
              {sortedResults.length > 0 && (
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
                  Found {sortedResults.length} matching products
                </p>
              )}
            </div>
            {sortedResults.length > 0 && (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  className="text-slate-500 hover:text-primary font-medium flex items-center gap-1 text-xs sm:text-sm"
                  onClick={() => setSortMode(sortMode === "savings" ? "name" : "savings")}
                >
                  <ArrowUpDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {sortMode === "savings" ? "Biggest savings" : "A–Z"}
                </button>
                <button
                  onClick={addSelectedToCart}
                  className="bg-primary hover:bg-primary/90 text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg font-bold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm transition-colors shadow-lg shadow-primary/20"
                >
                  <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Add Selected to</span> Smart Cart
                  {selectedProducts.size > 0 && (
                    <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {selectedProducts.size}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500">Comparing prices...</p>
            </div>
          )}

          {/* ── Desktop Table ─────────────────────────── */}
          {!loading && sortedResults.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden hidden sm:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-4 font-heading text-xs uppercase tracking-wider text-slate-400 min-w-[240px]">
                        Product Details
                      </th>
                      {comparedStores.map((store) => (
                        <th key={store.id} className="p-4 text-center min-w-[140px]">
                          <Link href={`/store/${store.id}`} className="flex flex-col items-center gap-1 hover:opacity-100 transition-all">
                            <div className="h-8 w-24 flex items-center justify-center grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all">
                              <StoreLogo src={store.logoUrl} name={store.name} size="sm" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {store.name}
                            </span>
                          </Link>
                        </th>
                      ))}
                      <th className="p-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedResults.map((result) => {
                      const prices = result.prices;
                      const minP = Math.min(...prices.map((p) => p.price));

                      return (
                        <tr key={result.productId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <Link href={productUrl(result.productId, result.productName)} className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                                {result.productImage ? (
                                  <img src={result.productImage} alt="" className="h-full w-full object-contain p-1" />
                                ) : (
                                  <img src="/icons/productplaceholder.png" alt="" className="h-5 w-5 object-contain opacity-40" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 hover:text-primary transition-colors">{result.productName}</p>
                                {result.category && (
                                  <p className="text-xs text-slate-500">{result.category}</p>
                                )}
                              </div>
                            </Link>
                          </td>
                          {comparedStores.map((store) => {
                            const priceEntry = prices.find((p) => p.storeId === store.id);
                            const isBest = priceEntry && priceEntry.price === minP;
                            return (
                              <td key={store.id} className="p-4 text-center">
                                {priceEntry ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <span className={cn(
                                      "text-lg font-bold",
                                      isBest ? "text-green-600" : "text-slate-900"
                                    )}>
                                      {formatCurrency(priceEntry.price)}
                                    </span>
                                    {isBest && (
                                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                                        BEST PRICE
                                      </span>
                                    )}
                                    {!isBest && priceEntry.difference > 0 && (
                                      <span className="text-[10px] text-red-500 font-medium">
                                        +{formatCurrency(priceEntry.difference)}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-slate-400">N/A</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedProducts.has(result.productId)}
                                onChange={() => toggleProductSelection(result.productId)}
                                className="rounded border-slate-300 text-primary focus:ring-primary"
                              />
                              <button
                                onClick={() => addSingleToCart(result.productId, result.productName, result.productImage)}
                                className={cn(
                                  "h-7 w-7 rounded-md flex items-center justify-center transition-colors",
                                  addedProducts.has(result.productId)
                                    ? "bg-green-100 text-green-600"
                                    : "bg-primary/10 text-primary hover:bg-primary/20"
                                )}
                                title="Add to cart"
                              >
                                {addedProducts.has(result.productId) ? (
                                  <Check className="h-3.5 w-3.5" />
                                ) : (
                                  <Plus className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="bg-slate-50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-slate-200">
                <div className="flex flex-col gap-2">
                  <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
                    Total Cart Estimate (Selected Items)
                  </h4>
                  <div className="flex gap-8">
                    {comparedStores.map((store) => {
                      const total = sortedResults.reduce((sum, result) => {
                        const pe = result.prices.find((p) => p.storeId === store.id);
                        return sum + (pe?.price || 0);
                      }, 0);
                      const allTotals = comparedStores.map((s) =>
                        sortedResults.reduce((sum, r) => {
                          const pe = r.prices.find((p) => p.storeId === s.id);
                          return sum + (pe?.price || 0);
                        }, 0)
                      );
                      const isCheapest = total <= Math.min(...allTotals);
                      return (
                        <div key={store.id}>
                          <p className={cn("text-[10px] font-bold uppercase", isCheapest ? "text-primary" : "text-slate-400")}>
                            {store.name}
                          </p>
                          <p className={cn("text-xl font-bold", isCheapest && "text-primary")}>
                            {formatCurrency(total)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 italic">Prices updated in real-time</span>
                  <button className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded font-bold text-sm transition-colors border border-primary/20">
                    Compare More Stores
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Mobile Card View ──────────────────────── */}
          {!loading && sortedResults.length > 0 && (
            <div className="block sm:hidden space-y-3">
              {sortedResults.map((result) => {
                const prices = result.prices;
                const minP = Math.min(...prices.map((p) => p.price));
                const maxP = Math.max(...prices.map((p) => p.price));
                const savings = maxP - minP;

                return (
                  <div key={result.productId} className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1 mr-2">
                        <p className="font-bold text-sm text-slate-900">{result.productName}</p>
                        {result.category && <p className="text-[10px] text-slate-500">{result.category}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {savings > 0 && (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Save {formatCurrency(savings)}
                          </span>
                        )}
                        <button
                          onClick={() => addSingleToCart(result.productId, result.productName, result.productImage)}
                          className={cn(
                            "h-7 px-2.5 rounded-lg flex items-center gap-1 text-[10px] font-bold transition-colors shrink-0",
                            addedProducts.has(result.productId)
                              ? "bg-green-100 text-green-600"
                              : "bg-primary/10 text-primary hover:bg-primary/20"
                          )}
                        >
                          {addedProducts.has(result.productId) ? (
                            <>
                              <Check className="h-3 w-3" />
                              Added
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3" />
                              Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {comparedStores.map((store) => {
                        const priceEntry = prices.find((p) => p.storeId === store.id);
                        const isBest = priceEntry && priceEntry.price === minP;
                        return (
                          <div key={store.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <StoreLogo src={store.logoUrl} name={store.name} size="xs" />
                              <span className="text-xs text-slate-500">{store.name}</span>
                            </div>
                            {priceEntry ? (
                              <div className="flex items-center gap-1.5">
                                <span className={cn("font-bold", isBest ? "text-green-600" : "text-slate-900")}>
                                  {formatCurrency(priceEntry.price)}
                                </span>
                                {isBest && (
                                  <span className="bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                    BEST
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">N/A</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty states */}
          {!loading && selectedStoreIds.length < 2 && results.length === 0 && (
            <div className="text-center py-10 sm:py-16">
              <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-3 sm:mb-4 p-3 sm:p-5">
                <img src="/icons/compare.png" alt="Compare" className="max-h-full max-w-full object-contain" />
              </div>
              <p className="text-sm sm:text-lg font-bold text-slate-900">Select at least 2 stores to compare</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Compare up to 3 stores at once to find the best deals</p>
            </div>
          )}

          {!loading && selectedStoreIds.length >= 2 && results.length === 0 && (
            <div className="text-center py-10 sm:py-16">
              <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <ArrowRightLeft className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-sm sm:text-lg font-bold text-slate-900">No shared products found</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                These stores do not currently stock any of the same core products.
                {search && " Try broadening your search or clearing the filter."}
              </p>
              <p className="text-xs text-slate-400 mt-3">
                Tip: Products must be linked to the same core product to appear in comparisons.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
