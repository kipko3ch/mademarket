import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storeProducts, products, stores, categories } from "@/db/schema";
import { eq, and, inArray, ilike } from "drizzle-orm";
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
      conditions.push(ilike(products.normalizedName, `%${search.toLowerCase()}%`));
    }

    if (category) {
      conditions.push(eq(products.categoryId, category));
    }

    // Single query: get all prices for selected stores
    const rows = await db
      .select({
        productId: products.id,
        productName: products.name,
        categoryName: categories.name,
        storeId: stores.id,
        storeName: stores.name,
        price: storeProducts.price,
      })
      .from(storeProducts)
      .innerJoin(products, eq(storeProducts.productId, products.id))
      .innerJoin(stores, eq(storeProducts.storeId, stores.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(products.name, stores.name);

    // Group by product
    const productMap = new Map<string, CompareResult>();

    for (const row of rows) {
      if (!productMap.has(row.productId)) {
        productMap.set(row.productId, {
          productId: row.productId,
          productName: row.productName,
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
