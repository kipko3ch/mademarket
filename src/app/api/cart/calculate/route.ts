import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storeProducts, products, stores } from "@/db/schema";
import { inArray, eq, and, sql } from "drizzle-orm";
import { z } from "zod";
import type { CartCalculation, CartStoreBreakdown } from "@/types";

export const dynamic = "force-dynamic";

const cartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive().default(1),
    })
  ).min(1, "Cart must have at least one item"),
});

// POST /api/cart/calculate — Smart Cart Engine
// Optimized single query: group by store, SUM(price * quantity), find cheapest
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = cartSchema.parse(body);

    const productIds = items.map((item) => item.productId);
    const quantityMap = new Map(items.map((i) => [i.productId, i.quantity]));

    // Single optimized query: get all store prices for requested products
    // grouped by store with totals
    const results = await db
      .select({
        storeId: stores.id,
        storeName: stores.name,
        storeWhatsapp: stores.whatsappNumber,
        productId: storeProducts.productId,
        productName: products.name,
        price: storeProducts.price,
      })
      .from(storeProducts)
      .innerJoin(stores, and(
        eq(storeProducts.storeId, stores.id),
        eq(stores.approved, true)
      ))
      .innerJoin(products, eq(storeProducts.productId, products.id))
      .where(
        and(
          inArray(storeProducts.productId, productIds),
          eq(storeProducts.inStock, true)
        )
      )
      .orderBy(stores.name, products.name);

    // Group results by store and calculate totals
    const storeMap = new Map<string, CartStoreBreakdown>();

    for (const row of results) {
      const quantity = quantityMap.get(row.productId) || 1;
      const price = Number(row.price);

      if (!storeMap.has(row.storeId)) {
        storeMap.set(row.storeId, {
          storeId: row.storeId,
          storeName: row.storeName,
          total: 0,
          items: [],
        });
      }

      const store = storeMap.get(row.storeId)!;
      store.items.push({
        productId: row.productId,
        productName: row.productName,
        price,
        quantity,
      });
      store.total += price * quantity;
    }

    const storeBreakdowns = Array.from(storeMap.values());

    // Only consider stores that have ALL requested products
    const fullStores = storeBreakdowns.filter(
      (s) => s.items.length === productIds.length
    );

    // If no store has all products, include partial stores too
    const candidates = fullStores.length > 0 ? fullStores : storeBreakdowns;

    if (candidates.length === 0) {
      return NextResponse.json({
        stores: [],
        cheapestStoreId: null,
        cheapestTotal: 0,
        maxSavings: 0,
      });
    }

    // Round totals
    candidates.forEach((s) => {
      s.total = Math.round(s.total * 100) / 100;
    });

    // Sort by total ascending
    candidates.sort((a, b) => a.total - b.total);

    const cheapest = candidates[0];
    const mostExpensive = candidates[candidates.length - 1];

    const response: CartCalculation = {
      stores: candidates,
      cheapestStoreId: cheapest.storeId,
      cheapestTotal: cheapest.total,
      maxSavings: Math.round((mostExpensive.total - cheapest.total) * 100) / 100,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Cart calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate cart" },
      { status: 500 }
    );
  }
}
