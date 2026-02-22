import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, vendors, branches, products, searchLogs } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
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
      [pendingVendorCount],
      [pendingBranchCount],
      [productCount],
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(vendors),
      db.select({ count: sql<number>`count(*)` }).from(branches),
      db
        .select({ count: sql<number>`count(*)` })
        .from(vendors)
        .where(eq(vendors.approved, false)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(branches)
        .where(eq(branches.approved, false)),
      db.select({ count: sql<number>`count(*)` }).from(products),
    ]);

    // Top searches
    const topSearches = await db
      .select({
        query: searchLogs.query,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(searchLogs)
      .groupBy(searchLogs.query)
      .orderBy(sql`count(*) desc`)
      .limit(10);

    return NextResponse.json({
      totalUsers: Number(userCount.count),
      totalVendors: Number(vendorCount.count),
      totalBranches: Number(branchCount.count),
      pendingVendors: Number(pendingVendorCount.count),
      pendingBranches: Number(pendingBranchCount.count),
      totalProducts: Number(productCount.count),
      topSearches: topSearches.map((s) => ({
        query: s.query,
        count: Number(s.count),
      })),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
