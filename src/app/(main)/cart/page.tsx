/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import {
  Trash2,
  Minus,
  Plus,
  Share2,
  ExternalLink,
  CheckCircle2,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import {
  generateWhatsAppLink,
  generateCartMessage,
} from "@/lib/whatsapp";
import Link from "next/link";
import { StoreLogo } from "@/components/store-logo";

export default function CartPage() {
  const { items, calculation, loading, removeItem, updateQuantity, clearCart, calculate } =
    useCart();
  const [productNames, setProductNames] = useState<Record<string, string>>({});

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

  /* ── Empty State ─────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-16 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <div className="mb-5">
          <img src="/icons/emptycart.png" alt="Empty Cart" className="h-20 w-auto mx-auto opacity-80" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Your cart is empty</h1>
        <p className="text-slate-500 mb-6 text-sm">
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

  /* ── Data ──────────────────────────────────────── */
  const fullStores = calculation?.stores?.filter((s) => s.hasAllItems) || [];
  const partialStores = calculation?.stores?.filter((s) => !s.hasAllItems) || [];
  const cheapestStore = fullStores.length > 0 ? fullStores[0] : calculation?.stores?.[0] || null;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-10 py-4 sm:py-8">
      {/* ═══ Header ═══════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-heading text-xl sm:text-3xl text-slate-900">Smart Cart</h1>
          <p className="text-slate-500 mt-0.5 text-xs sm:text-sm">
            {items.length} {items.length === 1 ? "item" : "items"} — comparing across stores
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {cheapestStore && (
            <button
              onClick={() => {
                const link = generateWhatsAppLink("", generateCartMessage(cheapestStore.storeName, cheapestStore.items, cheapestStore.total));
                window.open(link, "_blank");
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-xl font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share to</span> WhatsApp
            </button>
          )}
          <button
            onClick={clearCart}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs sm:text-sm hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">

        {/* ═══ LEFT: Cart Items ═══════════════════════ */}
        <div className="lg:col-span-7 space-y-5">

          {/* Best Deal Alert */}
          {calculation && fullStores.length > 0 && calculation.maxSavings > 0 && cheapestStore && (
            <div className="bg-green-50 border border-green-200 p-3 sm:p-4 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-green-800 text-xs sm:text-sm">Best Deal Found</p>
                <p className="text-[11px] sm:text-xs text-green-700 mt-0.5">
                  <strong>{cheapestStore.storeName}</strong> has all {items.length} items for the lowest total.
                  {" "}Save <strong>{formatCurrency(calculation.maxSavings)}</strong> vs. most expensive.
                </p>
              </div>
            </div>
          )}

          {/* No full coverage notice */}
          {calculation && fullStores.length === 0 && partialStores.length > 0 && (
            <p className="text-xs text-slate-400 italic">
              No single store carries all your items — results are sorted by coverage.
            </p>
          )}

          {/* Item Cards */}
          <div className="space-y-2">
            {items.map((item) => {
              const name = item.productName || productNames[item.productId] || "Loading...";
              return (
                <div key={item.productId} className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 flex items-center gap-3">
                  {/* Image */}
                  <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    {item.productImage ? (
                      <img src={item.productImage} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <ShoppingBag className="h-5 w-5 text-slate-200" />
                    )}
                  </div>
                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{name}</p>
                  </div>
                  {/* Qty */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      className="h-7 w-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                    <button
                      className="h-7 w-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  {/* Delete */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ RIGHT: Store Comparison ═══════════════ */}
        <div className="lg:col-span-5 space-y-4">
          <div className="lg:sticky lg:top-24 space-y-4">

            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              Store Comparison
            </h2>

            {loading ? (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-8 bg-slate-100 rounded" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ) : calculation && calculation.stores.length > 0 ? (
              <div className="space-y-3">
                {/* Store Cards */}
                {calculation.stores.map((store, idx) => {
                  const isCheapest = store.storeId === calculation.cheapestStoreId;

                  return (
                    <div
                      key={store.storeId}
                      className={cn(
                        "rounded-xl border p-4 transition-all",
                        isCheapest
                          ? "bg-white border-primary/30 shadow-md shadow-primary/5 ring-1 ring-primary/10"
                          : "bg-white border-slate-200"
                      )}
                    >
                      {/* Store Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          "h-10 w-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center",
                          isCheapest ? "bg-primary/5 border border-primary/20" : "bg-slate-50 border border-slate-100"
                        )}>
                          <StoreLogo src={store.storeLogoUrl} name={store.storeName} size="sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-slate-900 truncate">{store.storeName}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {store.hasAllItems ? (
                              <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                All items
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md">
                                {store.itemCount}/{store.totalItems} items
                              </span>
                            )}
                            {isCheapest && (
                              <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">
                                BEST PRICE
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Price */}
                        <div className="text-right shrink-0">
                          <p className={cn(
                            "text-lg font-black",
                            isCheapest ? "text-primary" : "text-slate-900"
                          )}>
                            {formatCurrency(store.total)}
                          </p>
                          {!store.hasAllItems && (
                            <p className="text-[9px] text-slate-400">for {store.itemCount} items</p>
                          )}
                        </div>
                      </div>

                      {/* Item list preview */}
                      <div className="text-[11px] text-slate-500 space-y-0.5 mb-3">
                        {store.items.slice(0, 2).map((it) => (
                          <div key={it.productId} className="flex justify-between">
                            <span className="truncate mr-3">{it.productName} ×{it.quantity}</span>
                            <span className="font-medium text-slate-700 shrink-0">{formatCurrency(it.price)}</span>
                          </div>
                        ))}
                        {store.items.length > 2 && (
                          <p className="text-slate-400">+{store.items.length - 2} more items</p>
                        )}
                      </div>

                      {/* Action */}
                      <button
                        onClick={() => {
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
                        className={cn(
                          "w-full py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2",
                          isCheapest
                            ? "bg-primary hover:bg-primary/90 text-white"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                        )}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {isCheapest ? "Shop at" : "Go to"} {store.storeName}
                      </button>
                    </div>
                  );
                })}

                {/* Savings chip */}
                {calculation.maxSavings > 0 && fullStores.length >= 2 && (
                  <div className="text-center">
                    <span className="inline-block bg-green-100 text-green-700 text-[11px] font-bold px-3 py-1 rounded-full">
                      You save {formatCurrency(calculation.maxSavings)} vs. most expensive option
                    </span>
                  </div>
                )}

                {/* WhatsApp */}
                {cheapestStore && (
                  <button
                    className="w-full border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    onClick={() => {
                      const link = generateWhatsAppLink("", generateCartMessage(cheapestStore.storeName, cheapestStore.items, cheapestStore.total));
                      window.open(link, "_blank");
                    }}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Share via WhatsApp
                  </button>
                )}

                {/* Multi-store note */}
                {calculation.stores.length > 1 && (
                  <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    Prices may vary. Each button takes you to the store&apos;s site.
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-5 text-center text-slate-400 text-sm">
                <p>No store prices found for your items</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
