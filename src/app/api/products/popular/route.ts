export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  products,
  productClicks,
  storeProducts,
  branches,
  vendors,
  categories,
  searchLogs,
} from "@/db/schema";
import { eq, and, gte, isNotNull, sql } from "drizzle-orm";

// GET /api/products/popular — Return top 10 popular products
// Popularity is based on productClicks (last 30 days) + searchLogs references
export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Subquery: click counts per product in last 30 days
    const clickCounts = db
      .select({
        productId: productClicks.productId,
        clickCount: sql<number>`count(*)`.as("click_count"),
      })
      .from(productClicks)
      .where(gte(productClicks.createdAt, thirtyDaysAgo))
      .groupBy(productClicks.productId)
      .as("click_counts");

    // Subquery: search log references (count of searches matching product name)
    const searchCounts = db
      .select({
        productId: products.id,
        searchCount: sql<number>`count(distinct ${searchLogs.id})`.as("search_count"),
      })
      .from(products)
      .innerJoin(
        searchLogs,
        sql`lower(${searchLogs.query}) like '%' || lower(${products.normalizedName}) || '%'`
      )
      .where(gte(searchLogs.createdAt, thirtyDaysAgo))
      .groupBy(products.id)
      .as("search_counts");

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        imageUrl: products.imageUrl,
        unit: products.unit,
        categoryName: categories.name,
        minPrice: sql<number>`min(${storeProducts.price})`.as("min_price"),
        storeCount: sql<number>`count(distinct ${storeProducts.branchId})`.as("store_count"),
        clickCount: sql<number>`coalesce(${clickCounts.clickCount}, 0)`.as("click_count"),
        searchCount: sql<number>`coalesce(${searchCounts.searchCount}, 0)`.as("search_count"),
        popularityScore:
          sql<number>`coalesce(${clickCounts.clickCount}, 0) + coalesce(${searchCounts.searchCount}, 0)`.as(
            "popularity_score"
          ),
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(storeProducts, and(
        eq(products.id, storeProducts.productId),
        isNotNull(storeProducts.branchId)
      ))
      .leftJoin(branches, and(
        eq(storeProducts.branchId, branches.id),
        eq(branches.approved, true),
        eq(branches.active, true)
      ))
      .leftJoin(vendors, and(
        eq(branches.vendorId, vendors.id),
        eq(vendors.approved, true),
        eq(vendors.active, true)
      ))
      .leftJoin(clickCounts, eq(products.id, clickCounts.productId))
      .leftJoin(searchCounts, eq(products.id, searchCounts.productId))
      .groupBy(
        products.id,
        products.name,
        products.imageUrl,
        products.unit,
        categories.name,
        clickCounts.clickCount,
        searchCounts.searchCount
      )
      .having(
        sql`coalesce(${clickCounts.clickCount}, 0) + coalesce(${searchCounts.searchCount}, 0) > 0 AND count(distinct ${vendors.id}) > 0`
      )
      .orderBy(
        sql`coalesce(${clickCounts.clickCount}, 0) + coalesce(${searchCounts.searchCount}, 0) desc`
      )
      .limit(10);

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        name: r.name,
        imageUrl: r.imageUrl,
        unit: r.unit,
        categoryName: r.categoryName,
        minPrice: r.minPrice ? Number(r.minPrice) : null,
        storeCount: Number(r.storeCount),
        clickCount: Number(r.clickCount),
        searchCount: Number(r.searchCount),
        popularityScore: Number(r.popularityScore),
      }))
    );
  } catch (error) {
    console.error("Popular products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular products" },
      { status: 500 }
    );
  }
}
