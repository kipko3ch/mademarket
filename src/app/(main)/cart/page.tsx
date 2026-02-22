/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  Lightbulb,
  Sparkles,
  Share2,
  Save,
  MessageCircle,
  Zap,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import {
  generateWhatsAppLink,
  generateCartMessage,
} from "@/lib/whatsapp";
import Link from "next/link";

export default function CartPage() {
  const { items, calculation, loading, removeItem, updateQuantity, clearCart, calculate } =
    useCart();
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [optimizeMode, setOptimizeMode] = useState<"combination" | "single">("combination");

  // Fallback: only fetch names for items that don't already have a productName (old cart data)
  useEffect(() => {
    const missing = items.filter((i) => !i.productName);
    if (missing.length === 0) return;
    async function fetchNames() {
      try {
        const res = await fetch("/api/products?pageSize=50");
        if (res.ok) {
          const data = await res.json();
          const names: Record<string, string> = {};
          for (const p of data.data) {
            names[p.id] = p.name;
          }
          setProductNames(names);
        }
      } catch { }
    }
    fetchNames();
  }, [items]);

  useEffect(() => {
    if (items.length > 0) calculate();
  }, [items, calculate]);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-16 text-center">
        <div className="mb-4">
          <img src="/icons/emptycart.png" alt="Empty Cart" className="h-20 w-auto mx-auto opacity-80" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Your cart is empty</h1>
        <p className="text-slate-500 mb-6">
          Add products to see which store gives you the best deal
        </p>
        <Link href="/products">
          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-primary/20">
            Browse Products
          </button>
        </Link>
      </div>
    );
  }

  const cheapestStore = calculation?.stores?.reduce((best, store) =>
    store.total < best.total ? store : best
    , calculation.stores[0]);

  return (
    <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-10 py-4 sm:py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Smart Cart</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-xs sm:text-base">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          {cheapestStore && (
            <button
              onClick={() => {
                const link = generateWhatsAppLink(
                  "",
                  generateCartMessage(cheapestStore.storeName, cheapestStore.items, cheapestStore.total)
                );
                window.open(link, "_blank");
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[#25D366] text-white rounded-lg font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity"
            >
              <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Share to</span> WhatsApp
            </button>
          )}
          <button
            onClick={clearCart}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-xs sm:text-sm hover:bg-slate-300 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">

        {/* ── Left Column: Cart Items ──────────────── */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">

          {/* Optimization Toggle */}
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-primary/10 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">Smart Optimization</span>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
                <button
                  className={cn(
                    "flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all",
                    optimizeMode === "combination"
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-500 hover:text-primary"
                  )}
                  onClick={() => setOptimizeMode("combination")}
                >
                  Combination
                </button>
                <button
                  className={cn(
                    "flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all",
                    optimizeMode === "single"
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-500 hover:text-primary"
                  )}
                  onClick={() => setOptimizeMode("single")}
                >
                  Single Store
                </button>
              </div>
            </div>
          </div>

          {/* Best Deal Alert */}
          {calculation && calculation.maxSavings > 0 && cheapestStore && (
            <div className="bg-primary/5 border border-primary/20 p-3 sm:p-4 rounded-xl flex items-start gap-3 sm:gap-4">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-full text-primary shrink-0">
                <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h4 className="font-bold text-primary text-xs sm:text-sm">Best Deal Breakdown</h4>
                <p className="text-[10px] sm:text-xs text-slate-600 mt-0.5 sm:mt-1">
                  Shop at <strong>{cheapestStore.storeName}</strong> to save{" "}
                  <span className="text-green-600 font-bold">{formatCurrency(calculation.maxSavings)}</span>.
                </p>
              </div>
            </div>
          )}

          {/* Items Table — Desktop */}
          <div className="hidden sm:block overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Item</th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase text-center">Qty</th>
                  {calculation?.stores?.slice(0, 3).map((store) => (
                    <th key={store.storeId} className="px-3 sm:px-4 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase text-right">
                      {store.storeName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const name = item.productName || productNames[item.productId] || "Loading...";
                  const storePrices = calculation?.stores?.map((store) => {
                    const storeItem = store.items.find((i) => i.productId === item.productId);
                    return { storeId: store.storeId, price: storeItem?.price ?? null, storeName: store.storeName };
                  }) || [];
                  const validPrices = storePrices.filter((sp) => sp.price !== null);
                  const cheapestPrice = validPrices.length > 0
                    ? Math.min(...validPrices.map((sp) => sp.price!))
                    : null;

                  return (
                    <tr key={item.productId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-3">
                          {(item.productImage) && (
                            <div className="h-10 w-10 rounded-lg bg-slate-50 overflow-hidden shrink-0">
                              <img src={item.productImage} alt="" className="h-full w-full object-contain p-1" />
                            </div>
                          )}
                          <p className="text-xs sm:text-sm font-semibold">{name}</p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            className="h-6 w-6 sm:h-7 sm:w-7 rounded-md border bg-white flex items-center justify-center hover:bg-slate-50 transition-colors"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </button>
                          <span className="text-xs sm:text-sm font-medium w-6 sm:w-8 text-center">{item.quantity}</span>
                          <button
                            className="h-6 w-6 sm:h-7 sm:w-7 rounded-md border bg-white flex items-center justify-center hover:bg-slate-50 transition-colors"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </button>
                        </div>
                      </td>
                      {calculation?.stores?.slice(0, 3).map((store) => {
                        const storeItem = store.items.find((i) => i.productId === item.productId);
                        const price = storeItem?.price ?? null;
                        const isBest = price !== null && cheapestPrice !== null && price === cheapestPrice;
                        return (
                          <td key={store.storeId} className="px-3 sm:px-4 py-3 sm:py-4 text-right">
                            {price !== null ? (
                              isBest ? (
                                <div className="px-2 py-0.5 sm:py-1 rounded bg-primary text-white text-[10px] sm:text-xs font-bold inline-block">
                                  {formatCurrency(price)}
                                </div>
                              ) : (
                                <span className="text-xs sm:text-sm text-slate-500">
                                  {formatCurrency(price)}
                                </span>
                              )
                            ) : (
                              <span className="text-xs sm:text-sm text-slate-400">N/A</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Items Cards — Mobile */}
          <div className="sm:hidden space-y-3">
            {items.map((item) => {
              const name = item.productName || productNames[item.productId] || "Loading...";
              const storePrices = calculation?.stores?.map((store) => {
                const storeItem = store.items.find((i) => i.productId === item.productId);
                return { storeId: store.storeId, price: storeItem?.price ?? null, storeName: store.storeName };
              }) || [];
              const validPrices = storePrices.filter((sp) => sp.price !== null);
              const cheapestPrice = validPrices.length > 0
                ? Math.min(...validPrices.map((sp) => sp.price!))
                : null;

              return (
                <div key={item.productId} className="bg-white border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      {(item.productImage) && (
                        <div className="h-8 w-8 rounded-lg bg-slate-50 overflow-hidden shrink-0">
                          <img src={item.productImage} alt="" className="h-full w-full object-contain p-0.5" />
                        </div>
                      )}
                      <p className="text-xs font-bold text-slate-900">{name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="h-6 w-6 rounded-md border bg-white flex items-center justify-center"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus className="h-2.5 w-2.5" />
                      </button>
                      <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        className="h-6 w-6 rounded-md border bg-white flex items-center justify-center"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {storePrices.map((sp) => {
                      const isBest = sp.price !== null && cheapestPrice !== null && sp.price === cheapestPrice;
                      return (
                        <div key={sp.storeId} className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">{sp.storeName}</span>
                          {sp.price !== null ? (
                            <span className={cn("font-bold", isBest ? "text-primary" : "text-slate-700")}>
                              {formatCurrency(sp.price)}
                              {isBest && (
                                <span className="ml-1.5 bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                                  BEST
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Column: Summary ───────────────── */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">

          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-8 bg-slate-100 rounded" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ) : calculation && calculation.stores.length > 0 ? (
            <>
              {/* Summary Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4 sm:space-y-5">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                  Order Summary
                </h3>

                {/* Store trips */}
                <div className="space-y-2.5 sm:space-y-3">
                  {calculation.stores.map((store, idx) => {
                    const isCheapest = store.storeId === calculation.cheapestStoreId;
                    const borderColors = ["border-red-500", "border-green-500", "border-blue-500", "border-yellow-500"];
                    return (
                      <div
                        key={store.storeId}
                        className={cn(
                          "p-3 sm:p-4 rounded-lg border-l-4 bg-slate-50",
                          borderColors[idx % borderColors.length]
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">{store.storeName}</span>
                          {isCheapest && (
                            <span className="bg-green-100 text-green-700 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                              CHEAPEST
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] sm:text-xs text-slate-500 space-y-0.5">
                          {store.items.slice(0, 3).map((item) => (
                            <p key={item.productId}>
                              {item.productName} × {item.quantity}
                            </p>
                          ))}
                          {store.items.length > 3 && (
                            <p className="text-slate-400">+{store.items.length - 3} more</p>
                          )}
                        </div>
                        <p className={cn(
                          "text-base sm:text-lg font-bold mt-1.5 sm:mt-2",
                          isCheapest ? "text-primary" : "text-slate-900"
                        )}>
                          {formatCurrency(store.total)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="border-t border-slate-200 pt-3 sm:pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm text-slate-600">Best Total</span>
                    <span className="text-xl sm:text-2xl font-black text-primary">
                      {cheapestStore ? formatCurrency(cheapestStore.total) : "—"}
                    </span>
                  </div>
                  {calculation.maxSavings > 0 && (
                    <div className="flex items-center justify-end">
                      <span className="bg-green-100 text-green-700 text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                        You save {formatCurrency(calculation.maxSavings)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Multi-store redirect notice */}
                {calculation.stores.length > 1 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] sm:text-xs text-amber-700">
                      Items are from multiple stores. You&apos;ll be redirected to each store separately to complete your purchase.
                    </p>
                  </div>
                )}

                {/* Redirect to store buttons */}
                <div className="space-y-2.5 sm:space-y-3">
                  {calculation.stores.map((store) => (
                    <button
                      key={store.storeId}
                      className={cn(
                        "w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2",
                        store.storeId === calculation.cheapestStoreId
                          ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                          : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                      )}
                      onClick={() => {
                        // Redirect to store website if available, otherwise WhatsApp
                        if (store.storeWebsiteUrl) {
                          window.open(store.storeWebsiteUrl, "_blank");
                        } else {
                          const link = generateWhatsAppLink(
                            store.storeWhatsapp || "",
                            generateCartMessage(store.storeName, store.items, store.total)
                          );
                          window.open(link, "_blank");
                        }
                      }}
                    >
                      <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {store.storeId === calculation.cheapestStoreId ? "Shop at" : "Go to"} {store.storeName}
                      <span className="text-xs opacity-75">({formatCurrency(store.total)})</span>
                    </button>
                  ))}

                  {cheapestStore && (
                    <button
                      className="w-full border border-slate-200 text-slate-700 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                      onClick={() => {
                        const link = generateWhatsAppLink(
                          "",
                          generateCartMessage(cheapestStore.storeName, cheapestStore.items, cheapestStore.total)
                        );
                        window.open(link, "_blank");
                      }}
                    >
                      <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Share via WhatsApp
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 text-center text-slate-500 text-sm">
              <p>No store prices found for your items</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
