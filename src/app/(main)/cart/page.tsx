"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  Trophy,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  generateWhatsAppLink,
  generateCartMessage,
} from "@/lib/whatsapp";

export default function CartPage() {
  const { items, calculation, loading, removeItem, updateQuantity, clearCart, calculate } =
    useCart();
  const [productNames, setProductNames] = useState<Record<string, string>>({});

  // Fetch product names for cart items
  useEffect(() => {
    if (items.length === 0) return;

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
      } catch {}
    }
    fetchNames();
  }, [items]);

  // Auto-calculate when items change
  useEffect(() => {
    if (items.length > 0) {
      calculate();
    }
  }, [items, calculate]);

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">
          Add products to see which store gives you the best deal
        </p>
        <a href="/products">
          <Button>Browse Products</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Smart Cart</h1>
          <p className="text-muted-foreground mt-1">
            {items.length} {items.length === 1 ? "item" : "items"} — we&apos;ll
            find the cheapest store
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={clearCart}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <Card key={item.productId}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {productNames[item.productId] || item.productId}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.productId, parseInt(e.target.value) || 1)
                    }
                    className="w-14 text-center h-8"
                    min={1}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Store breakdown */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-8 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ) : calculation && calculation.stores.length > 0 ? (
            <>
              {/* Savings highlight */}
              {calculation.maxSavings > 0 && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4 text-center">
                    <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-700">
                      You can save up to
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      ${calculation.maxSavings.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      by shopping at the cheapest store
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Per-store breakdown */}
              {calculation.stores.map((store, idx) => {
                const isCheapest = store.storeId === calculation.cheapestStoreId;
                return (
                  <Card
                    key={store.storeId}
                    className={cn(
                      isCheapest && "border-green-300 ring-1 ring-green-200"
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {store.storeName}
                        </CardTitle>
                        {isCheapest && (
                          <Badge className="bg-green-600">Cheapest</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {store.items.map((item) => (
                          <div
                            key={item.productId}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-muted-foreground truncate mr-2">
                              {item.productName} x{item.quantity}
                            </span>
                            <span className="font-medium shrink-0">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-3" />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span
                          className={cn(
                            "text-lg",
                            isCheapest && "text-green-600"
                          )}
                        >
                          ${store.total.toFixed(2)}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="flex-1">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Checkout
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            const link = generateWhatsAppLink(
                              "",
                              generateCartMessage(
                                store.storeName,
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
                    </CardContent>
                  </Card>
                );
              })}
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <p>No store prices found for your items</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
