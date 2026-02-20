"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartCalculation } from "@/types";

interface CartStore {
  items: CartItem[];
  calculation: CartCalculation | null;
  loading: boolean;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  calculate: () => Promise<void>;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      calculation: null,
      loading: false,

      addItem: (productId: string) => {
        const { items } = get();
        const existing = items.find((i) => i.productId === productId);

        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === productId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
            calculation: null,
          });
        } else {
          set({
            items: [...items, { productId, quantity: 1 }],
            calculation: null,
          });
        }
      },

      removeItem: (productId: string) => {
        set({
          items: get().items.filter((i) => i.productId !== productId),
          calculation: null,
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
          calculation: null,
        });
      },

      clearCart: () => {
        set({ items: [], calculation: null });
      },

      calculate: async () => {
        const { items } = get();
        if (items.length === 0) return;

        set({ loading: true });

        try {
          const res = await fetch("/api/cart/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
          });

          if (!res.ok) throw new Error("Failed to calculate");

          const calculation: CartCalculation = await res.json();
          set({ calculation, loading: false });
        } catch {
          set({ loading: false });
        }
      },
    }),
    {
      name: "made-market-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
