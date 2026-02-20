import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, stores, products, searchLogs, priceHistory, storeProducts } from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      [userCount],
      [storeCount],
      [productCount],
      [searchCount],
      topSearches,
      recentChanges,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(stores),
      db.select({ count: sql<number>`count(*)` }).from(products),
      db.select({ count: sql<number>`count(*)` }).from(searchLogs),
      db
        .select({
          query: searchLogs.query,
          count: sql<number>`count(*)`.as("count"),
        })
        .from(searchLogs)
        .groupBy(searchLogs.query)
        .orderBy(sql`count(*) desc`)
        .limit(10),
      db
        .select({
          productName: products.name,
          storeName: stores.name,
          oldPrice: priceHistory.oldPrice,
          newPrice: priceHistory.newPrice,
          changedAt: priceHistory.changedAt,
        })
        .from(priceHistory)
        .innerJoin(storeProducts, eq(priceHistory.storeProductId, storeProducts.id))
        .innerJoin(products, eq(storeProducts.productId, products.id))
        .innerJoin(stores, eq(storeProducts.storeId, stores.id))
        .orderBy(desc(priceHistory.changedAt))
        .limit(10),
    ]);

    return NextResponse.json({
      totalUsers: Number(userCount.count),
      totalStores: Number(storeCount.count),
      totalProducts: Number(productCount.count),
      totalSearches: Number(searchCount.count),
      topSearches: topSearches.map((s) => ({
        query: s.query,
        count: Number(s.count),
      })),
      recentPriceChanges: recentChanges,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
