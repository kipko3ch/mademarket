import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storeProducts, products, stores, categories } from "@/db/schema";
import { eq, and, inArray, ilike, or } from "drizzle-orm";
import { normalizeProductName } from "@/lib/utils";
import type { CompareResult } from "@/types";

export const dynamic = "force-dynamic";

// GET /api/compare?storeIds=id1,id2,id3&category=cat&search=query
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams;
  const storeIdsParam = url.get("storeIds") || "";
  const category = url.get("category") || "";
  const search = url.get("search") || "";

  const storeIds = storeIdsParam.split(",").filter(Boolean);

  if (storeIds.length < 2 || storeIds.length > 3) {
    return NextResponse.json(
      { error: "Select 2 or 3 stores to compare" },
      { status: 400 }
    );
  }

  try {
    // Build conditions
    const conditions = [
      inArray(storeProducts.storeId, storeIds),
      eq(storeProducts.inStock, true),
    ];

    if (search) {
      const normalizedSearch = normalizeProductName(search);
      conditions.push(
        or(
          ilike(products.normalizedName, `%${normalizedSearch}%`),
          ilike(products.name, `%${search}%`)
        )!
      );
    }

    if (category) {
      conditions.push(eq(products.categoryId, category));
    }

    // Single query: get all prices for selected stores
    // Now includes productImage for display
    const rows = await db
      .select({
        productId: products.id,
        productName: products.name,
        productImage: products.imageUrl,
        categoryName: categories.name,
        storeId: stores.id,
        storeName: stores.name,
        price: storeProducts.price,
      })
      .from(storeProducts)
      .innerJoin(products, eq(storeProducts.productId, products.id))
      .innerJoin(stores, and(eq(storeProducts.storeId, stores.id), eq(stores.approved, true), eq(stores.suspended, false)))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(products.name, stores.name);

    // Group by product — since products table is the canonical source,
    // products with the same ID are guaranteed to be the same real-world item
    const productMap = new Map<string, CompareResult>();

    for (const row of rows) {
      if (!productMap.has(row.productId)) {
        productMap.set(row.productId, {
          productId: row.productId,
          productName: row.productName,
          productImage: row.productImage,
          category: row.categoryName || "Uncategorized",
          prices: [],
        });
      }

      productMap.get(row.productId)!.prices.push({
        storeId: row.storeId,
        storeName: row.storeName,
        price: Number(row.price),
        isCheapest: false,
        difference: 0,
      });
    }

    // Calculate cheapest and differences
    const results: CompareResult[] = [];

    for (const product of productMap.values()) {
      if (product.prices.length < 2) continue; // Only include products in 2+ stores

      const minPrice = Math.min(...product.prices.map((p) => p.price));

      product.prices.forEach((p) => {
        p.isCheapest = p.price === minPrice;
        p.difference = Math.round((p.price - minPrice) * 100) / 100;
      });

      results.push(product);
    }

    // Sort by savings (highest difference first)
    results.sort((a, b) => {
      const aMax = Math.max(...a.prices.map(p => p.difference));
      const bMax = Math.max(...b.prices.map(p => p.difference));
      return bMax - aMax;
    });

    // Get store info for the selected stores
    const selectedStores = await db
      .select({
        id: stores.id,
        name: stores.name,
        logoUrl: stores.logoUrl,
      })
      .from(stores)
      .where(inArray(stores.id, storeIds));

    return NextResponse.json({
      results,
      stores: selectedStores,
      totalProducts: results.length,
    });
  } catch (error) {
    console.error("Comparison error:", error);
    return NextResponse.json(
      { error: "Failed to compare prices" },
      { status: 500 }
    );
  }
}
