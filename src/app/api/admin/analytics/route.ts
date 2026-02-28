import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, vendors, branches, products, searchLogs, priceHistory, storeProducts, productClicks } from "@/db/schema";
import { sql, desc, eq, and, gte, lte } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const vendorId = searchParams.get("vendorId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateConditions = [];
  if (from) {
    const fromDate = new Date(from);
    if (!isNaN(fromDate.getTime())) {
      fromDate.setUTCHours(0, 0, 0, 0);
      dateConditions.push(gte(searchLogs.createdAt, fromDate));
    }
  }
  if (to) {
    const toDate = new Date(to);
    if (!isNaN(toDate.getTime())) {
      toDate.setUTCHours(23, 59, 59, 999);
      dateConditions.push(lte(searchLogs.createdAt, toDate));
    }
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
      db.select({ count: sql<number>`count(*)` }).from(searchLogs)
        .where(dateConditions.length > 0 ? and(...dateConditions) : undefined),
      db
        .select({
          query: searchLogs.query,
          count: sql<number>`cast(count(*) as int)`.as("count"),
        })
        .from(searchLogs)
        .where(dateConditions.length > 0 ? and(...dateConditions) : undefined)
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

    // Per-vendor breakdown
    const vendorStats = await db
      .select({
        vendorId: vendors.id,
        vendorName: vendors.name,
        vendorSlug: vendors.slug,
        approved: vendors.approved,
        active: vendors.active,
        branchCount: sql<number>`cast(count(distinct ${branches.id}) as int)`,
        productCount: sql<number>`cast(count(distinct ${storeProducts.id}) as int)`,
      })
      .from(vendors)
      .leftJoin(branches, eq(branches.vendorId, vendors.id))
      .leftJoin(storeProducts, eq(storeProducts.branchId, branches.id))
      .groupBy(vendors.id, vendors.name, vendors.slug, vendors.approved, vendors.active)
      .orderBy(desc(sql`count(distinct ${storeProducts.id})`));

    // Per-vendor clicks
    const vendorClicks = await db
      .select({
        vendorId: vendors.id,
        clickCount: sql<number>`cast(count(distinct ${productClicks.id}) as int)`,
      })
      .from(vendors)
      .leftJoin(branches, eq(branches.vendorId, vendors.id))
      .leftJoin(storeProducts, eq(storeProducts.branchId, branches.id))
      .leftJoin(productClicks, eq(productClicks.productId, storeProducts.productId))
      .groupBy(vendors.id);

    const clickMap = new Map(vendorClicks.map((v) => [v.vendorId, v.clickCount]));

    // Per-vendor price updates
    const vendorPriceUpdates = await db
      .select({
        vendorId: vendors.id,
        priceUpdateCount: sql<number>`cast(count(distinct ${priceHistory.id}) as int)`,
      })
      .from(vendors)
      .leftJoin(branches, eq(branches.vendorId, vendors.id))
      .leftJoin(storeProducts, eq(storeProducts.branchId, branches.id))
      .leftJoin(priceHistory, eq(priceHistory.storeProductId, storeProducts.id))
      .groupBy(vendors.id);

    const priceUpdateMap = new Map(vendorPriceUpdates.map((v) => [v.vendorId, v.priceUpdateCount]));

    const enrichedVendorStats = vendorStats.map((v) => ({
      ...v,
      clickCount: clickMap.get(v.vendorId) || 0,
      priceUpdateCount: priceUpdateMap.get(v.vendorId) || 0,
    }));

    // Vendor detail if filtering by vendorId
    let vendorDetail = null;
    if (vendorId) {
      const branchStats = await db
        .select({
          branchId: branches.id,
          branchName: branches.branchName,
          city: branches.city,
          area: branches.area,
          town: branches.town,
          productCount: sql<number>`cast(count(distinct ${storeProducts.id}) as int)`,
        })
        .from(branches)
        .leftJoin(storeProducts, eq(storeProducts.branchId, branches.id))
        .where(eq(branches.vendorId, vendorId))
        .groupBy(branches.id, branches.branchName, branches.city, branches.area, branches.town)
        .orderBy(desc(sql`count(distinct ${storeProducts.id})`));

      vendorDetail = { branchStats };
    }

    return NextResponse.json({
      totalUsers: Number(userCount.count),
      totalVendors: Number(vendorCount.count),
      totalBranches: Number(branchCount.count),
      totalProducts: Number(productCount.count),
      totalSearches: Number(searchCount.count),
      topSearches: topSearches.map((s) => ({ query: s.query, count: Number(s.count) })),
      recentPriceChanges: recentChanges,
      vendorStats: enrichedVendorStats,
      vendorDetail,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
