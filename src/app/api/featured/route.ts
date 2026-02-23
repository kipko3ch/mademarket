export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { featuredProducts, products, storeProducts, categories } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

// GET /api/featured — Return active, non-expired featured products with product details
export async function GET() {
  try {
    const now = new Date();

    const rows = await db
      .select({
        id: featuredProducts.id,
        productId: featuredProducts.productId,
        priority: featuredProducts.priority,
        startsAt: featuredProducts.startsAt,
        expiresAt: featuredProducts.expiresAt,
        name: products.name,
        imageUrl: products.imageUrl,
        categoryName: categories.name,
        minPrice: sql<number>`min(${storeProducts.price})`.as("min_price"),
        storeCount: sql<number>`count(distinct ${storeProducts.branchId})`.as("store_count"),
      })
      .from(featuredProducts)
      .innerJoin(products, eq(featuredProducts.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(storeProducts, eq(products.id, storeProducts.productId))
      .where(
        and(
          eq(featuredProducts.active, true),
          gte(featuredProducts.expiresAt, now)
        )
      )
      .groupBy(
        featuredProducts.id,
        featuredProducts.productId,
        featuredProducts.priority,
        featuredProducts.startsAt,
        featuredProducts.expiresAt,
        products.name,
        products.imageUrl,
        categories.name
      )
      .orderBy(
        sql`case when ${featuredProducts.priority} = 'premium' then 0 else 1 end`,
        featuredProducts.startsAt
      );

    return NextResponse.json(
      rows.map((r) => ({
        ...r,
        minPrice: r.minPrice ? Number(r.minPrice) : null,
        storeCount: Number(r.storeCount),
      }))
    );
  } catch (error) {
    console.error("Featured products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured products" },
      { status: 500 }
    );
  }
}
