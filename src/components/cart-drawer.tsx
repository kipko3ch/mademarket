"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  Trophy,
  Zap,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import {
  generateWhatsAppLink,
  generateCartMessage,
} from "@/lib/whatsapp";

export function CartDrawer() {
  const {
    items,
    calculation,
    loading,
    removeItem,
    updateQuantity,
    clearCart,
    calculate,
  } = useCart();
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  // Fetch product names
  useEffect(() => {
    if (items.length === 0) return;
    async function fetchNames() {
      try {
        const res = await fetch("/api/products?pageSize=100");
        if (res.ok) {
          const data = await res.json();
          const names: Record<string, string> = {};
          for (const p of data.data) names[p.id] = p.name;
          setProductNames(names);
        }
      } catch { }
    }
    fetchNames();
  }, [items]);

  // Auto-calculate
  useEffect(() => {
    if (items.length > 0 && open) calculate();
  }, [items, open, calculate]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[420px] flex flex-col p-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Smart Cart
              {itemCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </Badge>
              )}
            </SheetTitle>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={clearCart}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Add products to find the cheapest store
            </p>
            <Button size="sm" onClick={() => setOpen(false)} asChild>
              <a href="/products">Browse Products</a>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 rounded-xl bg-muted/40 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {productNames[item.productId] || "Loading..."}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      className="h-7 w-7 rounded-lg bg-background border flex items-center justify-center hover:bg-muted transition-colors"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      className="h-7 w-7 rounded-lg bg-background border flex items-center justify-center hover:bg-muted transition-colors"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Store breakdown */}
            <div className="border-t px-4 py-3 space-y-3 max-h-[50vh] overflow-y-auto">
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-8 bg-muted rounded" />
                </div>
              ) : calculation && calculation.branches.length > 0 ? (
                <>
                  {/* Savings banner */}
                  {calculation.maxSavings > 0 && (
                    <div className="flex items-center gap-2 rounded-xl bg-accent p-3">
                      <Trophy className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Potential savings
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(calculation.maxSavings)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Per-store totals */}
                  {calculation.branches.map((store) => {
                    const isCheapest =
                      store.branchId === calculation.cheapestBranchId;
                    return (
                      <div
                        key={store.branchId}
                        className={cn(
                          "rounded-xl border p-3",
                          isCheapest && "border-primary bg-primary/5"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {store.vendorName || store.branchName}
                            </span>
                            {isCheapest && (
                              <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                                Cheapest
                              </Badge>
                            )}
                          </div>
                          <span
                            className={cn(
                              "font-bold",
                              isCheapest && "text-primary"
                            )}
                          >
                            {formatCurrency(store.total)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {store.items.map((item) => (
                            <div
                              key={item.productId}
                              className="flex justify-between text-xs text-muted-foreground"
                            >
                              <span className="truncate mr-2">
                                {item.productName} x{item.quantity}
                              </span>
                              <span>
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                        {isCheapest && (
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="flex-1 h-8 text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Checkout
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={() => {
                                const link = generateWhatsAppLink(
                                  "",
                                  generateCartMessage(
                                    store.vendorName || store.branchName,
                                    store.items,
                                    store.total
                                  )
                                );
                                window.open(link, "_blank");
                              }}
                            >
                              <MessageCircle className="h-3 w-3 mr-1" />
                              WhatsApp
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No store prices found for your items
                </p>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
