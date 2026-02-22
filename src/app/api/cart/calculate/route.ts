import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storeProducts, products, stores } from "@/db/schema";
import { inArray, eq, and } from "drizzle-orm";
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
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = cartSchema.parse(body);

    const productIds = items.map((item) => item.productId);
    const quantityMap = new Map(items.map((i) => [i.productId, i.quantity]));
    const totalItemsRequested = productIds.length;

    // Single optimized query: get all store prices for requested products
    const results = await db
      .select({
        storeId: stores.id,
        storeName: stores.name,
        storeLogoUrl: stores.logoUrl,
        storeWhatsapp: stores.whatsappNumber,
        storeWebsiteUrl: stores.websiteUrl,
        productId: storeProducts.productId,
        productName: products.name,
        price: storeProducts.price,
      })
      .from(storeProducts)
      .innerJoin(stores, and(
        eq(storeProducts.storeId, stores.id),
        eq(stores.approved, true),
        eq(stores.suspended, false)
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
            storeLogoUrl: row.storeLogoUrl,
            storeWebsiteUrl: row.storeWebsiteUrl,
            storeWhatsapp: row.storeWhatsapp,
            total: 0,
          itemCount: 0,
          totalItems: totalItemsRequested,
          hasAllItems: false,
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
      store.itemCount = store.items.length;
    }

    const storeBreakdowns = Array.from(storeMap.values());

    // Mark which stores have all items
    for (const store of storeBreakdowns) {
      store.hasAllItems = store.itemCount === totalItemsRequested;
    }

    // Separate into full-coverage and partial-coverage stores
    const fullStores = storeBreakdowns.filter((s) => s.hasAllItems);
    const partialStores = storeBreakdowns.filter((s) => !s.hasAllItems);

    if (storeBreakdowns.length === 0) {
      return NextResponse.json({
        stores: [],
        cheapestStoreId: null,
        cheapestTotal: 0,
        maxSavings: 0,
      });
    }

    // Round totals
    storeBreakdowns.forEach((s) => {
      s.total = Math.round(s.total * 100) / 100;
    });

    // Sort full stores by total ascending, partial stores by coverage then price
    fullStores.sort((a, b) => a.total - b.total);
    partialStores.sort((a, b) => b.itemCount - a.itemCount || a.total - b.total);

    // Combined list: full stores first, then partial
    const sortedStores = [...fullStores, ...partialStores];

    // Only calculate savings among full-coverage stores (apples-to-apples comparison)
    let maxSavings = 0;
    let cheapestStoreId = sortedStores[0]?.storeId ?? null;
    let cheapestTotal = sortedStores[0]?.total ?? 0;

    if (fullStores.length >= 2) {
      const cheapestFull = fullStores[0];
      const mostExpensiveFull = fullStores[fullStores.length - 1];
      maxSavings = Math.round((mostExpensiveFull.total - cheapestFull.total) * 100) / 100;
      cheapestStoreId = cheapestFull.storeId;
      cheapestTotal = cheapestFull.total;
    } else if (fullStores.length === 1) {
      cheapestStoreId = fullStores[0].storeId;
      cheapestTotal = fullStores[0].total;
    }

    const response: CartCalculation = {
      stores: sortedStores,
      cheapestStoreId,
      cheapestTotal,
      maxSavings,
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
