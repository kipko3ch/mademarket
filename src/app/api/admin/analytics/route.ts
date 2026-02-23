import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, vendors, branches, products, searchLogs, priceHistory, storeProducts } from "@/db/schema";
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
      [vendorCount],
      [branchCount],
      [productCount],
      [searchCount],
      topSearches,
      recentChanges,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(vendors),
      db.select({ count: sql<number>`count(*)` }).from(branches),
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
          branchName: branches.branchName,
          vendorName: vendors.name,
          oldPrice: priceHistory.oldPrice,
          newPrice: priceHistory.newPrice,
          changedAt: priceHistory.changedAt,
        })
        .from(priceHistory)
        .innerJoin(storeProducts, eq(priceHistory.storeProductId, storeProducts.id))
        .innerJoin(products, eq(storeProducts.productId, products.id))
        .innerJoin(branches, eq(storeProducts.branchId, branches.id))
        .innerJoin(vendors, eq(branches.vendorId, vendors.id))
        .orderBy(desc(priceHistory.changedAt))
        .limit(10),
    ]);

    return NextResponse.json({
      totalUsers: Number(userCount.count),
      totalVendors: Number(vendorCount.count),
      totalBranches: Number(branchCount.count),
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
